const notificationService = require('../../services/notification.service');

// Mock the logger
jest.mock('../../../config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const logger = require('../../../config/logger');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset logger mocks to default no-op implementations
    logger.info.mockImplementation(() => {});
    logger.error.mockImplementation(() => {});
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const result = await notificationService.sendNotification('user123', 'TEST_TYPE', { key: 'value' });

      expect(logger.info).toHaveBeenCalledWith('🔔 Notification envoyée à user123: TEST_TYPE');
      expect(result).toEqual({
        success: true,
        notificationId: expect.stringMatching(/^NOTIF-\d+$/),
      });
    });

    it('should handle error during notification send', async () => {
      // Mock logger.info to throw an error for this test only
      const originalInfo = logger.info;
      logger.info.mockImplementationOnce(() => {
        throw new Error('Logger error');
      });

      const result = await notificationService.sendNotification('user123', 'TEST_TYPE', { key: 'value' });

      expect(logger.error).toHaveBeenCalledWith('❌ Erreur lors de l\'envoi de la notification:', 'Logger error');
      expect(result).toEqual({
        success: false,
        message: 'Logger error',
      });

      // Restore original implementation
      logger.info = originalInfo;
    });
  });

  describe('notifyOrderStatus', () => {
    it('should notify order status change', async () => {
      const result = await notificationService.notifyOrderStatus('order123', 'confirmed');

      expect(logger.info).toHaveBeenCalledWith('🔔 Notification envoyée à order123: ORDER_STATUS_CHANGED');
      expect(result).toEqual({
        success: true,
        notificationId: expect.stringMatching(/^NOTIF-\d+$/),
      });
    });
  });

  describe('notifyDeliveryUpdate', () => {
    it('should notify delivery update', async () => {
      const result = await notificationService.notifyDeliveryUpdate('delivery123', 'in_transit', 'Location A');

      expect(logger.info).toHaveBeenCalledWith('🔔 Notification envoyée à delivery123: DELIVERY_UPDATE');
      expect(result).toEqual({
        success: true,
        notificationId: expect.stringMatching(/^NOTIF-\d+$/),
      });
    });
  });
});
