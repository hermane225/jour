const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      unique: true,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'],
      default: 'pending',
    },
    pickupLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
    deliveryLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    distance: Number,
    duration: Number,
    assignedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    failureReason: String,
    signature: String,
    photos: [String],
    notes: String,
    route: [{
      latitude: Number,
      longitude: Number,
      timestamp: Date,
    }],
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      ratedBy: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    indexes: [{ order: 1 }, { driver: 1 }, { status: 1 }],
  }
);

module.exports = mongoose.model('Delivery', deliverySchema);
