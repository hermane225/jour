const { body } = require('express-validator');

const shopsValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Nom requis')
      .isLength({ min: 2 }).withMessage('Nom minimum 2 caractères'),
    body('category')
      .notEmpty().withMessage('Catégorie requise')
      .isMongoId().withMessage('Catégorie invalide'),
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
    body('owner')
      .optional()
      .isString(),
    body('deliveryOptions').optional().isArray(),
    body('deliveryRadius').optional().isNumeric().withMessage('Rayon de livraison doit être un nombre'),
    body('deliveryFee').optional().isNumeric().withMessage('Frais de livraison doit être un nombre'),
    body('minimumOrder').optional().isNumeric().withMessage('Commande minimum doit être un nombre'),
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
