const Shop = require('../../models/Shop');
const logger = require('../../../config/logger');

const shopsController = {
  // Get all shops
  getAllShops: async (req, res) => {
    try {
      const { page = 1, limit = 10, category, lat, lon, radius = 10 } = req.query;
      const skip = (page - 1) * limit;

      let filter = { status: 'active' };
      if (category) filter.category = category;

      let shops = await Shop.find(filter)
        .populate('owner', 'firstName lastName email')
        .populate('category', 'name slug')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      // Filter by distance if coordinates provided
      if (lat && lon) {
        shops = shops.filter((shop) => {
          if (!shop.address?.coordinates) return false;
          const [shopLon, shopLat] = shop.address.coordinates.coordinates;
          const distance = Math.hypot(shopLat - lat, shopLon - lon) * 111; // Rough km conversion
          return distance <= radius;
        });
      }

      const total = await Shop.countDocuments(filter);

      res.json({
        success: true,
        data: shops,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des boutiques:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des boutiques',
      });
    }
  },

  // Create shop
  createShop: async (req, res) => {
    try {
      const { name, category, description, address, deliveryRadius, deliveryFee, minimumOrder, status, logo, banner, contact, hours, deliveryOptions, socialMedia } = req.body;

      const shop = new Shop({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        category,
        description,
        address,
        deliveryRadius,
        deliveryFee,
        minimumOrder,
        owner: req.user.id,
        status: status || 'active', // Accepter le statut, défaut à 'active'
        logo,
        banner,
        contact,
        hours,
        deliveryOptions,
        socialMedia,
      });

      await shop.save();
      await shop.populate('owner', 'firstName lastName email');

      logger.info(`✅ Boutique créée: ${name}`);

      res.status(201).json({
        success: true,
        message: 'Boutique créée avec succès',
        data: shop,
      });
    } catch (error) {
      logger.error('Erreur lors de la création de la boutique:', error);

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la boutique',
        error: error.message,
        errors: error.errors || null  // si c’est une ValidationError Mongoose
      });
    }
  },

  // Get user's shops (for dashboard)
  getMyShops: async (req, res) => {
    try {
      const shops = await Shop.find({ owner: req.user.id })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: shops,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des boutiques de l\'utilisateur:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de vos boutiques',
      });
    }
  },

  // Get shop by ID
  getShopById: async (req, res) => {
    try {
      const { shopId } = req.params;

      const shop = await Shop.findById(shopId)
        .populate('owner', 'firstName lastName email')
        .populate('category', 'name slug');

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Boutique non trouvée',
        });
      }

      res.json({
        success: true,
        data: shop,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de la boutique:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la boutique',
      });
    }
  },

  // Update shop
  updateShop: async (req, res) => {
    try {
      const { shopId } = req.params;
      const updates = req.body;

      // Check if user owns the shop
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Boutique non trouvée',
        });
      }

      if (shop.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier cette boutique',
        });
      }

      // Update slug if name changed
      if (updates.name && updates.name !== shop.name) {
        updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
      }

      const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { $set: updates },
        { new: true, runValidators: true }
      )
        .populate('owner', 'firstName lastName email')
        .populate('category', 'name slug');

      logger.info(`✅ Boutique mise à jour: ${updatedShop.name}`);

      res.json({
        success: true,
        message: 'Boutique mise à jour avec succès',
        data: updatedShop,
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la boutique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la boutique',
        error: error.message,
      });
    }
  },
};

module.exports = shopsController;
