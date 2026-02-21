try {
  const fs = require('fs');
  const path = require('path');
  const app = require('./app');
  const config = require('../config');
  const logger = require('../config/logger');
  const { connectDB } = require('../config/db');
  const { connectRedis } = require('../config/redis');

  const startServer = async () => {
    try {
      console.log('Starting server...');

      const uploadDir = path.resolve(config.storage.path);
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info(`UPLOAD_DIR ready: ${uploadDir}`);

      try {
        await connectDB();
      } catch (dbError) {
        console.warn('Could not connect to MongoDB - standalone mode', dbError.message);
      }

      if (process.env.USE_REDIS !== 'false') {
        try {
          await connectRedis();
        } catch (redisError) {
          console.warn('Could not connect to Redis - optional service', redisError.message);
        }
      }

      const server = app.listen(config.port, config.host, () => {
        console.log(`Server started on http://${config.host}:${config.port}`);
        console.log(`Environment: ${config.nodeEnv}`);
      });

      const gracefulShutdown = async (signal) => {
        console.log(`Signal ${signal} received, shutting down...`);
        server.close(async () => {
          console.log('HTTP server closed');
          process.exit(0);
        });

        setTimeout(() => {
          console.error('Forced shutdown after timeout');
          process.exit(1);
        }, 30000);
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      process.on('unhandledRejection', (err) => {
        console.error('Unhandled Rejection:', err);
      });

      process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
      });
    } catch (error) {
      console.error('Startup error:', error.message);
      console.error(error);
      process.exit(1);
    }
  };

  startServer();
} catch (error) {
  console.error('Critical startup error:', error.message);
  console.error(error);
  process.exit(1);
}