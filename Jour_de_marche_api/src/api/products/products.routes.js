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

module.exports = router;
