const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../../config/logger');

let transporter = null;

const initMailer = () => {
  if (config.smtp.host && config.smtp.user && config.smtp.pass) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  } else {
    logger.warn('⚠️  Email service non configuré');
  }
};

const mailerService = {
  sendEmail: async (to, subject, html, text = '') => {
    try {
      if (!transporter) {
        initMailer();
      }

      if (!transporter) {
        logger.warn('⚠️  Impossible d\'envoyer l\'email - service non configuré');
        return false;
      }

      const result = await transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
        text,
      });

      logger.info(`✅ Email envoyé: ${to}`);
      return result;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
      return false;
    }
  },

  sendWelcomeEmail: async (user) => {
    return mailerService.sendEmail(
      user.email,
      'Bienvenue sur Jour de Marché',
      `<h1>Bienvenue ${user.firstName}!</h1><p>Merci de vous être inscrit sur Jour de Marché.</p>`
    );
  },

  sendPasswordResetEmail: async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    return mailerService.sendEmail(
      user.email,
      'Réinitialisation du mot de passe',
      `<h1>Réinitialisation du mot de passe</h1><p>Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe</p>`
    );
  },

  sendOrderConfirmationEmail: async (user, order) => {
    return mailerService.sendEmail(
      user.email,
      `Commande confirmée - ${order.orderNumber}`,
      `<h1>Votre commande a été confirmée</h1><p>Numéro de commande: ${order.orderNumber}</p>`
    );
  },
};

initMailer();

module.exports = mailerService;
