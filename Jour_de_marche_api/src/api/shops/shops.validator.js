const { body } = require('express-validator');

const shopsValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('category')
      .notEmpty().withMessage('Catégorie requise')
      .isIn(['farm', 'market', 'bakery', 'butcher', 'fishmonger', 'other']),
    body('description').optional().trim(),
  ],

  update: [
    body('name').optional().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('deliveryRadius').optional().isFloat({ min: 0 }),
    body('minimumOrder').optional().isFloat({ min: 0 }),
  ],
};

module.exports = shopsValidators;
