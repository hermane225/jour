const redis = require('redis');
const config = require('./index');
const logger = require('./logger');

let redisClient = null;

const connectRedis = async () => {
  // Vérifier si Redis est activé
  if (!config.redis.enabled) {
    logger.info('ℹ️ Redis désactivé (USE_REDIS=false)');
    return null;
  }

  try {
    logger.info('🔄 Connexion à Redis...');
    
    // Configuration pour Redis moderne (v4+)
    const redisOptions = {
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        tls: config.redis.tls,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis: Nombre maximum de tentatives atteint');
            return new Error('Redis: Tentatives de reconnexion expirées');
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: config.redis.password || undefined,
      database: config.redis.db,
    };

    redisClient = redis.createClient(redisOptions);

    redisClient.on('error', (err) => {
      logger.error('❌ Erreur Redis:', err.message);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connecté à ' + config.redis.host);
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis prêt');
    });

    // Connexion avec la nouvelle API
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('❌ Erreur de connexion Redis:', error.message);
    // Ne pas exit, Redis est optionnel
    return null;
  }
};

const getRedisClient = () => redisClient;

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('✅ Déconnecté de Redis');
    } catch (error) {
      logger.error('❌ Erreur lors de la déconnexion Redis:', error.message);
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
};
