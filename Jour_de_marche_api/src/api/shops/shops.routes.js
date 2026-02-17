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

module.exports = router;
