const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
    },
    value: mongoose.Schema.Types.Mixed,
    description: String,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json'],
      default: 'string',
    },
    category: {
      type: String,
      enum: ['general', 'payment', 'delivery', 'commission', 'email', 'sms'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
