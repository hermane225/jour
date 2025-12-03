const { body } = require('express-validator');

const productsValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('category')
      .notEmpty().withMessage('Catégorie requise')
      .isIn(['fruits', 'vegetables', 'dairy', 'meat', 'fish', 'bakery', 'other']),
    body('price')
      .notEmpty().withMessage('Prix requis')
      .isFloat({ min: 0 }).withMessage('Prix doit être >= 0'),
    body('quantity')
      .notEmpty().withMessage('Quantité requise')
      .isInt({ min: 0 }).withMessage('Quantité doit être >= 0'),
  ],
};

module.exports = productsValidators;
