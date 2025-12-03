try {
  const app = require('./app');
  const config = require('../config');
  const logger = require('../config/logger');
  const { connectDB } = require('../config/db');
  const { connectRedis } = require('../config/redis');

  const startServer = async () => {
    try {
      console.log('🚀 Démarrage du serveur...');
      
      // Connect to databases (optionnel)
      try {
        await connectDB();
      } catch (dbError) {
        console.warn('⚠️ Impossible de se connecter à MongoDB - mode standalone', dbError.message);
      }

      // Redis is optional - only connect if enabled
      if (process.env.USE_REDIS !== 'false') {
        try {
          await connectRedis();
        } catch (redisError) {
          console.warn('⚠️ Impossible de se connecter à Redis - Redis optionnel', redisError.message);
        }
      }

      // Start HTTP server
      const server = app.listen(config.port, config.host, () => {
        console.log(`✅ Serveur démarré sur http://${config.host}:${config.port}`);
        console.log(`🔧 Environnement: ${config.nodeEnv}`);
      });

      // Graceful shutdown
      const gracefulShutdown = async (signal) => {
        console.log(`ℹ️ Signal ${signal} reçu, arrêt du serveur...`);
        server.close(async () => {
          console.log('✅ Serveur HTTP fermé');
          process.exit(0);
        });

        setTimeout(() => {
          console.error('❌ Impossible d\'arrêter le serveur gracieusement, arrêt forcé');
          process.exit(1);
        }, 30000);
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      process.on('unhandledRejection', (err) => {
        console.error('❌ Unhandled Rejection:', err);
      });

      process.on('uncaughtException', (err) => {
        console.error('❌ Uncaught Exception:', err);
        process.exit(1);
      });

    } catch (error) {
      console.error('❌ Erreur au démarrage:', error.message);
      console.error(error);
      process.exit(1);
    }
  };

  startServer();
} catch (error) {
  console.error('❌ ERREUR CRITIQUE:', error.message);
  console.error(error);
  process.exit(1);
}