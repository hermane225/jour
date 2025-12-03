const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const config = require('../../../config');
const logger = require('../../../config/logger');

const authController = {
  // Register
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé',
        });
      }

      // Create user
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role: role || 'customer',
      });

      await user.save();

      // Generate tokens
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiry }
      );

      logger.info(`✅ Nouvel utilisateur enregistré: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        data: {
          user: user.toPublicJSON(),
          token,
        },
      });
    } catch (error) {
      logger.error('Erreur lors de l\'inscription:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'inscription',
        error: error.message,
      });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }

      // Check password
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }

      // Generate tokens
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiry }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`✅ Connexion utilisateur: ${email}`);

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: user.toPublicJSON(),
          token,
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la connexion:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
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

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.json({
          success: true,
          message: 'Un lien de réinitialisation a été envoyé si le compte existe',
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      logger.info(`✅ Email de réinitialisation envoyé: ${email}`);

      res.json({
        success: true,
        message: 'Un lien de réinitialisation a été envoyé à votre email',
      });
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation',
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (!user || user.resetPasswordToken !== token) {
        return res.status(400).json({
          success: false,
          message: 'Token invalide ou expiré',
        });
      }

      if (user.resetPasswordExpiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Token expiré',
        });
      }

      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpiry = null;
      await user.save();

      logger.info(`✅ Mot de passe réinitialisé: ${user.email}`);

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation',
      });
    }
  },
};

module.exports = authController;
