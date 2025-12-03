const Order = require('../../models/Order');
const logger = require('../../../config/logger');

/**
 * Get all orders
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 10, skip = 0 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name price')
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
 * Get order by ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email phone address')
      .populate('items.product', 'name price image')
      .populate('delivery', 'driver status estimatedDelivery');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Commande récupérée',
      data: order,
    });
  } catch (error) {
    logger.error(`Erreur récupération commande: ${error.message}`);
    next(error);
  }
};

/**
 * Create a new order
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      deliveryAddress,
      paymentMethod,
      notes,
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    const deliveryFee = subtotal > 50 ? 0 : 5;
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + deliveryFee + tax;

    const order = await Order.create({
      user: req.user.id,
      items,
      deliveryAddress,
      paymentMethod,
      notes,
      subtotal,
      deliveryFee,
      tax,
      total,
      status: 'pending',
    });

    await order.populate('items.product', 'name price image');

    logger.info(`✅ Commande créée: ${order._id}`);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: order,
    });
  } catch (error) {
    logger.error(`Erreur création commande: ${error.message}`);
    next(error);
  }
};

/**
 * Update order status
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    logger.info(`✅ Statut commande mis à jour: ${id} -> ${status}`);

    res.status(200).json({
      success: true,
      message: 'Statut commande mis à jour',
      data: order,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour commande: ${error.message}`);
    next(error);
  }
};

/**
 * Cancel order
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Commande déjà annulée',
      });
    }

    order.status = 'cancelled';
    await order.save();

    logger.info(`✅ Commande annulée: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Commande annulée',
      data: order,
    });
  } catch (error) {
    logger.error(`Erreur annulation commande: ${error.message}`);
    next(error);
  }
};
