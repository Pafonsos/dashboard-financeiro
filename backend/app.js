const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const { testConnection } = require('./config/database');
const { validateConfig } = require('./config/environment');
const logger = require('./utils/logger');

// Importar middlewares de segurança
const {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  helmetConfig,
  cors,
  sanitizeXSS,
  detectSQLInjection,
  securityLogger,
  validateUserAgent,
  limitBodySize
} = require('./middleware/security');

// Importar rotas
const authRoutes = require('./routes/auth');
const financialRoutes = require('./routes/financial');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware básicos
app.use(helmetConfig); // Segurança de headers
app.use(cors); // CORS
app.use(compression()); // Compressão gzip
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parser URL encoded
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // Logging HTTP

// Middlewares de segurança
app.use(validateUserAgent); // Validar User-Agent
app.use(limitBodySize('10mb')); // Limitar tamanho do body
app.use(securityLogger); // Log de segurança
app.use(sanitizeXSS); // Sanitizar XSS
app.use(detectSQLInjection); // Detectar SQL Injection

// Rate limiting geral
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Info
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Financial Dashboard API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// Rotas da API
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/reports', reportRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  logger.error('Erro não tratado:', error);

  // Erro de validação do express-validator
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details
    });
  }

  // Erro de token JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }

  // Erro de conexão com banco
  if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível'
    });
  }

  // Erro de limite de tamanho
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload muito grande'
    });
  }

  // Erro de timeout
  if (error.code === 'ETIMEDOUT') {
    return res.status(408).json({
      success: false,
      message: 'Tempo limite da requisição excedido'
    });
  }

  // Erro genérico em produção
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }

  // Erro detalhado em desenvolvimento
  res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack
  });
});

// Função para inicializar a aplicação
const initializeApp = async () => {
  try {
    // Validar configurações
    validateConfig();
    logger.info('✅ Configurações validadas');

    // Testar conexão com banco de dados
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Falha na conexão com banco de dados');
    }

    logger.info('✅ Aplicação inicializada com sucesso');
    return true;
  } catch (error) {
    logger.error('❌ Erro na inicialização:', error.message);
    return false;
  }
};

// Tratamento de sinais do sistema para graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando aplicação graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando aplicação graciosamente...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = { app, initializeApp };
