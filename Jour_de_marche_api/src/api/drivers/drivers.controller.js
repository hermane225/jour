const Delivery = require('../../models/Delivery');
const Order = require('../../models/Order');
const User = require('../../models/User');
const logger = require('../../../config/logger');

/**
 * Get all deliveries
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllDeliveries = async (req, res, next) => {
  try {
    const { status, limit = 10, skip = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const deliveries = await Delivery.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('order', 'orderNumber total')
      .populate('driver', 'firstName lastName phone vehicle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Livraisons récupérées',
      data: deliveries,
      total: await Delivery.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération livraisons: ${error.message}`);
    next(error);
  }
};

/**
 * Get driver deliveries
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getDriverDeliveries = async (req, res, next) => {
  try {
    const { status, limit = 10, skip = 0 } = req.query;

    const filter = { driver: req.user.id };
    if (status) filter.status = status;

    const deliveries = await Delivery.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('order', 'orderNumber total customer')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Livraisons du livreur récupérées',
      data: deliveries,
      total: await Delivery.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération livraisons livreur: ${error.message}`);
    next(error);
  }
};

/**
 * Assign delivery to driver
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.assignDelivery = async (req, res, next) => {
  try {
    const { orderId, driverId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé',
      });
    }

    const delivery = await Delivery.create({
      order: orderId,
      driver: driverId,
      status: 'assigned',
      deliveryRoute: order.deliveryAddress,
    });

    order.delivery = delivery._id;
    await order.save();

    logger.info(`✅ Livraison assignée: ${delivery._id}`);

    res.status(201).json({
      success: true,
      message: 'Livraison assignée',
      data: delivery,
    });
  } catch (error) {
    logger.error(`Erreur assignation livraison: ${error.message}`);
    next(error);
  }
};

/**
 * Update delivery status
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { status, location, notes } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        status,
        ...(location && { currentLocation: location }),
        ...(notes && { notes }),
      },
      { new: true, runValidators: true }
    ).populate('order', 'orderNumber');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée',
      });
    }

    // Update order status based on delivery status
    if (status === 'delivered') {
      await Order.findByIdAndUpdate(delivery.order, { status: 'delivered' });
    }

    logger.info(`✅ Statut livraison mis à jour: ${deliveryId} -> ${status}`);

    res.status(200).json({
      success: true,
      message: 'Statut livraison mis à jour',
      data: delivery,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour livraison: ${error.message}`);
    next(error);
  }
};

/**
 * Rate delivery
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.rateDelivery = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { rating, comment } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        rating,
        review: {
          text: comment,
          createdAt: new Date(),
        },
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée',
      });
    }

    logger.info(`✅ Livraison évaluée: ${deliveryId} (${rating}/5)`);

    res.status(200).json({
      success: true,
      message: 'Évaluation enregistrée',
      data: delivery,
    });
  } catch (error) {
    logger.error(`Erreur évaluation livraison: ${error.message}`);
    next(error);
  }
};
