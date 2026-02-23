const express = require('express');
const notificationsController = require('./notifications.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get notifications by user
 * @access  Private
 */
router.get(
  '/',
  authMiddleware,
  notificationsController.getNotifications
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch(
  '/:id/read',
  authMiddleware,
  notificationsController.markAsRead
);

/**
 * @route   POST /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post(
  '/read-all',
  authMiddleware,
  notificationsController.markAllAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete(
  '/:id',
  authMiddleware,
  notificationsController.deleteNotification
);

module.exports = router;
