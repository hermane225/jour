const express = require('express');
const shopsController = require('./shops.controller');
const shopsValidators = require('./shops.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const rolesMiddleware = require('../../middlewares/roles.middleware');

const router = express.Router();

/**
 * @route   GET /api/shops
 * @desc    Get all shops
 * @access  Public
 */
router.get('/', shopsController.getAllShops);

/**
 * @route   POST /api/shops
 * @desc    Create a new shop
 * @access  Private (Farmer/Merchant)
 */
router.post(
  '/',
  authMiddleware,
  rolesMiddleware(['farmer', 'merchant']),
  shopsValidators.create,
  validationMiddleware,
  shopsController.createShop
);

module.exports = router;
