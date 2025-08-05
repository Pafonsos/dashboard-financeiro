const { app, initializeApp } = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Inicializar aplicação (validações, conexões, etc.)
    const initialized = await initializeApp();
    
    if (!initialized) {
      logger.error('Falha na inicialização da aplicação');
      process.exit(1);
    }

    // Iniciar servidor HTTP
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
      logger.info(`📊 Dashboard Financeiro API v1.0.0`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📅 Iniciado em: ${new Date().toISOString()}`);
    });

    // Configurar timeout do servidor
    server.timeout = 30000; // 30 segundos

    // Configurar keep-alive
    server.keepAliveTimeout = 61000; // 61 segundos
    server.headersTimeout = 62000; // 62 segundos

    // Tratamento de erros do servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Porta ${PORT} já está em uso`);
      } else if (error.code === 'EACCES') {
        logger.error(`❌ Permissão negada para porta ${PORT}`);
      } else {
        logger.error('❌ Erro no servidor:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`📴 Sinal ${signal} recebido. Encerrando servidor...`);
      
      server.close((err) => {
        if (err) {
          logger.error('❌ Erro ao encerrar servidor:', err);
          process.exit(1);
        }
        
        logger.info('✅ Servidor encerrado graciosamente');
        process.exit(0);
      });

      // Forçar encerramento após 30 segundos
      setTimeout(() => {
        logger.error('⚠️ Forçando encerramento...');
        process.exit(1);
      }, 30000);
    };

    // Registrar handlers para sinais de sistema
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Tratamento de exceções não capturadas
    process.on('uncaughtException', (error) => {
      logger.error('💥 Exceção não capturada:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Promise rejeitada não tratada:', reason);
      logger.error('Promise:', promise);
      process.exit(1);
    });

    return server;

  } catch (error) {
    logger.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Verificar se arquivo está sendo executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
