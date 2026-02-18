const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const logger = require('../../../config/logger');

const cartController = {
  // Get user's cart
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;

      let cart = await Cart.findOne({ user: userId })
        .populate({
          path: 'items.product',
          select: 'name slug price images quantity unit status shop',
          populate: {
            path: 'shop',
            select: 'name slug logo',
          },
        });

      // Créer un panier vide si n'existe pas
      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [],
          deliveryFee: 0,
          totalAmount: 0,
        });
        await cart.save();
      }

      // Nettoyer les items invalides
      await cart.cleanInvalidItems();
      await cart.save();

      return res.json({
        success: true,
        data: {
          id: cart._id,
          items: cart.items.map((item) => ({
            id: item._id,
            product: item.product,
            quantity: item.quantity,
            selectedVariants: item.selectedVariants,
            priceAtAdd: item.priceAtAdd,
            subtotal: item.priceAtAdd * item.quantity,
            addedAt: item.addedAt,
          })),
          deliveryFee: cart.deliveryFee,
          totalAmount: cart.totalAmount,
          itemsTotal: cart.totalAmount - cart.deliveryFee,
          itemsCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du panier:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du panier',
        error: error.message,
      });
    }
  },

  // Add item to cart
  addItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        productId, quantity, selectedVariants,
      } = req.body;

      // Vérifier que le produit existe et est disponible
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé',
        });
      }

      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Ce produit n\'est plus disponible',
        });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant. Disponible: ${product.quantity}`,
        });
      }

      // Récupérer ou créer le panier
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Vérifier si l'item existe déjà
      const existingItemIndex = cart.items.findIndex((item) => {
        const sameProduct = item.product.toString() === productId;
        const sameVariants = JSON.stringify(item.selectedVariants || {})
          === JSON.stringify(selectedVariants || {});
        return sameProduct && sameVariants;
      });

      if (existingItemIndex > -1) {
        // Mettre à jour la quantité
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuffisant. Maximum: ${product.quantity}`,
          });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Ajouter un nouvel item
        cart.items.push({
          product: productId,
          quantity,
          selectedVariants: selectedVariants || {},
          priceAtAdd: product.price,
        });
      }

      cart.calculateTotal();
      await cart.save();

      // Recharger avec populate
      await cart.populate({
        path: 'items.product',
        select: 'name slug price images quantity unit status shop',
        populate: {
          path: 'shop',
          select: 'name slug logo',
        },
      });

      logger.info(`✅ Article ajouté au panier: ${product.name} (user: ${userId})`);

      return res.json({
        success: true,
        message: 'Article ajouté au panier',
        data: {
          id: cart._id,
          items: cart.items.map((item) => ({
            id: item._id,
            product: item.product,
            quantity: item.quantity,
            selectedVariants: item.selectedVariants,
            priceAtAdd: item.priceAtAdd,
            subtotal: item.priceAtAdd * item.quantity,
          })),
          deliveryFee: cart.deliveryFee,
          totalAmount: cart.totalAmount,
        },
      });
    } catch (error) {
      logger.error('Erreur lors de l\'ajout au panier:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout au panier',
        error: error.message,
      });
    }
  },

  // Update item quantity
  updateItemQuantity: async (req, res) => {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Panier non trouvé',
        });
      }

      const item = cart.items.id(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé dans le panier',
        });
      }

      // Vérifier le stock
      const product = await Product.findById(item.product);
      if (!product) {
        // Produit supprimé, retirer l'item
        cart.items.pull(itemId);
      } else if (quantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant. Maximum: ${product.quantity}`,
        });
      } else {
        item.quantity = quantity;
      }

      cart.calculateTotal();
      await cart.save();

      await cart.populate({
        path: 'items.product',
        select: 'name slug price images quantity unit status shop',
        populate: {
          path: 'shop',
          select: 'name slug logo',
        },
      });

      logger.info(`✅ Quantité mise à jour dans le panier (user: ${userId})`);

      return res.json({
        success: true,
        message: 'Quantité mise à jour',
        data: {
          id: cart._id,
          items: cart.items.map((i) => ({
            id: i._id,
            product: i.product,
            quantity: i.quantity,
            selectedVariants: i.selectedVariants,
            priceAtAdd: i.priceAtAdd,
            subtotal: i.priceAtAdd * i.quantity,
          })),
          deliveryFee: cart.deliveryFee,
          totalAmount: cart.totalAmount,
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du panier:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour',
        error: error.message,
      });
    }
  },

  // Remove item from cart
  removeItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Panier non trouvé',
        });
      }

      cart.items.pull(itemId);
      cart.calculateTotal();
      await cart.save();

      await cart.populate({
        path: 'items.product',
        select: 'name slug price images quantity unit status shop',
        populate: {
          path: 'shop',
          select: 'name slug logo',
        },
      });

      logger.info(`✅ Article retiré du panier (user: ${userId})`);

      return res.json({
        success: true,
        message: 'Article retiré du panier',
        data: {
          id: cart._id,
          items: cart.items.map((i) => ({
            id: i._id,
            product: i.product,
            quantity: i.quantity,
            selectedVariants: i.selectedVariants,
            priceAtAdd: i.priceAtAdd,
            subtotal: i.priceAtAdd * i.quantity,
          })),
          deliveryFee: cart.deliveryFee,
          totalAmount: cart.totalAmount,
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'article:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression',
        error: error.message,
      });
    }
  },

  // Update delivery fee
  updateDeliveryFee: async (req, res) => {
    try {
      const userId = req.user.id;
      const { deliveryFee } = req.body;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Panier non trouvé',
        });
      }

      cart.deliveryFee = deliveryFee;
      cart.calculateTotal();
      await cart.save();

      return res.json({
        success: true,
        message: 'Frais de livraison mis à jour',
        data: {
          deliveryFee: cart.deliveryFee,
          totalAmount: cart.totalAmount,
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des frais:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour',
        error: error.message,
      });
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Panier non trouvé',
        });
      }

      cart.items = [];
      cart.deliveryFee = 0;
      cart.totalAmount = 0;
      await cart.save();

      logger.info(`✅ Panier vidé (user: ${userId})`);

      return res.json({
        success: true,
        message: 'Panier vidé',
        data: {
          id: cart._id,
          items: [],
          deliveryFee: 0,
          totalAmount: 0,
        },
      });
    } catch (error) {
      logger.error('Erreur lors du vidage du panier:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du vidage du panier',
        error: error.message,
      });
    }
  },

  // Merge guest cart with user cart (lors de la connexion)
  mergeCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { guestItems } = req.body; // Items du localStorage

      if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) {
        return res.json({
          success: true,
          message: 'Aucun article à fusionner',
        });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Ajouter les items du guest
      const productPromises = guestItems.map((guestItem) => Product.findById(guestItem.productId));
      const products = await Promise.all(productPromises);

      guestItems.forEach((guestItem, index) => {
        const product = products[index];
        if (!product || product.status !== 'active') {
          return;
        }

        const existingItemIndex = cart.items.findIndex((item) => {
          const sameProduct = item.product.toString() === guestItem.productId;
          const sameVariants = JSON.stringify(item.selectedVariants || {})
            === JSON.stringify(guestItem.selectedVariants || {});
          return sameProduct && sameVariants;
        });

        if (existingItemIndex > -1) {
          // Additionner les quantités
          const newQuantity = cart.items[existingItemIndex].quantity + guestItem.quantity;
          cart.items[existingItemIndex].quantity = Math.min(newQuantity, product.quantity);
        } else {
          cart.items.push({
            product: guestItem.productId,
            quantity: Math.min(guestItem.quantity, product.quantity),
            selectedVariants: guestItem.selectedVariants || {},
            priceAtAdd: product.price,
          });
        }
      });

      cart.calculateTotal();
      await cart.save();

      await cart.populate({
        path: 'items.product',
        select: 'name slug price images quantity unit status shop',
        populate: {
          path: 'shop',
          select: 'name slug logo',
        },
      });

      logger.info(`✅ Panier fusionné (user: ${userId})`);

      return res.json({
        success: true,
        message: 'Panier fusionné avec succès',
        data: {
          id: cart._id,
          items: cart.items.map((item) => ({
            id: item._id,
            product: item.product,
            quantity: item.quantity,
            selectedVariants: item.selectedVariants,
            priceAtAdd: item.priceAtAdd,
            subtotal: item.priceAtAdd * item.quantity,
          })),
          deliveryFee: cart.deliveryFee,
          totalAmount: cart.totalAmount,
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la fusion du panier:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la fusion',
        error: error.message,
      });
    }
  },
};

module.exports = cartController;
