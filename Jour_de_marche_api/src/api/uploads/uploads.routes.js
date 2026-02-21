const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../config');
const uploadsController = require('./uploads.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return cb(new Error('Utilisateur non authentifie'));
    }

    const userUploadDir = path.join(path.resolve(config.storage.path), String(userId));
    fs.mkdirSync(userUploadDir, { recursive: true });
    return cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname) || '';
    cb(null, `${uuidv4()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 52428800,
  },
});

router.post('/single', authMiddleware, upload.single('file'), uploadsController.uploadFile);
router.post('/multiple', authMiddleware, upload.array('files', 10), uploadsController.uploadMultiple);
router.get('/:fileId', authMiddleware, uploadsController.getFileInfo);
router.delete('/:fileId', authMiddleware, uploadsController.deleteFile);

module.exports = router;