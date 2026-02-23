const Notification = require('../../models/Notification');
const logger = require('../../../config/logger');

/**
 * Get notifications by user
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId est requis',
      });
    }

    const filter = { user: userId };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.status(200).json({
      success: true,
      message: 'Notifications récupérées',
      data: notifications,
      total,
      unreadCount,
    });
  } catch (error) {
    logger.error(`Erreur récupération notifications: ${error.message}`);
    next(error);
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      data: notification,
    });
  } catch (error) {
    logger.error(`Erreur mise à jour notification: ${error.message}`);
    next(error);
  }
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId est requis',
      });
    }

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
    });
  } catch (error) {
    logger.error(`Erreur mise à jour notifications: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification supprimée',
    });
  } catch (error) {
    logger.error(`Erreur suppression notification: ${error.message}`);
    next(error);
  }
};
