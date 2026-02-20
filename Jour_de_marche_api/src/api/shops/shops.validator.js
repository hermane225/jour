const { body } = require('express-validator');
const Category = require('../../models/Category');

const shopsValidators = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('Nom requis')
      .isLength({ min: 2 })
      .withMessage('Nom minimum 2 caractères'),
    body('category')
      .notEmpty()
      .withMessage('Catégorie requise')
      .isMongoId()
      .withMessage('Category must be a valid ObjectId')
      .custom(async (value) => {
        const category = await Category.findById(value);
        if (!category) {
          throw new Error('Category does not exist');
        }
        if (category.status !== 'active') {
          throw new Error('Category is not active');
        }
        return true;
      }),
    body('description').optional({ nullable: true, checkFalsy: false }).trim(),
    body('logo').optional({ nullable: true, checkFalsy: false }).isString(),
    body('banner').optional({ nullable: true, checkFalsy: false }).isString(),
    body('phone')
      .optional({ nullable: true, checkFalsy: false })
      .isString()
      .matches(/^[\d\s\-+()]+$/)
      .withMessage('Invalid phone format - must contain only digits, spaces, and +()-'),
    body('contact').optional({ nullable: true, checkFalsy: false }).isObject(),
    body('address').optional({ nullable: true, checkFalsy: false }).isObject().withMessage('Adresse doit être un objet'),
    body('address.street').optional({ nullable: true, checkFalsy: false }).isString(),
    body('address.city').optional({ nullable: true, checkFalsy: false }).isString(),
    body('address.zipCode').optional({ nullable: true, checkFalsy: false }).isString(),
    body('address.country').optional({ nullable: true, checkFalsy: false }).isString(),
    body('address.coordinates').optional({ nullable: true, checkFalsy: false }).isObject().withMessage('Coordonnées doivent être un objet'),
    body('address.coordinates.type')
      .optional({ nullable: true, checkFalsy: false })
      .isString()
      .matches(/^Point$/)
      .withMessage('Le type de coordonnées doit être "Point"'),
    body('address.coordinates.coordinates')
      .optional({ nullable: true, checkFalsy: false })
      .isArray()
      .withMessage('Les coordonnées doivent être un tableau [longitude, latitude]')
      .custom((value) => {
        if (!value) return true; // Skip validation if not provided
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error('Les coordonnées doivent être un tableau de 2 nombres [longitude, latitude]');
        }
        if (typeof value[0] !== 'number' || typeof value[1] !== 'number') {
          throw new Error('Les coordonnées doivent être des nombres');
        }
        // Validate longitude (-180 to 180) and latitude (-90 to 90)
        if (value[0] < -180 || value[0] > 180) {
          throw new Error('La longitude doit être entre -180 et 180');
        }
        if (value[1] < -90 || value[1] > 90) {
          throw new Error('La latitude doit être entre -90 et 90');
        }
        return true;
      }),
    body('owner')
      .optional({ nullable: true, checkFalsy: false })
      .isString(),
    body('hours').optional({ nullable: true, checkFalsy: false }).isObject(),
    body('socialMedia').optional({ nullable: true, checkFalsy: false }).isObject(),
    body('deliveryOptions')
      .optional({ nullable: true, checkFalsy: false })
      .isArray()
      .withMessage('Delivery options must be an array')
      .custom((value) => {
        const allowedOptions = ['livraison locale', 'retrait en magasin', 'livraison nationale'];
        if (value && !value.every((option) => allowedOptions.includes(option))) {
          throw new Error(`Delivery options must be one of: ${allowedOptions.join(', ')}`);
        }
        return true;
      }),
    body('deliveryRadius')
      .optional({ nullable: true, checkFalsy: false })
      .isFloat({ min: 0 })
      .withMessage('Delivery radius must be a number >= 0'),
    body('deliveryFee')
      .optional({ nullable: true, checkFalsy: false })
      .isFloat({ min: 0 })
      .withMessage('Delivery fee must be a number >= 0'),
    body('minimumOrder')
      .optional({ nullable: true, checkFalsy: false })
      .isFloat({ min: 0 })
      .withMessage('Minimum order must be a number >= 0'),
    body('status').optional({ nullable: true, checkFalsy: false }).isIn(['active', 'inactive', 'suspended', 'pending']).withMessage('Statut invalide'),
  ],

  update: [
    body('name').optional().isLength({ min: 2 }),
    body('category')
      .optional()
      .isMongoId().withMessage('Category must be a valid ObjectId')
      .custom(async (value) => {
        const category = await Category.findById(value);
        if (!category) {
          throw new Error('Category does not exist');
        }
        if (category.status !== 'active') {
          throw new Error('Category is not active');
        }
        return true;
      }),
    body('description').optional().trim(),
    body('logo').optional().isString(),
    body('phone')
      .optional()
      .isString()
      .matches(/^[\d\s\-+()]+$/)
      .withMessage('Invalid phone format - must contain only digits, spaces, and +()-'),
    body('address').optional().isObject().withMessage('Adresse doit être un objet'),
    body('address.street').optional().isString(),
    body('address.city').optional().isString(),
    body('address.zipCode').optional().isString(),
    body('address.country').optional().isString(),
    body('address.coordinates').optional().isObject().withMessage('Coordonnées doivent être un objet'),
    body('address.coordinates.type')
      .optional()
      .isString()
      .matches(/^Point$/)
      .withMessage('Le type de coordonnées doit être "Point"'),
    body('address.coordinates.coordinates')
      .optional()
      .isArray()
      .withMessage('Les coordonnées doivent être un tableau [longitude, latitude]')
      .custom((value) => {
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error('Les coordonnées doivent être un tableau de 2 nombres [longitude, latitude]');
        }
        if (typeof value[0] !== 'number' || typeof value[1] !== 'number') {
          throw new Error('Les coordonnées doivent être des nombres');
        }
        // Validate longitude (-180 to 180) and latitude (-90 to 90)
        if (value[0] < -180 || value[0] > 180) {
          throw new Error('La longitude doit être entre -180 et 180');
        }
        if (value[1] < -90 || value[1] > 90) {
          throw new Error('La latitude doit être entre -90 et 90');
        }
        return true;
      }),
    body('owner').optional().isString(),
    body('deliveryOptions')
      .optional()
      .isArray()
      .withMessage('Delivery options must be an array')
      .custom((value) => {
        const allowedOptions = ['livraison locale', 'retrait en magasin', 'livraison nationale'];
        if (value && !value.every((option) => allowedOptions.includes(option))) {
          throw new Error(`Delivery options must be one of: ${allowedOptions.join(', ')}`);
        }
        return true;
      }),
    body('deliveryRadius')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Delivery radius must be a number >= 0'),
    body('deliveryFee')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Delivery fee must be a number >= 0'),
    body('minimumOrder')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum order must be a number >= 0'),
  ],
};

module.exports = shopsValidators;
