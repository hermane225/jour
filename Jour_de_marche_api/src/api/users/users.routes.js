const express = require('express');
const usersController = require('./users.controller');
const usersValidators = require('./users.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const rolesMiddleware = require('../../middlewares/roles.middleware');

const router = express.Router();

// =====================
// Protected Routes
// =====================

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authMiddleware,
  rolesMiddleware(['admin']),
  usersController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, usersController.getUserById);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/profile',
  authMiddleware,
  usersValidators.update,
  validationMiddleware,
  usersController.updateProfile
);

/**
 * @route   PUT /api/users/address
 * @desc    Update user address
 * @access  Private
 */
router.put(
  '/address',
  authMiddleware,
  usersValidators.updateAddress,
  validationMiddleware,
  usersController.updateAddress
);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authMiddleware,
  usersValidators.updatePreferences,
  validationMiddleware,
  usersController.updatePreferences
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authMiddleware, usersController.deleteAccount);

module.exports = router;
