const path = require('path');
const fs = require('fs');
const PlatformSetting = require('../../models/PlatformSetting');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Shop = require('../../models/Shop');
const Product = require('../../models/Product');
const config = require('../../../config');
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

// =====================
// Diagnostic uploads
// =====================

/**
 * Diagnostic des chemins d'upload
 * Vérifie que multer et express.static utilisent le même dossier
 */
exports.diagnosticUploads = async (req, res, next) => {
  try {
    const configPath = config.storage.path;
    const resolvedPath = path.resolve(configPath);

    // Lister les fichiers dans le dossier d'upload
    let filesCount = 0;
    let subfolders = [];
    let sampleFiles = [];

    if (fs.existsSync(resolvedPath)) {
      const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });
      subfolders = entries.filter(e => e.isDirectory()).map(e => e.name);
      const files = entries.filter(e => e.isFile()).map(e => e.name);
      filesCount = files.length;

      // Compter les fichiers dans les sous-dossiers
      for (const folder of subfolders) {
        const folderPath = path.join(resolvedPath, folder);
        try {
          const folderFiles = fs.readdirSync(folderPath);
          filesCount += folderFiles.length;
          sampleFiles.push(...folderFiles.slice(0, 3).map(f => `${folder}/${f}`));
        } catch (e) { /* ignore */ }
      }
    }

    // Vérifier les URLs en DB
    const shopsWithLogo = await Shop.countDocuments({ logo: { $exists: true, $ne: null, $ne: '' } });
    const shopsWithBanner = await Shop.countDocuments({ banner: { $exists: true, $ne: null, $ne: '' } });
    const productsWithImages = await Product.countDocuments({ images: { $exists: true, $not: { $size: 0 } } });

    // Vérifier les fichiers manquants (échantillon)
    const brokenShops = [];
    const shopsToCheck = await Shop.find({ logo: { $exists: true, $ne: null, $ne: '' } }).limit(10).lean();
    for (const shop of shopsToCheck) {
      if (shop.logo) {
        const filePath = path.join(resolvedPath, shop.logo.replace('/uploads/', ''));
        if (!fs.existsSync(filePath)) {
          brokenShops.push({ id: shop._id, name: shop.name, logo: shop.logo, exists: false });
        }
      }
    }

    const brokenProducts = [];
    const productsToCheck = await Product.find({ images: { $exists: true, $not: { $size: 0 } } }).limit(10).lean();
    for (const product of productsToCheck) {
      for (const img of (product.images || [])) {
        const filePath = path.join(resolvedPath, img.replace('/uploads/', ''));
        if (!fs.existsSync(filePath)) {
          brokenProducts.push({ id: product._id, name: product.name, image: img, exists: false });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic uploads',
      data: {
        config: {
          UPLOAD_DIR_env: process.env.UPLOAD_DIR || '(non défini)',
          STORAGE_PATH_env: process.env.STORAGE_PATH || '(non défini)',
          configStoragePath: configPath,
          resolvedAbsolutePath: resolvedPath,
          cwd: process.cwd(),
          dirExists: fs.existsSync(resolvedPath),
        },
        files: {
          totalFiles: filesCount,
          subfolders,
          sampleFiles: sampleFiles.slice(0, 10),
        },
        database: {
          shopsWithLogo,
          shopsWithBanner,
          productsWithImages,
        },
        broken: {
          shops: brokenShops,
          products: brokenProducts,
          note: 'Échantillon limité à 10 entrées',
        },
      },
    });
  } catch (error) {
    logger.error(`Erreur diagnostic uploads: ${error.message}`);
    return next(error);
  }
};

/**
 * Réécrire les URLs des images en DB
 * Remplace un ancien préfixe d'URL par un nouveau
 * Body: { oldPrefix: string, newPrefix: string, dryRun: boolean }
 */
exports.migrateUploadUrls = async (req, res, next) => {
  try {
    const { oldPrefix, newPrefix, dryRun = true } = req.body;

    if (!oldPrefix || !newPrefix) {
      return res.status(400).json({
        success: false,
        message: 'oldPrefix et newPrefix sont requis',
      });
    }

    const results = { shops: { logo: 0, banner: 0 }, products: { images: 0 }, dryRun };

    // --- Shops ---
    const shopsLogo = await Shop.find({ logo: { $regex: oldPrefix } });
    for (const shop of shopsLogo) {
      const newUrl = shop.logo.replace(oldPrefix, newPrefix);
      if (!dryRun) {
        shop.logo = newUrl;
        await shop.save();
      }
      results.shops.logo++;
    }

    const shopsBanner = await Shop.find({ banner: { $regex: oldPrefix } });
    for (const shop of shopsBanner) {
      const newUrl = shop.banner.replace(oldPrefix, newPrefix);
      if (!dryRun) {
        shop.banner = newUrl;
        await shop.save();
      }
      results.shops.banner++;
    }

    // --- Products ---
    const products = await Product.find({ images: { $regex: oldPrefix } });
    for (const product of products) {
      const newImages = product.images.map(img =>
        img.includes(oldPrefix) ? img.replace(oldPrefix, newPrefix) : img
      );
      if (!dryRun) {
        product.images = newImages;
        await product.save();
      }
      results.products.images += product.images.filter(img => img.includes(oldPrefix)).length;
    }

    res.status(200).json({
      success: true,
      message: dryRun ? 'Simulation terminée (aucune modification)' : 'Migration effectuée',
      data: results,
    });
  } catch (error) {
    logger.error(`Erreur migration URLs: ${error.message}`);
    return next(error);
  }
};
