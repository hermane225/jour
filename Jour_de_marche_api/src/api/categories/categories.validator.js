const { body, param } = require('express-validator');

const categoriesValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('description').optional().trim(),
    body('icon').optional().isString(),
  ],

  update: [
    param('id').isMongoId().withMessage('ID invalide'),
    body('name').optional().isLength({ min: 2 }),
    body('description').optional().trim(),
    body('icon').optional().isString(),
    body('status').optional().isIn(['active', 'inactive']),
  ],

  delete: [
    param('id').isMongoId().withMessage('ID invalide'),
  ],
};

module.exports = categoriesValidators;
