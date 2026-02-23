const express = require('express');
const ordersController = require('./orders.controller');
const ordersValidators = require('./orders.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authMiddleware,
  ordersController.getAllOrders,
);

/**
 * @route   GET /api/orders/shop/:shopId
 * @desc    Get orders by shop
 * @access  Private (Shop owner or Admin)
 */
router.get(
  '/shop/:shopId',
  authMiddleware,
  ordersController.getOrdersByShop,
);

/**
 * @route   GET /api/orders/buyer/:buyerId
 * @desc    Get orders by buyer
 * @access  Private (Buyer or Admin)
 */
router.get(
  '/buyer/:buyerId',
  authMiddleware,
  ordersController.getOrdersByBuyer,
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get(
  '/:id',
  authMiddleware,
  ordersController.getOrderById,
);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Authenticated users)
 */
router.post(
  '/',
  authMiddleware,
  ordersValidators.create,
  validationMiddleware,
  ordersController.createOrder,
);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Shop owner or Admin)
 */
router.patch(
  '/:id/status',
  authMiddleware,
  ordersValidators.updateStatus,
  validationMiddleware,
  ordersController.updateOrderStatus,
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put(
  '/:id/cancel',
  authMiddleware,
  ordersController.cancelOrder,
);

module.exports = router;
