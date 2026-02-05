const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../../config/logger');

/**
 * Upload file
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé',
      });
    }

    const { file } = req;
    const fileId = uuidv4();
    const uploadDir = path.join(__dirname, '../../../uploads', req.user.id);

    // Create user upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Move file to upload directory
    fs.copyFileSync(file.path, filepath);
    fs.unlinkSync(file.path);

    const fileUrl = `/uploads/${req.user.id}/${filename}`;

    logger.info(`✅ Fichier uploadé: ${filename}`);

    res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: {
        id: fileId,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    logger.error(`Erreur upload fichier: ${error.message}`);
    next(error);
  }
};

/**
 * Upload multiple files
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé',
      });
    }

    const uploadDir = path.join(__dirname, '../../../uploads', req.user.id);

    // Create user upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const files = req.files.map((file) => {
      const fileId = uuidv4();
      const ext = path.extname(file.originalname);
      const filename = `${fileId}${ext}`;
      const filepath = path.join(uploadDir, filename);

      fs.copyFileSync(file.path, filepath);
      fs.unlinkSync(file.path);

      return {
        id: fileId,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${req.user.id}/${filename}`,
      };
    });

    logger.info(`✅ ${files.length} fichiers uploadés`);

    res.status(201).json({
      success: true,
      message: 'Fichiers uploadés avec succès',
      data: files,
    });
  } catch (error) {
    logger.error(`Erreur upload fichiers: ${error.message}`);
    next(error);
  }
};

/**
 * Delete file
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const uploadDir = path.join(__dirname, '../../../uploads', req.user.id);

    // Find file with matching ID
    const files = fs.readdirSync(uploadDir);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé',
      });
    }

    const filepath = path.join(uploadDir, file);
    fs.unlinkSync(filepath);

    logger.info(`✅ Fichier supprimé: ${fileId}`);

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé',
    });
  } catch (error) {
    logger.error(`Erreur suppression fichier: ${error.message}`);
    next(error);
  }
};

/**
 * Get file info
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getFileInfo = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const uploadDir = path.join(__dirname, '../../../uploads', req.user.id);

    // Find file with matching ID
    const files = fs.readdirSync(uploadDir);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé',
      });
    }

    const filepath = path.join(uploadDir, file);
    const stats = fs.statSync(filepath);

    res.status(200).json({
      success: true,
      message: 'Info fichier récupérée',
      data: {
        id: fileId,
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: `/uploads/${req.user.id}/${file}`,
      },
    });
  } catch (error) {
    logger.error(`Erreur récupération info fichier: ${error.message}`);
    next(error);
  }
};
