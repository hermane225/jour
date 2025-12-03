const Transaction = require('../../models/Transaction');
const Order = require('../../models/Order');
const { paymentService } = require('../../services/payment.service');
const logger = require('../../../config/logger');

/**
 * Process payment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, amount, paymentMethod, provider } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    // Process payment with service
    const paymentResult = await paymentService.processPayment({
      amount,
      currency: 'XOF',
      method: paymentMethod,
      provider,
      orderId,
    });

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: paymentResult.transactionId,
      order: orderId,
      payer: req.user.id,
      payee: order.shop,
      amount,
      currency: 'XOF',
      type: 'payment',
      status: paymentResult.success ? 'completed' : 'failed',
      paymentMethod,
      provider,
      providerTransactionId: paymentResult.providerTransactionId,
    });

    // Update order status if payment successful
    if (paymentResult.success) {
      order.status = 'confirmed';
      order.payment = {
        status: 'completed',
        transactionId: transaction._id,
        amount,
        method: paymentMethod,
      };
      await order.save();

      logger.info(`✅ Paiement traité: ${transaction._id}`);
    }

    res.status(200).json({
      success: paymentResult.success,
      message: paymentResult.success ? 'Paiement réussi' : 'Paiement échoué',
      data: {
        transaction,
        order,
      },
    });
  } catch (error) {
    logger.error(`Erreur traitement paiement: ${error.message}`);
    next(error);
  }
};

/**
 * Get transaction history
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const { limit = 10, skip = 0, status } = req.query;

    const filter = { payer: req.user.id };
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('order', 'orderNumber total')
      .populate('payee', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Transactions récupérées',
      data: transactions,
      total: await Transaction.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération transactions: ${error.message}`);
    next(error);
  }
};

/**
 * Refund payment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.refundPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée',
      });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Seules les transactions complétées peuvent être remboursées',
      });
    }

    // Process refund
    const refundResult = await paymentService.refundPayment({
      providerTransactionId: transaction.providerTransactionId,
      amount: transaction.amount,
      provider: transaction.provider,
    });

    // Create refund transaction
    const refund = await Transaction.create({
      transactionId: refundResult.refundId,
      order: transaction.order,
      payer: transaction.payee,
      payee: transaction.payer,
      amount: transaction.amount,
      currency: transaction.currency,
      type: 'refund',
      status: 'completed',
      paymentMethod: transaction.paymentMethod,
      provider: transaction.provider,
      providerTransactionId: refundResult.refundId,
    });

    transaction.status = 'refunded';
    await transaction.save();

    logger.info(`✅ Remboursement traité: ${refund._id}`);

    res.status(200).json({
      success: true,
      message: 'Remboursement traité',
      data: refund,
    });
  } catch (error) {
    logger.error(`Erreur remboursement: ${error.message}`);
    next(error);
  }
};
