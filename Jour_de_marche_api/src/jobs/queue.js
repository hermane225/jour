const Queue = require('bull');
const config = require('../../config');
const logger = require('../../config/logger');

const queues = {};

// Extraire la configuration Redis depuis l'URL pour Bull
const getRedisConfig = () => {
  const redisUrl = config.bull.redisUrl;
  
  // Si l'URL commence par rediss://, c'est une connexion TLS (Upstash)
  if (redisUrl.startsWith('rediss://')) {
    return {
      redis: {
        tls: {},
      },
    };
  }
  
  return {};
};

const initializeQueue = (queueName) => {
  if (!queues[queueName]) {
    const redisConfig = getRedisConfig();
    queues[queueName] = new Queue(queueName, config.bull.redisUrl, redisConfig);

    queues[queueName].on('error', (error) => {
      logger.error(`❌ Erreur queue ${queueName}:`, error.message);
    });

    queues[queueName].on('active', (job) => {
      logger.info(`⏳ Job actif: ${queueName}#${job.id}`);
    });

    queues[queueName].on('completed', (job) => {
      logger.info(`✅ Job complété: ${queueName}#${job.id}`);
    });

    queues[queueName].on('failed', (job, error) => {
      logger.error(`❌ Job échoué: ${queueName}#${job.id} - ${error.message}`);
    });
  }

  return queues[queueName];
};

const getQueue = (queueName) => {
  return queues[queueName] || initializeQueue(queueName);
};

const addJob = async (queueName, data, options = {}) => {
  const queue = getQueue(queueName);
  return queue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    ...options,
  });
};

const closeQueues = async () => {
  for (const queueName in queues) {
    await queues[queueName].close();
  }
};

module.exports = {
  initializeQueue,
  getQueue,
  addJob,
  closeQueues,
};
