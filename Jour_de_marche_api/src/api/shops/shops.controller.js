const { v4: uuidv4 } = require('uuid');
const Shop = require('../../models/Shop');
const Category = require('../../models/Category');
const logger = require('../../../config/logger');

const shopsController = {
  // Get all shops
  getAllShops: async (req, res) => {
    try {
      const {
        page = 1, limit = 10, category, lat, lon, radius = 10,
      } = req.query;
      const skip = (page - 1) * limit;

      const filter = { status: 'active' };
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
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
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
    const requestId = uuidv4();

    try {
      const {
        name, category, description, address, deliveryRadius,
        deliveryFee, minimumOrder, status, logo, banner,
        contact, hours, deliveryOptions, socialMedia, phone,
      } = req.body;

      // Vérification de l'existence de la catégorie (double check après validation)
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        logger.warn({
          message: 'Tentative de création de boutique avec catégorie inexistante',
          requestId,
          userId: req.user.id,
          category,
        });
        return res.status(404).json({
          success: false,
          message: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
          requestId,
        });
      }

      if (categoryExists.status !== 'active') {
        logger.warn({
          message: 'Tentative de création de boutique avec catégorie inactive',
          requestId,
          userId: req.user.id,
          category,
        });
        return res.status(422).json({
          success: false,
          message: 'Category is not active',
          code: 'CATEGORY_INACTIVE',
          requestId,
        });
      }

      // Préparer les données de la boutique en filtrant les valeurs undefined
      const shopData = {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        category,
        owner: req.user.id,
        status: status || 'active',
      };

      // Ajouter les champs optionnels seulement s'ils sont définis
      if (description) shopData.description = description;
      if (address) shopData.address = address;
      if (deliveryRadius !== undefined) shopData.deliveryRadius = deliveryRadius;
      if (deliveryFee !== undefined) shopData.deliveryFee = deliveryFee;
      if (minimumOrder !== undefined) shopData.minimumOrder = minimumOrder;
      if (logo) shopData.logo = logo;
      if (banner) shopData.banner = banner;
      if (hours) shopData.hours = hours;
      if (deliveryOptions) shopData.deliveryOptions = deliveryOptions;
      if (socialMedia) shopData.socialMedia = socialMedia;

      // Gérer le champ contact de manière robuste
      if (contact && typeof contact === 'object') {
        shopData.contact = contact;
      } else if (phone) {
        shopData.contact = { phone };
      }

      const shop = new Shop(shopData);

      await shop.save();
      
      // Populate avec gestion d'erreur
      try {
        await shop.populate('owner', 'firstName lastName email');
        await shop.populate('category', 'name slug');
      } catch (populateError) {
        logger.warn({
          message: 'Erreur lors du populate',
          requestId,
          error: populateError.message,
        });
        // Continue même si le populate échoue
      }

      logger.info({
        message: '✅ Boutique créée avec succès',
        requestId,
        shopName: name,
        shopId: shop._id,
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Boutique créée avec succès',
        data: shop,
        requestId,
      });
    } catch (error) {
      // Gérer les erreurs de validation Mongoose
      if (error.name === 'ValidationError') {
        const details = {};
        Object.keys(error.errors).forEach((field) => {
          details[field] = [error.errors[field].message];
        });
        
        logger.warn({
          message: 'Erreur de validation Mongoose lors de la création de boutique',
          requestId,
          userId: req.user?.id,
          details,
        });

        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details,
          requestId,
        });
      }

      // Gérer les erreurs de duplication (clé unique)
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        
        logger.warn({
          message: 'Tentative de création de boutique avec duplication',
          requestId,
          userId: req.user?.id,
          field,
          value: error.keyValue,
        });

        return res.status(409).json({
          success: false,
          message: `Une boutique avec ce ${field} existe déjà`,
          code: 'DUPLICATE_ERROR',
          details: {
            [field]: [`A shop with this ${field} already exists`],
          },
          requestId,
        });
      }

      // Erreur serveur générique
      logger.error({
        message: 'Erreur serveur lors de la création de boutique',
        requestId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        payload: req.body,
      });

      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred while creating the shop',
        code: 'INTERNAL_SERVER_ERROR',
        requestId,
      });
    }
    return null;
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
    return null;
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
        { new: true, runValidators: true },
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
    return null;
  },

  // Get popular shops
  getPopularShops: async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
      const shops = await Shop.find({ status: 'active' })
        .populate('owner', 'firstName lastName email')
        .populate('category', 'name slug')
        .sort({ 'rating.average': -1, 'stats.totalOrders': -1, createdAt: -1 })
        .limit(limit);

      res.json({ success: true, data: shops });
    } catch (error) {
      logger.error('Erreur getPopularShops:', error.message);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des boutiques populaires' });
    }
  },
};

module.exports = shopsController;
