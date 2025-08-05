const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss');
const logger = require('../utils/logger');

// Rate limiting - limite geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente em 15 minutos.'
    });
  }
});

// Rate limiting para login - mais restritivo
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn(`Tentativas de login excedidas para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    });
  }
});

// Rate limiting para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    success: false,
    message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
  },
  handler: (req, res) => {
    logger.warn(`Tentativas de registro excedidas para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
    });
  }
});

// Rate limiting para reset de senha
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 tentativas por IP
  message: {
    success: false,
    message: 'Muitas tentativas de reset de senha. Tente novamente em 1 hora.'
  },
  handler: (req, res) => {
    logger.warn(`Tentativas de reset de senha excedidas para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de reset de senha. Tente novamente em 1 hora.'
    });
  }
});

// Configuração do Helmet para segurança de headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Configuração do CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 horas
};

// Middleware para sanitizar XSS
const sanitizeXSS = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key], {
          whiteList: {}, // Remove todas as tags HTML
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script']
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  
  next();
};

// Middleware para detectar e bloquear ataques de SQL Injection básicos
const detectSQLInjection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION(?:\s+ALL)?\s+SELECT/i,
    /SELECT.*FROM.*WHERE/i,
    /INSERT\s+INTO/i,
    /DELETE\s+FROM/i,
    /UPDATE.*SET/i,
    /CREATE\s+(TABLE|DATABASE)/i,
    /DROP\s+(TABLE|DATABASE)/i,
    /ALTER\s+TABLE/i,
    /TRUNCATE\s+TABLE/i
  ];
  
  const checkForSQLInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of sqlInjectionPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSQLInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  let suspiciousActivity = false;
  
  if (req.body && checkForSQLInjection(req.body)) {
    suspiciousActivity = true;
  }
  
  if (req.query && checkForSQLInjection(req.query)) {
    suspiciousActivity = true;
  }
  
  if (req.params && checkForSQLInjection(req.params)) {
    suspiciousActivity = true;
  }
  
  if (suspiciousActivity) {
    logger.warn(`Possível SQL Injection detectado - IP: ${req.ip}, URL: ${req.url}, User-Agent: ${req.get('User-Agent')}`);
    return res.status(400).json({
      success: false,
      message: 'Requisição inválida detectada'
    });
  }
  
  next();
};

// Middleware para logging de segurança
const securityLogger = (req, res, next) => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  const forwardedFor = req.get('X-Forwarded-For');
  const realIP = req.get('X-Real-IP');
  const clientIP = forwardedFor || realIP || req.ip;
  
  // Log de requests suspeitos
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scan/i,
    /attack/i,
    /hack/i,
    /exploit/i,
    /nikto/i,
    /sqlmap/i,
    /nmap/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logger.warn(`User-Agent suspeito: ${userAgent} - IP: ${clientIP}`);
  }
  
  // Log de tentativas de acesso a rotas administrativas
  if (req.url.includes('/admin') && req.user?.role !== 'admin') {
    logger.warn(`Tentativa de acesso não autorizado a rota admin - IP: ${clientIP}, User: ${req.user?.email || 'Anônimo'}`);
  }
  
  next();
};

// Middleware para prevenir ataques de força bruta em endpoints específicos
const bruteForceProtection = (maxAttempts = 10, windowMs = 60000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = `${req.ip}:${req.url}`;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const attempt = attempts.get(key);
    
    if (now > attempt.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (attempt.count >= maxAttempts) {
      logger.warn(`Força bruta detectada - IP: ${req.ip}, Endpoint: ${req.url}`);
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente mais tarde.'
      });
    }
    
    attempt.count++;
    next();
  };
};

// Middleware para validar User-Agent
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent || userAgent.length < 10) {
    logger.warn(`User-Agent inválido ou ausente - IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      message: 'Requisição inválida'
    });
  }
  
  next();
};

// Middleware para prevenir ataques de timing
const addRandomDelay = (minMs = 100, maxMs = 500) => {
  return (req, res, next) => {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    setTimeout(next, delay);
  };
};

// Middleware para limitar tamanho do body
const limitBodySize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length')) || 0;
    const maxBytes = typeof maxSize === 'string' ? 
      parseInt(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1024) : 
      maxSize;
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: 'Payload muito grande'
      });
    }
    
    next();
  };
};

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  helmetConfig,
  cors: cors(corsOptions),
  sanitizeXSS,
  detectSQLInjection,
  securityLogger,
  bruteForceProtection,
  validateUserAgent,
  addRandomDelay,
  limitBodySize
};
