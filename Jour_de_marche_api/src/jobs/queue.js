const Queue = require('bull');
const config = require('../../config');
const logger = require('../../config/logger');

const queues = {};

const initializeQueue = (queueName) => {
  if (!queues[queueName]) {
    queues[queueName] = new Queue(queueName, config.bull.redisUrl);

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
