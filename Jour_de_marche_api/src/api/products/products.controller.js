const Product = require('../../models/Product');
const Shop = require('../../models/Shop');
const logger = require('../../../config/logger');

const productsController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const {
        page = 1, limit = 10, category, search, shop,
      } = req.query;
      const skip = (page - 1) * limit;

      const filter = { status: 'active' };
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
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
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
      // Extraire les champs du body
      const {
        name, category, price, quantity, description, shop, images,
      } = req.body;

      // Vérifier l'existence de la catégorie
      const Category = require('../../models/Category');
      const foundCategory = await Category.findById(category);
      if (!foundCategory) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie introuvable',
        });
      }

      // Vérifier l'existence du shop
      const foundShop = await Shop.findById(shop);
      if (!foundShop) {
        return res.status(400).json({
          success: false,
          message: 'Boutique introuvable',
        });
      }

      // Vérifier que l'utilisateur connecté est le propriétaire du shop
      const userId = req.user._id || req.user.id;
      if (String(foundShop.owner) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Seul le créateur de la boutique peut ajouter un produit',
        });
      }

      // Gestion des images (doit être un tableau non vide de chaînes)
      const productImages = Array.isArray(images) ? images.filter((img) => typeof img === 'string' && img.length > 0) : [];
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
        error: error.message,
      });
    }
  },

  // Get products by shop (for shop dashboard)
  getShopProducts: async (req, res) => {
    try {
      const { shopId } = req.params;

      // Verify shop exists and user owns it
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Boutique introuvable',
        });
      }

      const userId = req.user._id || req.user.id;
      if (String(shop.owner) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à voir ces produits',
        });
      }

      const products = await Product.find({ shop: shopId })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des produits de la boutique:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des produits',
      });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId)
        .populate('shop')
        .populate('category', 'name slug');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du produit:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du produit',
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const updates = req.body;

      // Get product and check ownership
      const product = await Product.findById(productId).populate('shop');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé',
        });
      }

      const userId = req.user._id || req.user.id;
      if (String(product.shop.owner) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier ce produit',
        });
      }

      // Update slug if name changed
      if (updates.name && updates.name !== product.name) {
        updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updates },
        { new: true, runValidators: true },
      )
        .populate('shop')
        .populate('category', 'name slug');

      logger.info(`✅ Produit mis à jour: ${updatedProduct.name}`);

      res.json({
        success: true,
        message: 'Produit mis à jour avec succès',
        data: updatedProduct,
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du produit',
        error: error.message,
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { productId } = req.params;

      // Get product and check ownership
      const product = await Product.findById(productId).populate('shop');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé',
        });
      }

      const userId = req.user._id || req.user.id;
      if (String(product.shop.owner) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à supprimer ce produit',
        });
      }

      await Product.findByIdAndDelete(productId);

      logger.info(`✅ Produit supprimé: ${product.name}`);

      res.json({
        success: true,
        message: 'Produit supprimé avec succès',
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression du produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du produit',
        error: error.message,
      });
    }
  },
};

module.exports = productsController;
