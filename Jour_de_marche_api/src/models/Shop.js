const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nom de la boutique requis'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: String,
    logo: String,
    banner: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'active',
    },
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],
      },
    },
    contact: {
      email: String,
      phone: String,
      website: String,
    },
    hours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    deliveryRadius: {
      type: Number,
      default: 10, // km
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    deliveryOptions: [{
      type: String,
      enum: ['livraison locale', 'retrait en magasin', 'livraison nationale'],
    }],
    minimumOrder: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
    documents: {
      businessLicense: String,
      taxId: String,
      healthCertificate: String,
      verificationDate: Date,
      verificationStatus: String,
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
  },
  {
    timestamps: true,
    indexes: [{ owner: 1 }, { status: 1 }, { category: 1 }],
  }
);

// Indexer les coordonnées géographiques
shopSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema);
