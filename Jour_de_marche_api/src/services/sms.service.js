const logger = require('../../config/logger');

const smsService = {
  sendSMS: async (phoneNumber, message) => {
    try {
      // À implémenter avec Twilio ou autre provider
      logger.info(`📱 SMS envoyé à ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi du SMS:', error.message);
      return false;
    }
  },

  sendOrderNotification: async (phoneNumber, orderNumber) => {
    return smsService.sendSMS(
      phoneNumber,
      `Votre commande ${orderNumber} a été confirmée. Suivi: https://jour-de-marche.com/orders/${orderNumber}`
    );
  },

  sendDeliveryNotification: async (phoneNumber, deliveryNumber) => {
    return smsService.sendSMS(
      phoneNumber,
      `Votre livraison ${deliveryNumber} est en route. Suivi en direct sur l'app.`
    );
  },
};

module.exports = smsService;
