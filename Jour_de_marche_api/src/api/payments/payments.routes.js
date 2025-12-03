const express = require('express');
const paymentsController = require('./payments.controller');
const paymentsValidators = require('./payments.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/payments/process
 * @desc    Process a payment
 * @access  Private
 */
router.post(
  '/process',
  authMiddleware,
  paymentsValidators.processPayment,
  validationMiddleware,
  paymentsController.processPayment,
);

/**
 * @route   GET /api/payments/transactions
 * @desc    Get user transaction history
 * @access  Private
 */
router.get(
  '/transactions',
  authMiddleware,
  paymentsController.getTransactions,
);

/**
 * @route   POST /api/payments/:transactionId/refund
 * @desc    Refund a payment
 * @access  Private
 */
router.post(
  '/:transactionId/refund',
  authMiddleware,
  paymentsValidators.refund,
  validationMiddleware,
  paymentsController.refundPayment,
);

module.exports = router;
