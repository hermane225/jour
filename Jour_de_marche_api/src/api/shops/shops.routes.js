const express = require('express');

const router = express.Router();
const Category = require('../../models/Category');
const shopsController = require('./shops.controller');
const shopsValidators = require('./shops.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const rolesMiddleware = require('../../middlewares/roles.middleware');

// Route pour récupérer toutes les catégories actives (pour le front)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' }).select('name _id slug');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des catégories', error: error.message });
  }
});

/**
 * @route   GET /api/shops
 * @desc    Get all shops
 * @access  Public
 */
router.get('/', shopsController.getAllShops);

/**
 * @route   GET /api/shops/my-shops
 * @desc    Get user's shops
 * @access  Private
 */
router.get('/my-shops', authMiddleware, shopsController.getMyShops);

/**
 * @route   GET /api/shops/popular
 * @desc    Get popular shops
 * @access  Public
 */
router.get('/popular', shopsController.getPopularShops);

/**
 * @route   GET /api/shops/:shopId
 * @desc    Get shop by ID
 * @access  Public
 */
router.get('/:shopId', shopsController.getShopById);

/**
 * @route   POST /api/shops
 * @desc    Create a new shop
 * @access  Private (Farmer/Merchant)
 */
router.post(
  '/',
  authMiddleware,
  shopsValidators.create,
  validationMiddleware,
  shopsController.createShop,
);

/**
 * @route   PUT /api/shops/:shopId
 * @desc    Update shop
 * @access  Private (Shop owner)
 */
router.put(
  '/:shopId',
  authMiddleware,
  shopsValidators.update,
  validationMiddleware,
  shopsController.updateShop,
);

module.exports = router;
