const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      price: Number,
      subtotal: Number,
    }],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['not_assigned', 'assigned', 'in_transit', 'delivered', 'failed'],
      default: 'not_assigned',
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
    },
    deliveryAddress: {
      street: String,
      city: String,
      zipCode: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],
      },
    },
    pricing: {
      subtotal: Number,
      tax: Number,
      deliveryFee: Number,
      discount: Number,
      total: Number,
    },
    payment: {
      method: { type: String, enum: ['card', 'bank_transfer', 'cash', 'mobile_money'] },
      transactionId: String,
      provider: String,
    },
    notes: String,
    timeline: {
      created: Date,
      confirmed: Date,
      preparing: Date,
      ready: Date,
      shipped: Date,
      delivered: Date,
      cancelled: Date,
    },
    tracking: {
      trackingCode: String,
      lastUpdate: Date,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],
      },
    },
  },
  {
    timestamps: true,
    indexes: [{ customer: 1 }, { shop: 1 }, { status: 1 }, { paymentStatus: 1 }, { orderNumber: 1 }],
  }
);

module.exports = mongoose.model('Order', orderSchema);
