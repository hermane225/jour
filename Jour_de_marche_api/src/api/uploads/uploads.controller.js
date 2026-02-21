const path = require('path');
const fs = require('fs');
const Shop = require('../../models/Shop');
const Product = require('../../models/Product');
const logger = require('../../../config/logger');
const config = require('../../../config');

const getUserUploadDir = (userId) => path.join(path.resolve(config.storage.path), String(userId));
const toRelativeUploadUrl = (userId, filename) => `/uploads/${userId}/${filename}`;

const persistUploadUrl = async ({ userId, body, urls }) => {
  const { shopId, productId, field } = body || {};

  if (!field || (!shopId && !productId)) {
    return;
  }

  if (shopId) {
    if (!['logo', 'banner'].includes(field)) {
      return;
    }

    const shop = await Shop.findOne({ _id: shopId, owner: userId });
    if (!shop) {
      throw new Error('Boutique introuvable ou non autorisee');
    }

    shop[field] = urls[0] || shop[field];
    await shop.save();
    return;
  }

  if (productId) {
    if (field !== 'images') {
      return;
    }

    const product = await Product.findById(productId).populate('shop', 'owner');
    if (!product || String(product.shop?.owner) !== String(userId)) {
      throw new Error('Produit introuvable ou non autorise');
    }

    product.images = Array.isArray(product.images) ? [...product.images, ...urls] : [...urls];
    await product.save();
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploade',
      });
    }

    const userId = String(req.user.id || req.user._id);
    const fileUrl = toRelativeUploadUrl(userId, req.file.filename);

    await persistUploadUrl({
      userId,
      body: req.body,
      urls: [fileUrl],
    });

    logger.info(`File uploaded: ${req.file.filename}`);

    res.status(201).json({
      success: true,
      message: 'Fichier uploade avec succes',
      data: {
        id: path.parse(req.file.filename).name,
        filename: req.file.originalname,
        storedFilename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    next(error);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploade',
      });
    }

    const userId = String(req.user.id || req.user._id);

    const files = req.files.map((file) => ({
      id: path.parse(file.filename).name,
      filename: file.originalname,
      storedFilename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: toRelativeUploadUrl(userId, file.filename),
    }));

    await persistUploadUrl({
      userId,
      body: req.body,
      urls: files.map((file) => file.url),
    });

    logger.info(`${files.length} files uploaded`);

    res.status(201).json({
      success: true,
      message: 'Fichiers uploades avec succes',
      data: files,
    });
  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const uploadDir = getUserUploadDir(req.user.id || req.user._id);

    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouve',
      });
    }

    const files = fs.readdirSync(uploadDir);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouve',
      });
    }

    const filepath = path.join(uploadDir, file);
    fs.unlinkSync(filepath);

    logger.info(`File deleted: ${fileId}`);

    res.status(200).json({
      success: true,
      message: 'Fichier supprime',
    });
  } catch (error) {
    logger.error(`Delete error: ${error.message}`);
    next(error);
  }
};

exports.getFileInfo = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = String(req.user.id || req.user._id);
    const uploadDir = getUserUploadDir(userId);

    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouve',
      });
    }

    const files = fs.readdirSync(uploadDir);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouve',
      });
    }

    const filepath = path.join(uploadDir, file);
    const stats = fs.statSync(filepath);

    res.status(200).json({
      success: true,
      message: 'Info fichier recuperee',
      data: {
        id: fileId,
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: toRelativeUploadUrl(userId, file),
      },
    });
  } catch (error) {
    logger.error(`Get info error: ${error.message}`);
    next(error);
  }
};