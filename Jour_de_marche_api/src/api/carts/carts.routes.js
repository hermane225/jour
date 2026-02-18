const express = require('express');

const router = express.Router();
const cartController = require('./carts.controller');
const cartValidators = require('./carts.validator');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');

/**
 * @route   GET /api/carts
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', authenticate, cartController.getCart);

/**
 * @route   POST /api/carts/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
  '/items',
  authenticate,
  cartValidators.addItem,
  validate,
  cartController.addItem,
);

/**
 * @route   PUT /api/carts/items/:itemId
 * @desc    Update item quantity
 * @access  Private
 */
router.put(
  '/items/:itemId',
  authenticate,
  cartValidators.updateQuantity,
  validate,
  cartController.updateItemQuantity,
);

/**
 * @route   DELETE /api/carts/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete(
  '/items/:itemId',
  authenticate,
  cartValidators.removeItem,
  validate,
  cartController.removeItem,
);

/**
 * @route   PUT /api/carts/delivery-fee
 * @desc    Update delivery fee
 * @access  Private
 */
router.put(
  '/delivery-fee',
  authenticate,
  cartValidators.updateDeliveryFee,
  validate,
  cartController.updateDeliveryFee,
);

/**
 * @route   DELETE /api/carts
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', authenticate, cartController.clearCart);

/**
 * @route   POST /api/carts/merge
 * @desc    Merge guest cart with user cart
 * @access  Private
 */
router.post(
  '/merge',
  authenticate,
  cartValidators.mergeCart,
  validate,
  cartController.mergeCart,
);

module.exports = router;
