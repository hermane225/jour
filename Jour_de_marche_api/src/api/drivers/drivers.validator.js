const { body, param } = require('express-validator');

/**
 * Validation for delivery assignment
 */
exports.assign = [
  body('orderId')
    .isMongoId()
    .withMessage('ID commande invalide'),
  body('driverId')
    .isMongoId()
    .withMessage('ID livreur invalide'),
];

/**
 * Validation for delivery status update
 */
exports.updateStatus = [
  param('deliveryId')
    .isMongoId()
    .withMessage('ID livraison invalide'),
  body('status')
    .isIn(['assigned', 'picked_up', 'on_way', 'arrived', 'delivered', 'failed'])
    .withMessage('Statut invalide'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Localisation invalide'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes max 500 caractères'),
];

/**
 * Validation for delivery rating
 */
exports.rate = [
  param('deliveryId')
    .isMongoId()
    .withMessage('ID livraison invalide'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Note doit être entre 1 et 5'),
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Commentaire max 500 caractères'),
];
