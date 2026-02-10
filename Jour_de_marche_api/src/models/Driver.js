const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'validated', 'active', 'suspended'],
      default: 'pending',
    },
    vehicle: {
      type: {
        type: String,
        enum: ['car', 'motorcycle', 'bicycle', 'scooter'],
        required: true,
      },
      model: String,
      licensePlate: String,
      color: String,
    },
    documents: {
      driversLicense: {
        number: String,
        expiryDate: Date,
        image: String,
      },
      insurance: {
        policyNumber: String,
        expiryDate: Date,
        image: String,
      },
      vehicleRegistration: {
        number: String,
        expiryDate: Date,
        image: String,
      },
      backgroundCheck: {
        status: String,
        completedAt: Date,
      },
    },
    verificationDate: Date,
    rejectionReason: String,
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    stats: {
      totalDeliveries: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      onTimeRate: { type: Number, default: 100 },
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      schedule: {
        monday: { start: String, end: String },
        tuesday: { start: String, end: String },
        wednesday: { start: String, end: String },
        thursday: { start: String, end: String },
        friday: { start: String, end: String },
        saturday: { start: String, end: String },
        sunday: { start: String, end: String },
      },
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
  },
  {
    timestamps: true,
    indexes: [{ user: 1 }, { status: 1 }, { 'currentLocation': '2dsphere' }],
  }
);

// Indexer les coordonnées géographiques
driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
