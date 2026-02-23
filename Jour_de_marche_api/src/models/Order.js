const mongoose = require('mongoose');

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      default: generateOrderNumber,
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
      name: String, // Store product name in case product is deleted
    }],
    // Status flow: pending -> confirmed -> preparing -> ready_for_pickup (if pickup) OR in_delivery (if delivery) -> delivered -> cancelled
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'in_delivery',
        'delivered',
        'cancelled',
        'refunded'
      ],
      default: 'pending',
    },
    // Type of delivery: 'delivery' or 'pickup'
    deliveryType: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery',
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
      country: String,
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
      ready_for_pickup: Date,
      in_delivery: Date,
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
    indexes: [
      { customer: 1 },
      { shop: 1 },
      { status: 1 },
      { paymentStatus: 1 },
      { orderNumber: 1 },
      { 'timeline.created': -1 }
    ],
  }
);

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
