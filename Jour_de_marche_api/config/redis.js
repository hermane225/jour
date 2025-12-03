const redis = require('redis');
const config = require('./index');
const logger = require('./logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    logger.info('🔄 Connexion à Redis...');
    
    redisClient = redis.createClient({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('Redis refuse la connexion');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Redis: Tentatives de reconnexion expirées');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      },
    });

    redisClient.on('error', (err) => {
      logger.error('❌ Erreur Redis:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connecté');
    });

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
      redisClient.quit();
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
