const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jour de Marché API',
      version: '1.0.0',
      description: 'API pour plateforme de marché fermier',
      contact: {
        name: 'Support',
        email: 'support@jour-de-marche.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Développement',
      },
      {
        url: 'https://api.jour-de-marche.com/api',
        description: 'Production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/api/**/*.routes.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
