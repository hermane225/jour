const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'ORDER_PENDING',
        'ORDER_CONFIRMED',
        'ORDER_PREPARING',
        'ORDER_READY_FOR_PICKUP',
        'ORDER_IN_DELIVERY',
        'ORDER_DELIVERED',
        'ORDER_CANCELLED',
        'ORDER_NEW',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'DELIVERY_UPDATE',
        'SYSTEM',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      orderId: mongoose.Schema.Types.ObjectId,
      shopId: mongoose.Schema.Types.ObjectId,
      orderNumber: String,
      status: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    channel: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app', 'all'],
      default: 'in_app',
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  },
  {
    timestamps: true,
    indexes: [
      { user: 1 },
      { read: 1 },
      { type: 1 },
      { createdAt: -1 },
    ],
  }
);

// Index for efficient querying of user's unread notifications
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
