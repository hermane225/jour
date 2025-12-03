const express = require('express');
const driversController = require('./drivers.controller');
const driversValidators = require('./drivers.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const rolesMiddleware = require('../../middlewares/roles.middleware');

const router = express.Router();

/**
 * @route   GET /api/drivers/deliveries
 * @desc    Get all deliveries
 * @access  Private (Admin/Driver)
 */
router.get(
  '/deliveries',
  authMiddleware,
  driversController.getAllDeliveries,
);

/**
 * @route   GET /api/drivers/my-deliveries
 * @desc    Get driver's deliveries
 * @access  Private (Driver)
 */
router.get(
  '/my-deliveries',
  authMiddleware,
  rolesMiddleware(['driver']),
  driversController.getDriverDeliveries,
);

/**
 * @route   POST /api/drivers/assign
 * @desc    Assign delivery to driver
 * @access  Private (Admin)
 */
router.post(
  '/assign',
  authMiddleware,
  rolesMiddleware(['admin']),
  driversValidators.assign,
  validationMiddleware,
  driversController.assignDelivery,
);

/**
 * @route   PUT /api/drivers/deliveries/:deliveryId/status
 * @desc    Update delivery status
 * @access  Private
 */
router.put(
  '/deliveries/:deliveryId/status',
  authMiddleware,
  driversValidators.updateStatus,
  validationMiddleware,
  driversController.updateDeliveryStatus,
);

/**
 * @route   POST /api/drivers/deliveries/:deliveryId/rate
 * @desc    Rate a delivery
 * @access  Private
 */
router.post(
  '/deliveries/:deliveryId/rate',
  authMiddleware,
  driversValidators.rate,
  validationMiddleware,
  driversController.rateDelivery,
);

module.exports = router;
