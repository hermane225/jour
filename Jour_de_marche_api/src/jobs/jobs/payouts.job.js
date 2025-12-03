const logger = require('../../../config/logger');

const payoutsJob = async (job) => {
  try {
    const { shopId, amount } = job.data;
    logger.info(`💰 Traitement du versement: ${amount} EUR pour la boutique ${shopId}`);
    
    // À implémenter: logique de versement des gains
    
    return { success: true };
  } catch (error) {
    logger.error('❌ Erreur dans la tâche de versement:', error.message);
    throw error;
  }
};

module.exports = payoutsJob;
