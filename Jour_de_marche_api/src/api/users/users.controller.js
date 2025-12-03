const User = require('../../models/User');
const logger = require('../../../config/logger');

const usersController = {
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, status } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (role) filter.role = role;
      if (status) filter.status = status;

      const users = await User.find(filter)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: users.map(u => u.toPublicJSON()),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs',
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      res.json({
        success: true,
        data: user.toPublicJSON(),
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'utilisateur:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur',
      });
    }
  },

  // Update current user
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phone } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { firstName, lastName, phone },
        { new: true, runValidators: true }
      );

      logger.info(`✅ Profil utilisateur mis à jour: ${req.user.id}`);

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: user.toPublicJSON(),
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du profil:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil',
      });
    }
  },

  // Update user address
  updateAddress: async (req, res) => {
    try {
      const { street, city, zipCode, country, latitude, longitude } = req.body;

      const address = {
        street,
        city,
        zipCode,
        country,
      };

      if (latitude && longitude) {
        address.coordinates = {
          type: 'Point',
          coordinates: [longitude, latitude],
        };
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { address },
        { new: true, runValidators: true }
      );

      logger.info(`✅ Adresse utilisateur mise à jour: ${req.user.id}`);

      res.json({
        success: true,
        message: 'Adresse mise à jour avec succès',
        data: user.toPublicJSON(),
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'adresse:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'adresse',
      });
    }
  },

  // Update preferences
  updatePreferences: async (req, res) => {
    try {
      const { language, notifications } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          'preferences.language': language,
          'preferences.notifications': notifications,
        },
        { new: true }
      );

      logger.info(`✅ Préférences utilisateur mises à jour: ${req.user.id}`);

      res.json({
        success: true,
        message: 'Préférences mises à jour avec succès',
        data: user.toPublicJSON(),
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des préférences:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour des préférences',
      });
    }
  },

  // Delete account
  deleteAccount: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, { status: 'deleted' });

      logger.info(`✅ Compte utilisateur supprimé: ${req.user.id}`);

      res.json({
        success: true,
        message: 'Compte supprimé avec succès',
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression du compte:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du compte',
      });
    }
  },
};

module.exports = usersController;
