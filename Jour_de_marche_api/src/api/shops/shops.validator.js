const { body } = require('express-validator');

const shopsValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('description').optional().trim(),
    body('logo').optional().isString(),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('sellerId')
      .notEmpty().withMessage('sellerId requis')
      .isString(),
    body('deliveryOptions').optional().isArray(),
  ],

  update: [
    body('name').optional().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('logo').optional().isString(),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('sellerId').optional().isString(),
    body('deliveryOptions').optional().isArray(),
  ],
};

module.exports = shopsValidators;
