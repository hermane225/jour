const Product = require('../../models/Product');
const Shop = require('../../models/Shop');
const logger = require('../../../config/logger');

const productsController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const { page = 1, limit = 10, category, search, shop } = req.query;
      const skip = (page - 1) * limit;

      let filter = { status: 'active' };
      if (category) filter.category = category;
      if (shop) filter.shop = shop;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const products = await Product.find(filter)
        .populate('shop')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments(filter);

      res.json({
        success: true,
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des produits:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des produits',
      });
    }
  },

  // Create product
  createProduct: async (req, res) => {
    try {

      // Vérifier l'existence de la catégorie
      const Category = require('../../models/Category');
      const foundCategory = await Category.findById(category);
      if (!foundCategory) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie introuvable',
        });
      }

      // ...existing code...
      // Vérifier l'existence du shop
      const foundShop = await Shop.findById(shop);
      if (!foundShop) {
        return res.status(400).json({
          success: false,
          message: 'Boutique introuvable',
        });
      }

      // Vérifier que l'utilisateur connecté est le propriétaire du shop
      if (String(foundShop.owner) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à ajouter un produit à cette boutique',
        });
      }

      // Gestion des images (doit être un tableau non vide de chaînes)
      let productImages = Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.length > 0) : [];
      if (!productImages.length) {
        return res.status(400).json({
          success: false,
          message: 'Au moins une image valide est requise',
        });
      }

      const product = new Product({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        category,
        price,
        quantity,
        description,
        shop,
        images: productImages,
      });

      await product.save();
      await product.populate('shop');

      logger.info(`✅ Produit créé: ${name}`);

      res.status(201).json({
        success: true,
        message: 'Produit créé avec succès',
        data: product,
      });
    } catch (error) {
      logger.error('Erreur lors de la création du produit:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du produit',
      });
    }
  },
};

module.exports = productsController;
