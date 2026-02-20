const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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

// =====================
// Global Middlewares
// =====================

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

// =====================
// Routes
// Route racine
const path = require('path');

// Servir les fichiers uploadés (images logo, banner, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur l\'API Jour de Marche !' });
});

// Route favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/favicon.ico'), err => {
    if (err) {
      res.status(204).end(); // No Content si le favicon n'existe pas
    }
  });
});
// =====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
