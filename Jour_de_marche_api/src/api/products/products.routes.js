const express = require('express');
const productsController = require('./products.controller');
const productsValidators = require('./products.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productsController.getAllProducts);

/**
 * @route   GET /api/products/shop/:shopId
 * @desc    Get products by shop (for shop dashboard)
 * @access  Private (Shop owner)
 */
router.get('/shop/:shopId', authMiddleware, productsController.getShopProducts);

/**
 * @route   GET /api/products/:productId
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:productId', productsController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Shop owner)
 */
router.post(
  '/',
  authMiddleware,
  productsValidators.create,
  validationMiddleware,
  productsController.createProduct
);

/**
 * @route   PUT /api/products/:productId
 * @desc    Update product
 * @access  Private (Shop owner)
 */
router.put(
  '/:productId',
  authMiddleware,
  productsValidators.update,
  validationMiddleware,
  productsController.updateProduct
);

/**
 * @route   DELETE /api/products/:productId
 * @desc    Delete product
 * @access  Private (Shop owner)
 */
router.delete(
  '/:productId',
  authMiddleware,
  productsController.deleteProduct
);

module.exports = router;
