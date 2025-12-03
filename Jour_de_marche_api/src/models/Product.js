const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nom du produit requis'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['fruits', 'vegetables', 'dairy', 'meat', 'fish', 'bakery', 'other'],
    },
    subCategory: String,
    images: [String],
    price: {
      type: Number,
      required: [true, 'Prix requis'],
      min: 0,
    },
    originalPrice: Number,
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['piece', 'kg', 'liter', 'box'],
      default: 'piece',
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    barcode: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active',
    },
    attributes: [{
      name: String,
      value: String,
    }],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    organic: Boolean,
    localProduct: Boolean,
    expiryDate: Date,
    harvestDate: Date,
    origin: String,
    tags: [String],
    seoMetadata: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
  },
  {
    timestamps: true,
    indexes: [{ shop: 1 }, { category: 1 }, { status: 1 }, { slug: 1 }],
  }
);

module.exports = mongoose.model('Product', productSchema);
