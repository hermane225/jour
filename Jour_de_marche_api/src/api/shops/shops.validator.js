const { body } = require('express-validator');

const shopsValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('category')
      .notEmpty().withMessage('Catégorie requise')
      .isMongoId().withMessage('Catégorie invalide'),
    body('description').optional({ nullable: true, checkFalsy: false }).trim(),
    body('logo').optional({ nullable: true, checkFalsy: false }).isString(),
    body('banner').optional({ nullable: true, checkFalsy: false }).isString(),
    body('phone').optional({ nullable: true, checkFalsy: false }).isString(),
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
    body('deliveryOptions').optional({ nullable: true, checkFalsy: false }).isArray(),
    body('deliveryRadius').optional({ nullable: true, checkFalsy: false }).isNumeric().withMessage('Rayon de livraison doit être un nombre'),
    body('deliveryFee').optional({ nullable: true, checkFalsy: false }).isNumeric().withMessage('Frais de livraison doit être un nombre'),
    body('minimumOrder').optional({ nullable: true, checkFalsy: false }).isNumeric().withMessage('Commande minimum doit être un nombre'),
    body('status').optional({ nullable: true, checkFalsy: false }).isIn(['active', 'inactive', 'suspended', 'pending']).withMessage('Statut invalide'),
  ],

  update: [
    body('name').optional().isLength({ min: 2 }),
    body('category').optional().isMongoId().withMessage('Catégorie invalide'),
    body('description').optional().trim(),
    body('logo').optional().isString(),
    body('phone').optional().isString(),
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
    body('deliveryOptions').optional().isArray(),
    body('deliveryRadius').optional().isNumeric().withMessage('Rayon de livraison doit être un nombre'),
    body('deliveryFee').optional().isNumeric().withMessage('Frais de livraison doit être un nombre'),
    body('minimumOrder').optional().isNumeric().withMessage('Commande minimum doit être un nombre'),
  ],
};

module.exports = shopsValidators;
