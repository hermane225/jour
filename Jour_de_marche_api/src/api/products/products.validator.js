const { body } = require('express-validator');

const productsValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('category')
      .notEmpty().withMessage('Catégorie requise')
      .isMongoId().withMessage('Catégorie doit être un ObjectId valide'),
    body('price')
      .notEmpty().withMessage('Prix requis')
      .isFloat({ min: 0 }).withMessage('Prix doit être >= 0'),
    body('quantity')
      .notEmpty().withMessage('Quantité requise')
      .isInt({ min: 0 }).withMessage('Quantité doit être >= 0'),
    body('shop')
      .notEmpty().withMessage('Shop requis')
      .isMongoId().withMessage('Shop doit être un ObjectId valide'),
    body('images')
      .isArray({ min: 1 }).withMessage('Au moins une image est requise')
      .custom((arr) => arr.every((img) => typeof img === 'string' && img.length > 0)).withMessage('Chaque image doit être une chaîne non vide'),
  ],

  update: [
    body('name')
      .optional()
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('category')
      .optional()
      .isMongoId().withMessage('Catégorie doit être un ObjectId valide'),
    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Prix doit être >= 0'),
    body('quantity')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantité doit être >= 0'),
    body('images')
      .optional()
      .isArray({ min: 1 }).withMessage('Au moins une image est requise')
      .custom((arr) => arr.every((img) => typeof img === 'string' && img.length > 0)).withMessage('Chaque image doit être une chaîne non vide'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'discontinued']).withMessage('Statut invalide'),
  ],
};

module.exports = productsValidators;
