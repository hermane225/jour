const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Prénom requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Nom requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email requis'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide'],
    },
    googleId: {
      type: String,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Mot de passe requis'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      default: 'active',
    },
    avatar: String,
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String,
      latitude: Number,
      longitude: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    lastLogin: Date,
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      language: { type: String, default: 'fr' },
    },
  },
  {
    timestamps: true,
    indexes: [{ name: 1 }, { email: 1 }, { role: 1 }, { status: 1 }],
  }
);

// Hash password avant de sauvegarder
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode pour obtenir les données publiques
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  delete obj.verificationToken;
  delete obj.verificationTokenExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
