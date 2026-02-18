const PlatformSetting = require('../../models/PlatformSetting');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Shop = require('../../models/Shop');
const Product = require('../../models/Product');
const logger = require('../../../config/logger');

/**
 * Get platform settings
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await PlatformSetting.find();
    const settingsObj = {};

    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    res.status(200).json({
      success: true,
      message: 'Paramètres récupérés',
      data: settingsObj,
    });
  } catch (error) {
    logger.error(`Erreur récupération paramètres: ${error.message}`);
    next(error);
  }
};

/**
 * Update platform setting
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;

    let setting = await PlatformSetting.findOne({ key });

    if (!setting) {
      setting = await PlatformSetting.create({ key, value });
    } else {
      setting.value = value;
      await setting.save();
    }

    logger.info(`✅ Paramètre mis à jour: ${key}`);

    res.status(200).json({
      success: true,
      message: 'Paramètre mis à jour',
      data: setting,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour paramètre: ${error.message}`);
    next(error);
  }
};

/**
 * Get dashboard stats
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      message: 'Statistiques du tableau de bord',
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        usersByRole,
      },
    });
  } catch (error) {
    logger.error(`Erreur récupération stats: ${error.message}`);
    next(error);
  }
};

/**
 * Get all users (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, limit = 10, skip = 0 } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Utilisateurs récupérés',
      data: users,
      total: await User.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération utilisateurs: ${error.message}`);
    next(error);
  }
};

/**
 * Update user role (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    logger.info(`✅ Rôle utilisateur mis à jour: ${userId} -> ${role}`);

    return res.status(200).json({
      success: true,
      message: 'Rôle utilisateur mis à jour',
      data: user,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour rôle: ${error.message}`);
    return next(error);
  }
};

/**
 * Delete user (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    logger.info(`✅ Utilisateur supprimé: ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé',
      data: user,
    });
  } catch (error) {
    logger.error(`Erreur suppression utilisateur: ${error.message}`);
    return next(error);
  }
};

/**
 * Send notification to users (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const {
      userIds, title, message, type,
    } = req.body;

    // TODO: Implement notification sending via Bull queue
    logger.info(`✅ Notification envoyée à ${userIds.length} utilisateurs`);
    logger.info(`   Titre: ${title}, Type: ${type}, Message: ${message}`);

    return res.status(200).json({
      success: true,
      message: 'Notification envoyée',
      data: {
        recipientCount: userIds.length,
        title,
        type,
      },
    });
  } catch (error) {
    logger.error(`Erreur envoi notification: ${error.message}`);
    return next(error);
  }
};

/**
 * Get all shops (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllShops = async (req, res, next) => {
  try {
    const { status, limit = 10, skip = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const shops = await Shop.find(filter)
      .populate('owner', 'firstName lastName email')
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Boutiques récupérées',
      data: shops,
      total: await Shop.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération boutiques: ${error.message}`);
    next(error);
  }
};

/**
 * Delete shop (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.deleteShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findByIdAndDelete(shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée',
      });
    }

    logger.info(`✅ Boutique supprimée: ${shopId}`);

    return res.status(200).json({
      success: true,
      message: 'Boutique supprimée',
      data: shop,
    });
  } catch (error) {
    logger.error(`Erreur suppression boutique: ${error.message}`);
    return next(error);
  }
};

/**
 * Update shop status (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateShopStatus = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { status } = req.body;

    const shop = await Shop.findByIdAndUpdate(
      shopId,
      { status },
      { new: true, runValidators: true },
    ).populate('owner', 'firstName lastName email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée',
      });
    }

    logger.info(`✅ Statut boutique mis à jour: ${shopId} -> ${status}`);

    return res.status(200).json({
      success: true,
      message: 'Statut boutique mis à jour',
      data: shop,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour statut boutique: ${error.message}`);
    return next(error);
  }
};

/**
 * Get all orders (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('shop', 'name logo')
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Commandes récupérées',
      data: orders,
      total: await Order.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération commandes: ${error.message}`);
    next(error);
  }
};

/**
 * Update order status (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true },
    ).populate('customer', 'firstName lastName email phone')
      .populate('shop', 'name logo');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    logger.info(`✅ Statut commande mis à jour: ${orderId} -> ${status}`);

    return res.status(200).json({
      success: true,
      message: 'Statut commande mis à jour',
      data: order,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour statut commande: ${error.message}`);
    return next(error);
  }
};

/**
 * Get all products (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const products = await Product.find(filter)
      .populate('shop', 'name logo')
      .populate('category', 'name')
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Produits récupérés',
      data: products,
      total: await Product.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération produits: ${error.message}`);
    next(error);
  }
};

/**
 * Delete product (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    logger.info(`✅ Produit supprimé: ${productId}`);

    return res.status(200).json({
      success: true,
      message: 'Produit supprimé',
      data: product,
    });
  } catch (error) {
    logger.error(`Erreur suppression produit: ${error.message}`);
    return next(error);
  }
};

/**
 * Update user status (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true },
    ).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    logger.info(`✅ Statut utilisateur mis à jour: ${userId} -> ${status}`);

    return res.status(200).json({
      success: true,
      message: 'Statut utilisateur mis à jour',
      data: user,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour statut utilisateur: ${error.message}`);
    return next(error);
  }
};
