const PlatformSetting = require('../../models/PlatformSetting');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Shop = require('../../models/Shop');
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
      .limit(parseInt(limit))
      .skip(parseInt(skip))
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
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    logger.info(`✅ Rôle utilisateur mis à jour: ${userId} -> ${role}`);

    res.status(200).json({
      success: true,
      message: 'Rôle utilisateur mis à jour',
      data: user,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour rôle: ${error.message}`);
    next(error);
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

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé',
      data: user,
    });
  } catch (error) {
    logger.error(`Erreur suppression utilisateur: ${error.message}`);
    next(error);
  }
};

/**
 * Send notification to users (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const { userIds, title, message, type } = req.body;

    // TODO: Implement notification sending via Bull queue
    logger.info(`✅ Notification envoyée à ${userIds.length} utilisateurs`);

    res.status(200).json({
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
    next(error);
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

    res.status(200).json({
      success: true,
      message: 'Boutique supprimée',
      data: shop,
    });
  } catch (error) {
    logger.error(`Erreur suppression boutique: ${error.message}`);
    next(error);
  }
};
