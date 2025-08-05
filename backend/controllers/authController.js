const { executeQuery } = require('../config/database');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  generateResetToken,
  validatePasswordStrength
} = require('../config/auth');
const logger = require('../utils/logger');
const { validateEmail, sanitizeInput } = require('../utils/validators');

// Cache para controle de tentativas de login
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

// Registro de usuário
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }
    
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }
    
    // Verificar se usuário já existe
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.success && existingUser.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }
    
    // Hash da senha
    const hashedPassword = await hashPassword(password);
    
    // Inserir usuário
    const result = await executeQuery(
      `INSERT INTO users (name, email, password, role, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [sanitizeInput(name), email.toLowerCase(), hashedPassword, role]
    );
    
    if (!result.success) {
      throw new Error('Erro ao criar usuário');
    }
    
    logger.info(`Usuário registrado: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso'
    });
    
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }
    
    // Verificar tentativas de login
    const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
    const now = Date.now();
    
    if (attempts.count >= MAX_LOGIN_ATTEMPTS && 
        now - attempts.lastAttempt < LOCKOUT_TIME) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
      });
    }
    
    // Buscar usuário
    const userResult = await executeQuery(
      `SELECT id, name, email, password, role, status, last_login 
       FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );
    
    if (!userResult.success || userResult.data.length === 0) {
      // Incrementar tentativas
      loginAttempts.set(clientIP, {
        count: attempts.count + 1,
        lastAttempt: now
      });
      
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    const user = userResult.data[0];
    
    // Verificar se usuário está ativo
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      });
    }
    
    // Verificar senha
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      // Incrementar tentativas
      loginAttempts.set(clientIP, {
        count: attempts.count + 1,
        lastAttempt: now
      });
      
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    // Login bem-sucedido - limpar tentativas
    loginAttempts.delete(clientIP);
    
    // Atualizar último login
    await executeQuery(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );
    
    // Gerar tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    // Salvar refresh token no banco
    await executeQuery(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [user.id, refreshToken]
    );
    
    logger.info(`Login realizado: ${email} (IP: ${clientIP})`);
    
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.last_login
        }
      }
    });
    
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token é obrigatório'
      });
    }
    
    // Verificar token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Verificar se token existe no banco
    const tokenResult = await executeQuery(
      `SELECT rt.*, u.name, u.email, u.role, u.status 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = ? AND rt.expires_at > NOW()`,
      [refreshToken]
    );
    
    if (!tokenResult.success || tokenResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      });
    }
    
    const user = tokenResult.data[0];
    
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Conta desativada'
      });
    }
    
    // Gerar novo access token
    const tokenPayload = {
      id: user.user_id,
      email: user.email,
      role: user.role
    };
    
    const newAccessToken = generateToken(tokenPayload);
    
    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    logger.error('Erro no refresh token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Remover refresh token do banco
      await executeQuery(
        'DELETE FROM refresh_tokens WHERE token = ?',
        [refreshToken]
      );
    }
    
    logger.info(`Logout realizado: ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Solicitar reset de senha
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email válido é obrigatório'
      });
    }
    
    // Verificar se usuário existe
    const userResult = await executeQuery(
      'SELECT id, name FROM users WHERE email = ? AND status = "active"',
      [email.toLowerCase()]
    );
    
    // Sempre retornar sucesso para não revelar se email existe
    if (userResult.success && userResult.data.length > 0) {
      const user = userResult.data[0];
      const resetToken = generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      
      // Salvar token de reset
      await executeQuery(
        `INSERT INTO password_resets (user_id, token, expires_at) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
        [user.id, resetToken, expiresAt]
      );
      
      // Aqui você enviaria o email com o token
      // emailService.sendResetPassword(email, resetToken);
      
      logger.info(`Reset de senha solicitado: ${email}`);
    }
    
    res.json({
      success: true,
      message: 'Se o email existir, você receberá as instruções de reset'
    });
    
  } catch (error) {
    logger.error('Erro no forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Reset de senha
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token e nova senha são obrigatórios'
      });
    }
    
    // Validar força da senha
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }
    
    // Verificar token
    const resetResult = await executeQuery(
      `SELECT pr.user_id, u.email 
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token = ? AND pr.expires_at > NOW()`,
      [token]
    );
    
    if (!resetResult.success || resetResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
    
    const { user_id, email } = resetResult.data[0];
    
    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);
    
    // Atualizar senha
    await executeQuery(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user_id]
    );
    
    // Remover token usado
    await executeQuery(
      'DELETE FROM password_resets WHERE user_id = ?',
      [user_id]
    );
    
    // Invalidar todos os refresh tokens do usuário
    await executeQuery(
      'DELETE FROM refresh_tokens WHERE user_id = ?',
      [user_id]
    );
    
    logger.info(`Senha resetada: ${email}`);
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    logger.error('Erro no reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};
