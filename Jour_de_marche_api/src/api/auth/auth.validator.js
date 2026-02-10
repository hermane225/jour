const { body } = require('express-validator');

const authValidators = {
  register: [
    body('firstName')
      .trim()
      .notEmpty().withMessage('Prénom requis')
      .isLength({ min: 2 }).withMessage('Prénom minimum 2 caractères'),
    body('lastName')
      .trim()
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email requis')
      .isEmail().withMessage('Email invalide'),
    body('password')
      .notEmpty().withMessage('Mot de passe requis')
      .isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
    body('role')
      .optional()
      .isIn(['customer', 'admin', 'farmer', 'driver']).withMessage('Rôle invalide'),
  ],

  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email requis')
      .isEmail().withMessage('Email invalide'),
    body('password')
      .notEmpty().withMessage('Mot de passe requis'),
  ],

  forgotPassword: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email requis')
      .isEmail().withMessage('Email invalide'),
  ],

  resetPassword: [
    body('token')
      .notEmpty().withMessage('Token requis'),
    body('password')
      .notEmpty().withMessage('Mot de passe requis')
      .isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Les mots de passe ne correspondent pas'),
  ],
};

module.exports = authValidators;
