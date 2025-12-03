const express = require('express');
const logger = require('../../config/logger');

const router = express.Router();

// =====================
// Routes API
// =====================

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'API operational', timestamp: new Date() });
});

// API v1 routes
router.use('/auth', require('./auth/auth.routes'));
router.use('/users', require('./users/users.routes'));
router.use('/shops', require('./shops/shops.routes'));
router.use('/products', require('./products/products.routes'));
router.use('/orders', require('./orders/orders.routes'));
router.use('/payments', require('./payments/payments.routes'));
router.use('/drivers', require('./drivers/drivers.routes'));
router.use('/uploads', require('./uploads/uploads.routes'));
router.use('/admin', require('./admin/admin.routes'));

logger.info('✅ Routes API chargées');

module.exports = router;
