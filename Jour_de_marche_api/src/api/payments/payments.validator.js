const { body, param } = require('express-validator');

/**
 * Validation for payment processing
 */
exports.processPayment = [
  body('orderId')
    .isMongoId()
    .withMessage('ID commande invalide'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Montant doit être > 0'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'cash', 'mobile_money'])
    .withMessage('Méthode de paiement invalide'),
  body('provider')
    .isIn(['stripe', 'paypal', 'mock', 'bank', 'cash'])
    .withMessage('Fournisseur de paiement invalide'),
];

/**
 * Validation for payment refund
 */
exports.refund = [
  param('transactionId')
    .isMongoId()
    .withMessage('ID transaction invalide'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Raison max 500 caractères'),
];
