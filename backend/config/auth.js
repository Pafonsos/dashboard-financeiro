const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_ROUNDS
} = process.env;

// Configurações JWT
const jwtConfig = {
  secret: JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: JWT_EXPIRES_IN || '15m',
  refreshSecret: JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  refreshExpiresIn: JWT_REFRESH_EXPIRES_IN || '7d'
};

// Configurações de hash
const hashConfig = {
  saltRounds: parseInt(BCRYPT_ROUNDS) || 12
};

// Gerar JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

// Gerar Refresh Token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn
  });
};

// Verificar JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Verificar Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch (error) {
    throw new Error('Refresh token inválido');
  }
};

// Hash da senha
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, hashConfig.saltRounds);
  } catch (error) {
    throw new Error('Erro ao criptografar senha');
  }
};

// Comparar senha
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Erro ao comparar senha');
  }
};

// Gerar token aleatório para reset de senha
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Gerar salt para criptografia adicional
const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Criptografar dados sensíveis
const encryptData = (data, key = jwtConfig.secret) => {
  const algorithm = 'aes-256-cbc';
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Descriptografar dados sensíveis
const decryptData = (encryptedData, key = jwtConfig.secret) => {
  const algorithm = 'aes-256-cbc';
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Validar força da senha
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Senha deve conter pelo menos um número' };
  }
  if (!hasNonalphas) {
    return { valid: false, message: 'Senha deve conter pelo menos um caractere especial' };
  }

  return { valid: true, message: 'Senha válida' };
};

module.exports = {
  jwtConfig,
  hashConfig,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  generateResetToken,
  generateSalt,
  encryptData,
  decryptData,
  validatePasswordStrength
};
