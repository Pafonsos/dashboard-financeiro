require('dotenv').config();

const config = {
  // Ambiente
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'financial_dashboard',
    port: process.env.DB_PORT || 3306
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutTime: parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000, // 15 minutos
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000 // 30 minutos
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  // Email (para reset de senha)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@empresa.com'
  },
  
  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf', 'xlsx', 'csv'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },
  
  // API
  api: {
    version: process.env.API_VERSION || 'v1',
    baseUrl: process.env.API_BASE_URL || '/api',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000
  },
  
  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutos
    max: parseInt(process.env.CACHE_MAX) || 1000
  },
  
  // Business Rules
  business: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'BRL',
    taxRate: parseFloat(process.env.TAX_RATE) || 0.1, // 10%
    fiscalYearStart: process.env.FISCAL_YEAR_START || '01-01',
    reportRetentionDays: parseInt(process.env.REPORT_RETENTION_DAYS) || 365
  }
};

// Validações de ambiente
const validateConfig = () => {
  const requiredVars = [];
  
  if (config.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key') {
      requiredVars.push('JWT_SECRET');
    }
    if (!process.env.DB_PASSWORD) {
      requiredVars.push('DB_PASSWORD');
    }
  }
  
  if (requiredVars.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${requiredVars.join(', ')}`);
  }
};

// Função para obter configuração por chave
const get = (key, defaultValue = null) => {
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    value = value[k];
    if (value === undefined) {
      return defaultValue;
    }
  }
  
  return value;
};

// Função para definir se está em produção
const isProduction = () => config.NODE_ENV === 'production';
const isDevelopment = () => config.NODE_ENV === 'development';
const isTest = () => config.NODE_ENV === 'test';

module.exports = {
  ...config,
  validateConfig,
  get,
  isProduction,
  isDevelopment,
  isTest
};
