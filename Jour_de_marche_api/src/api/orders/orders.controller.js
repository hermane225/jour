const Order = require('../../models/Order');
const Notification = require('../../models/Notification');
const Shop = require('../../models/Shop');
const logger = require('../../../config/logger');

/**
 * Notification messages for each status
 */
const NOTIFICATION_MESSAGES = {
  pending: {
    client: 'Votre commande a été enregistrée et est en attente de confirmation.',
    shop: 'Nouvelle commande reçue ! Veuillez la confirmer.',
  },
  confirmed: {
    client: 'Votre commande a été confirmée par la boutique.',
    shop: 'Commande confirmée. Veuillez la préparer.',
  },
  preparing: {
    client: 'Votre commande est en préparation.',
    shop: 'Commande en cours de préparation.',
  },
  ready_for_pickup: {
    client: 'Votre commande est prête ! Vous pouvez venir la retirer.',
    shop: 'Commande prête pour retrait.',
  },
  in_delivery: {
    client: 'Votre commande est en cours de livraison.',
    shop: 'Commande en livraison.',
  },
  delivered: {
    client: 'Votre commande a été livrée. Merci pour votre confiance !',
    shop: 'Commande livrée avec succès.',
  },
  cancelled: {
    client: 'Votre commande a été annulée.',
    shop: 'Commande annulée par le client.',
  },
};

/**
 * Create notifications for order status changes
 */
const createOrderNotifications = async (order, oldStatus, newStatus) => {
  try {
    const notifications = [];

    // Client notification
    if (NOTIFICATION_MESSAGES[newStatus]?.client) {
      notifications.push({
        user: order.customer,
        type: `ORDER_${newStatus.toUpperCase()}`,
        title: `Commande ${order.orderNumber}`,
        message: NOTIFICATION_MESSAGES[newStatus].client,
        data: {
          orderId: order._id,
          shopId: order.shop,
          orderNumber: order.orderNumber,
          status: newStatus,
        },
      });
    }

    // Shop notification
    if (NOTIFICATION_MESSAGES[newStatus]?.shop) {
      const shop = await Shop.findById(order.shop);
      if (shop && shop.owner) {
        notifications.push({
          user: shop.owner,
          type: `ORDER_${newStatus.toUpperCase()}`,
          title: `Commande ${order.orderNumber}`,
          message: NOTIFICATION_MESSAGES[newStatus].shop,
          data: {
            orderId: order._id,
            shopId: order.shop,
            orderNumber: order.orderNumber,
            status: newStatus,
          },
        });
      }
    }

    // Create all notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      logger.info(`🔔 ${notifications.length} notification(s) créée(s) pour la commande ${order.orderNumber}`);
    }
  } catch (error) {
    logger.error(`❌ Erreur création notifications: ${error.message}`);
    // Don't throw - notifications shouldn't block order updates
  }
};

/**
 * Update order timeline
 */
const updateTimeline = (timeline, status) => {
  const now = new Date();

  switch (status) {
    case 'confirmed':
      timeline.confirmed = now;
      break;
    case 'preparing':
      timeline.preparing = now;
      break;
    case 'ready_for_pickup':
      timeline.ready_for_pickup = now;
      break;
    case 'in_delivery':
      timeline.in_delivery = now;
      break;
    case 'delivered':
      timeline.delivered = now;
      break;
    case 'cancelled':
      timeline.cancelled = now;
      break;
    default:
      break;
  }
};

/**
 * Get all orders (admin)
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 10, skip = 0 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .populate('customer', 'firstName lastName email')
      .populate('shop', 'name')
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
 * Get orders by shop
 */
exports.getOrdersByShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { status, limit = 10, skip = 0 } = req.query;
    
    const filter = { shop: shopId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Commandes de la boutique récupérées',
      data: orders,
      total: await Order.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération commandes boutique: ${error.message}`);
    next(error);
  }
};

/**
 * Get orders by buyer (customer)
 */
exports.getOrdersByBuyer = async (req, res, next) => {
  try {
    const { buyerId } = req.params;
    const { status, limit = 10, skip = 0 } = req.query;
    
    const filter = { customer: buyerId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .populate('shop', 'name logo')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Vos commandes récupérées',
      data: orders,
      total: await Order.countDocuments(filter),
    });
  } catch (error) {
    logger.error(`Erreur récupération commandes client: ${error.message}`);
    next(error);
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('shop', 'name logo contact')
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
 */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      shopId,
      items,
      deliveryAddress,
      deliveryType,
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
      customer: req.user.id,
      shop: shopId,
      items,
      deliveryAddress,
      deliveryType: deliveryType || 'delivery',
      pricing: {
        subtotal,
        tax: Math.round(tax * 100) / 100,
        deliveryFee,
        total: Math.round(total * 100) / 100,
      },
      payment: {
        method: paymentMethod,
      },
      notes,
      status: 'pending',
      timeline: {
        created: new Date(),
      },
    });

    await order.populate('items.product', 'name price image');
    await order.populate('shop', 'name');

    // Create notifications
    await createOrderNotifications(order, null, 'pending');

    logger.info(`✅ Commande créée: ${order.orderNumber}`);

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
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('shop', 'name owner');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    const oldStatus = order.status;

    // Update status and timeline
    order.status = status;
    order.timeline = order.timeline || {};
    updateTimeline(order.timeline, status);

    await order.save();

    // Create notifications
    await createOrderNotifications(order, oldStatus, status);

    logger.info(`✅ Statut commande mis à jour: ${order.orderNumber} -> ${status}`);

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
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('shop', 'name owner');

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

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'annuler une commande livrée',
      });
    }

    const oldStatus = order.status;
    order.status = 'cancelled';
    order.notes = reason ? `${order.notes || ''}\nMotif d'annulation: ${reason}` : order.notes;

    order.timeline = order.timeline || {};
    updateTimeline(order.timeline, 'cancelled');
    await order.save();

    // Create notifications
    await createOrderNotifications(order, oldStatus, 'cancelled');

    logger.info(`✅ Commande annulée: ${order.orderNumber}`);

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
