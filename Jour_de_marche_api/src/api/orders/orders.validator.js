const { body } = require('express-validator');

/**
 * Validation rules for order creation
 */
exports.create = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Au moins un produit est requis'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('ID produit invalide'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantité doit être >= 1'),
  body('items.*.price')
    .isFloat({ min: 0.01 })
    .withMessage('Prix invalide'),
  body('deliveryAddress')
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Adresse de livraison requise (min 10 caractères)'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'cash', 'mobile_money'])
    .withMessage('Méthode de paiement invalide'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes max 500 caractères'),
];

/**
 * Validation rules for order status update
 */
exports.updateStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled'])
    .withMessage('Statut invalide'),
];
