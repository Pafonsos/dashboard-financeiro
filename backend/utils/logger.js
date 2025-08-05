const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuração de formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\nStack: ${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Configuração de formato para console (mais limpo)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Configuração dos transportes
const transports = [
  // Console para desenvolvimento
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true
  }),

  // Arquivo para todos os logs
  new winston.transports.File({
    filename: path.join(logDir, 'app.log'),
    level: 'info',
    format: customFormat,
    maxsize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    tailable: true,
    handleExceptions: true,
    handleRejections: true
  }),

  // Arquivo específico para erros
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    tailable: true,
    handleExceptions: true,
    handleRejections: true
  }),

  // Arquivo para logs de segurança
  new winston.transports.File({
    filename: path.join(logDir, 'security.log'),
    level: 'warn',
    format: customFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    tailable: true
  })
];

// Criar o logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test'
});

// Adicionar métodos personalizados
logger.security = (message, meta = {}) => {
  logger.warn(`SECURITY: ${message}`, { security: true, ...meta });
};

logger.audit = (message, meta = {}) => {
  logger.info(`AUDIT: ${message}`, { audit: true, ...meta });
};

logger.performance = (message, meta = {}) => {
  logger.info(`PERFORMANCE: ${message}`, { performance: true, ...meta });
};

logger.database = (message, meta = {}) => {
  logger.info(`DATABASE: ${message}`, { database: true, ...meta });
};

// Método para criar logger de contexto específico
logger.child = (context) => {
  return {
    info: (message, meta = {}) => logger.info(message, { context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
    error: (message, meta = {}) => logger.error(message, { context, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { context, ...meta }),
    security: (message, meta = {}) => logger.security(message, { context, ...meta }),
    audit: (message, meta = {}) => logger.audit(message, { context, ...meta })
  };
};

// Método para log de requisições HTTP
logger.httpRequest = (req, res) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      userEmail: req.user?.email
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
};

// Método para log de queries do banco
logger.query = (query, params, executionTime) => {
  logger.database('Query executed', {
    query: query.replace(/\s+/g, ' ').trim(),
    params: params?.length > 0 ? params : undefined,
    executionTime: executionTime ? `${executionTime}ms` : undefined
  });
};

// Stream para o Morgan (logging HTTP)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Em produção, não mostrar logs debug no console
if (process.env.NODE_ENV === 'production') {
  logger.transports.forEach(transport => {
    if (transport instanceof winston.transports.Console) {
      transport.level = 'warn';
    }
  });
}

// Tratamento de erros do logger
logger.on('error', (error) => {
  console.error('Erro no logger:', error);
});

module.exports = logger;
