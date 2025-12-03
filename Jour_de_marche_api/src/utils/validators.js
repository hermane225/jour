const { body, param, query } = require('express-validator');

const validators = {
  // MongoDB ID validation
  mongoId: [
    param('id')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('ID invalide'),
  ],

  // Email validation
  email: (fieldName = 'email') => [
    body(fieldName)
      .trim()
      .notEmpty().withMessage(`${fieldName} requis`)
      .isEmail().withMessage(`${fieldName} invalide`),
  ],

  // Password validation
  password: (fieldName = 'password') => [
    body(fieldName)
      .notEmpty().withMessage(`${fieldName} requis`)
      .isLength({ min: 6 }).withMessage(`${fieldName} minimum 6 caractères`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(`${fieldName} doit contenir minuscules, majuscules et chiffres`),
  ],

  // Pagination query
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page doit être >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  ],

  // Sort query
  sort: [
    query('sort')
      .optional()
      .matches(/^-?[\w,\s]+$/)
      .withMessage('Sort invalide'),
  ],

  // Search query
  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Search entre 1 et 100 caractères'),
  ],

  // Filter query
  filter: [
    query('filter')
      .optional()
      .isJSON().withMessage('Filter doit être un JSON valide'),
  ],
};

module.exports = validators;
