const { body, param } = require('express-validator');

const cartValidators = {
  addItem: [
    body('productId')
      .notEmpty()
      .withMessage('L\'ID du produit est requis')
      .isMongoId()
      .withMessage('ID de produit invalide'),
    body('quantity')
      .notEmpty()
      .withMessage('La quantité est requise')
      .isInt({ min: 1 })
      .withMessage('La quantité doit être au moins 1'),
    body('selectedVariants')
      .optional()
      .isObject()
      .withMessage('Les variantes doivent être un objet'),
  ],

  updateQuantity: [
    param('itemId')
      .notEmpty()
      .withMessage('L\'ID de l\'article est requis')
      .isMongoId()
      .withMessage('ID d\'article invalide'),
    body('quantity')
      .notEmpty()
      .withMessage('La quantité est requise')
      .isInt({ min: 1 })
      .withMessage('La quantité doit être au moins 1'),
  ],

  removeItem: [
    param('itemId')
      .notEmpty()
      .withMessage('L\'ID de l\'article est requis')
      .isMongoId()
      .withMessage('ID d\'article invalide'),
  ],

  updateDeliveryFee: [
    body('deliveryFee')
      .notEmpty()
      .withMessage('Les frais de livraison sont requis')
      .isFloat({ min: 0 })
      .withMessage('Les frais de livraison doivent être positifs'),
  ],

  mergeCart: [
    body('guestItems')
      .isArray()
      .withMessage('guestItems doit être un tableau'),
    body('guestItems.*.productId')
      .isMongoId()
      .withMessage('ID de produit invalide'),
    body('guestItems.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantité invalide'),
  ],
};

module.exports = cartValidators;
