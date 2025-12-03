const { body } = require('express-validator');

const usersValidators = {
  update: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Prénom minimum 2 caractères'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('phone')
      .optional()
      .trim(),
  ],

  updateAddress: [
    body('street').optional().trim(),
    body('city').optional().trim(),
    body('zipCode').optional().trim(),
    body('country').optional().trim(),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
  ],

  updatePreferences: [
    body('language')
      .optional()
      .isIn(['fr', 'en']).withMessage('Langue invalide'),
    body('notifications.email').optional().isBoolean(),
    body('notifications.sms').optional().isBoolean(),
    body('notifications.push').optional().isBoolean(),
  ],
};

module.exports = usersValidators;
