const express = require('express');
const adminController = require('./admin.controller');
const adminValidators = require('./admin.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const rolesMiddleware = require('../../middlewares/roles.middleware');

const router = express.Router();

// =====================
// Admin Routes
// =====================

/**
 * @route   GET /api/admin/settings
 * @desc    Get platform settings
 * @access  Private (Admin)
 */
router.get(
  '/settings',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminController.getSettings,
);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update platform setting
 * @access  Private (Admin)
 */
router.put(
  '/settings',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminValidators.updateSetting,
  validationMiddleware,
  adminController.updateSetting,
);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get(
  '/stats',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminController.getDashboardStats,
);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get(
  '/users',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminController.getAllUsers,
);

/**
 * @route   PUT /api/admin/users/:userId/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put(
  '/users/:userId/role',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminValidators.updateUserRole,
  validationMiddleware,
  adminController.updateUserRole,
);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete(
  '/users/:userId',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminController.deleteUser,
);

/**
 * @route   POST /api/admin/notify
 * @desc    Send notification to users
 * @access  Private (Admin)
 */
router.post(
  '/notify',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminValidators.sendNotification,
  validationMiddleware,
  adminController.sendNotification,
);

/**
 * @route   GET /api/admin/shops
 * @desc    Get all shops
 * @access  Private (Admin)
 */
router.get(
  '/shops',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminController.getAllShops,
);

/**
 * @route   DELETE /api/admin/shops/:shopId
 * @desc    Delete shop
 * @access  Private (Admin)
 */
router.delete(
  '/shops/:shopId',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminController.deleteShop,
);

/**
 * @route   PUT /api/admin/shops/:shopId/status
 * @desc    Update shop status
 * @access  Private (Admin)
 */
router.put(
  '/shops/:shopId/status',
  authMiddleware,
  rolesMiddleware(['admin']),
  adminController.updateShopStatus,
);

module.exports = router;
