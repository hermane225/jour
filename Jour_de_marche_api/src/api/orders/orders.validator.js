const { body } = require('express-validator');

/**
 * Validation rules for order creation
 */
exports.create = [
  body('shopId')
    .isMongoId()
    .withMessage('ID boutique invalide'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Au moins un produit est requis'),
  body('items.*.product')
    .isMongoId()
    .withMessage('ID produit invalide'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantité doit être >= 1'),
  body('items.*.price')
    .isFloat({ min: 0.01 })
    .withMessage('Prix invalide'),
  body('deliveryType')
    .optional()
    .isIn(['delivery', 'pickup'])
    .withMessage('Type de livraison invalide (delivery ou pickup)'),
  body('deliveryAddress')
    .optional()
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
 * Status flow: pending -> confirmed -> preparing -> ready_for_pickup (if pickup) OR in_delivery (if delivery) -> delivered -> cancelled
 */
exports.updateStatus = [
  body('status')
    .isIn([
      'pending',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'in_delivery',
      'delivered',
      'cancelled',
      'refunded'
    ])
    .withMessage('Statut invalide'),
];
