const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

const connectDB = async () => {
  try {
    logger.info('🔄 Connexion à MongoDB...');
    
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    
    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('❌ Erreur de connexion MongoDB:', error.message);
    throw error; // Re-throw pour que le caller gère l'erreur
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('✅ Déconnecté de MongoDB');
  } catch (error) {
    logger.error('❌ Erreur lors de la déconnexion MongoDB:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
