const { getQueue } = require('./queue');
const notificationsJob = require('./jobs/notifications.job');
const payoutsJob = require('./jobs/payouts.job');
const logger = require('../../config/logger');

const initializeWorkers = async () => {
  try {
    logger.info('🔧 Initialisation des workers...');

    // Notifications worker
    const notificationsQueue = getQueue('notifications');
    notificationsQueue.process(notificationsJob);

    // Payouts worker
    const payoutsQueue = getQueue('payouts');
    payoutsQueue.process(payoutsJob);

    logger.info('✅ Workers initialisés');
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation des workers:', error.message);
  }
};

module.exports = initializeWorkers;
