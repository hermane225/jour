const notificationService = require('../../services/notification.service');
const logger = require('../../../config/logger');

const notificationsJob = async (job) => {
  try {
    const { userId, type, data } = job.data;
    logger.info(`📤 Traitement de la notification: ${type} pour ${userId}`);
    
    await notificationService.sendNotification(userId, type, data);
    
    return { success: true };
  } catch (error) {
    logger.error('❌ Erreur dans la tâche de notification:', error.message);
    throw error;
  }
};

module.exports = notificationsJob;
