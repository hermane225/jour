const express = require('express');
const ordersController = require('./orders.controller');
const ordersValidators = require('./orders.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin) or user orders
 * @access  Private
 */
router.get(
  '/',
  authMiddleware,
  ordersController.getAllOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get(
  '/:id',
  authMiddleware,
  ordersController.getOrderById
);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post(
  '/',
  authMiddleware,
  ordersValidators.create,
  validationMiddleware,
  ordersController.createOrder
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.put(
  '/:id/status',
  authMiddleware,
  ordersValidators.updateStatus,
  validationMiddleware,
  ordersController.updateOrderStatus
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put(
  '/:id/cancel',
  authMiddleware,
  ordersController.cancelOrder
);

module.exports = router;
