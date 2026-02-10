const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../../models/User');
const Shop = require('../../models/Shop');
const Driver = require('../../models/Driver');
const config = require('../../../config');
const logger = require('../../../config/logger');

const googleClient = new OAuth2Client(config.google.clientId);

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

      // Check for active shop and driver
      const hasActiveShop = await Shop.findOne({ owner: user._id, status: 'active' }) ? true : false;
      const hasActiveDriver = await Driver.findOne({
        user: user._id,
        status: { $in: ['validated', 'active'] }
      }) ? true : false;

      logger.info(`✅ Connexion utilisateur: ${email}`);

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            ...user.toPublicJSON(),
            hasActiveShop,
            hasActiveDriver,
          },
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

  // Google OAuth
  googleAuth: async (req, res) => {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Token Google requis',
        });
      }

      // Vérifier le token Google
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      const { email, given_name, family_name, picture, sub: googleId } = payload;

      // Chercher ou créer l'utilisateur
      let user = await User.findOne({ email });

      if (!user) {
        // Créer un nouvel utilisateur
        user = new User({
          firstName: given_name || 'Utilisateur',
          lastName: family_name || 'Google',
          email,
          googleId,
          avatar: picture,
          password: Math.random().toString(36).slice(-12), // Mot de passe aléatoire
          isEmailVerified: true,
          role: 'customer',
        });
        await user.save();
        logger.info(`✅ Nouvel utilisateur Google créé: ${email}`);
      } else {
        // Mettre à jour le googleId si nécessaire
        if (!user.googleId) {
          user.googleId = googleId;
          if (picture && !user.avatar) user.avatar = picture;
          await user.save();
        }
        logger.info(`✅ Utilisateur Google connecté: ${email}`);
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiry }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiry }
      );

      res.json({
        success: true,
        message: 'Connexion Google réussie',
        data: {
          user: user.toPublicJSON(),
          token,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Erreur Google Auth:', error.message);
      res.status(401).json({
        success: false,
        message: 'Token Google invalide',
        error: error.message,
      });
    }
  },
};

module.exports = authController;
