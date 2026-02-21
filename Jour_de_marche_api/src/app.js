const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('../config');
const logger = require('../config/logger');
const { swaggerUi, swaggerSpec } = require('./docs/swagger');

// Import middlewares
const { rateLimiter } = require('./middlewares/rateLimiter');
const errorMiddleware = require('./middlewares/error.middleware');

// Import routes
const apiRoutes = require('./api/index.routes');

const app = express();

// Trust proxy for environments like Render
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origins,
  credentials: false,
  optionsSuccessStatus: 200,
}));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message),
  },
}));

// Rate limiting
app.use(rateLimiter);

// Routes
const uploadDir = path.resolve(config.storage.path);
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur l\'API Jour de Marche !' });
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/favicon.ico'), (err) => {
    if (err) {
      res.status(204).end();
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvee',
  });
});

app.use(errorMiddleware);

module.exports = app;