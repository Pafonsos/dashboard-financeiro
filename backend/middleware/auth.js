const { verifyToken } = require('../config/auth');
const { executeQuery } = require('../config/database');
const logger = require('../utils/logger');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    // Verificar token
    const decoded = verifyToken(token);
    
    // Verificar se usuário ainda existe e está ativo
    const userResult = await executeQuery(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const user = userResult.data[0];
    
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Conta desativada'
      });
    }
    
    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    next();
    
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    
    if (error.message === 'Token inválido' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar permissões por papel
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente'
      });
    }
    
    next();
  };
};

// Middleware para verificar se usuário é admin
const requireAdmin = requireRole('admin');

// Middleware para verificar se usuário é manager ou admin
const requireManager = requireRole('admin', 'manager');

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = verifyToken(token);
    
    const userResult = await executeQuery(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (userResult.success && userResult.data.length > 0) {
      const user = userResult.data[0];
      if (user.status === 'active') {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    }
    
    next();
    
  } catch (error) {
    // Em caso de erro, continua sem usuário
    req.user = null;
    next();
  }
};

// Middleware para verificar propriedade de recursos
const requireOwnership = (resourceType, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const userId = req.user.id;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID do recurso não fornecido'
        });
      }
      
      let query = '';
      let tableName = '';
      
      switch (resourceType) {
        case 'transaction':
          tableName = 'transactions';
          break;
        case 'client':
          tableName = 'clients';
          break;
        case 'service':
          tableName = 'services';
          break;
        case 'invoice':
          tableName = 'invoices';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tipo de recurso inválido'
          });
      }
      
      query = `SELECT id FROM ${tableName} WHERE id = ? AND user_id = ?`;
      
      const result = await executeQuery(query, [resourceId, userId]);
      
      if (!result.success || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} não encontrado ou você não tem permissão para acessá-lo`
        });
      }
      
      next();
      
    } catch (error) {
      logger.error('Erro na verificação de propriedade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware para logging de ações
const logAction = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log apenas se a ação foi bem-sucedida
      if (res.statusCode < 400) {
        logger.info(`Ação: ${action} | Usuário: ${req.user?.email || 'Anônimo'} | IP: ${req.ip}`);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware para verificar se o usuário pode acessar dados de outros usuários
const canAccessUserData = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.query.userId;
    const currentUser = req.user;
    
    // Se não especificou usuário alvo, usar o usuário atual
    if (!targetUserId) {
      return next();
    }
    
    // Admin pode acessar dados de qualquer usuário
    if (currentUser.role === 'admin') {
      return next();
    }
    
    // Manager pode acessar dados de usuários da mesma organização
    if (currentUser.role === 'manager') {
      // Aqui você implementaria a lógica de verificação de organização
      // Por simplicidade, vamos permitir
      return next();
    }
    
    // Usuário comum só pode acessar seus próprios dados
    if (parseInt(targetUserId) !== currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar dados de outros usuários'
      });
    }
    
    next();
    
  } catch (error) {
    logger.error('Erro na verificação de acesso a dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager,
  optionalAuth,
  requireOwnership,
  logAction,
  canAccessUserData
};
