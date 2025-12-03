const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../../config/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Erreur d\'authentification:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
    });
  }
};

module.exports = authMiddleware;
