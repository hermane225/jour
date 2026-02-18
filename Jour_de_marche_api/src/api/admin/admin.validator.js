const { body, param } = require('express-validator');

/**
 * Validation for setting update
 */
exports.updateSetting = [
  body('key')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Clé invalide'),
  body('value')
    .notEmpty()
    .withMessage('Valeur requise'),
];

/**
 * Validation for user role update
 */
exports.updateUserRole = [
  param('userId')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),
  body('role')
    .isIn(['customer', 'admin'])
    .withMessage('Rôle invalide'),
];

/**
 * Validation for sending notification
 */
exports.sendNotification = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('Au moins un utilisateur requis'),
  body('userIds.*')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Titre requis'),
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message requis'),
  body('type')
    .isIn(['info', 'warning', 'error', 'success'])
    .withMessage('Type invalide'),
];

/**
 * Validation for order status update
 */
exports.updateOrderStatus = [
  param('orderId')
    .isMongoId()
    .withMessage('ID commande invalide'),
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'])
    .withMessage('Statut invalide'),
];

/**
 * Validation for user status update
 */
exports.updateUserStatus = [
  param('userId')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),
  body('status')
    .isIn(['active', 'inactive', 'suspended', 'deleted'])
    .withMessage('Statut invalide'),
];

