const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité doit être au moins 1'],
    default: 1,
  },
  selectedVariants: {
    size: String,
    color: String,
  },
  priceAtAdd: {
    type: Number,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Un seul panier par utilisateur
    },
    items: [cartItemSchema],
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index pour recherche rapide par utilisateur
cartSchema.index({ user: 1 });

// Index pour nettoyer les paniers inactifs
cartSchema.index({ lastActivity: 1 });

// Méthode pour calculer le total
cartSchema.methods.calculateTotal = function () {
  const itemsTotal = this.items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0,
  );
  this.totalAmount = itemsTotal + this.deliveryFee;
  return this.totalAmount;
};

// Méthode pour nettoyer les items invalides
cartSchema.methods.cleanInvalidItems = async function () {
  const Product = mongoose.model('Product');

  const validItems = await Promise.all(
    this.items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (product && product.status === 'active' && product.quantity > 0) {
        // Ajuster la quantité si nécessaire
        if (item.quantity > product.quantity) {
          // eslint-disable-next-line no-param-reassign
          item.quantity = product.quantity;
        }
        return item;
      }
      return null;
    }),
  );

  this.items = validItems.filter((item) => item !== null);
  this.calculateTotal();
};

// Middleware pour mettre à jour lastActivity
cartSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
