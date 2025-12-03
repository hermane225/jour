const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
    type: {
      type: String,
      enum: ['payment', 'refund', 'payout'],
      default: 'payment',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'cash', 'mobile_money'],
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'mock', 'bank', 'cash'],
    },
    providerTransactionId: String,
    providerResponse: mongoose.Schema.Types.Mixed,
    failureReason: String,
    fees: {
      platformFee: Number,
      processingFee: Number,
      taxFee: Number,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    indexes: [{ order: 1 }, { payer: 1 }, { payee: 1 }, { status: 1 }, { transactionId: 1 }],
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
