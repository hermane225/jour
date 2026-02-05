const express = require('express');
const multer = require('multer');
const uploadsController = require('./uploads.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/temp',
  limits: {
    fileSize: 52428800, // 50MB
  },
});

/**
 * @route   POST /api/uploads/single
 * @desc    Upload a single file
 * @access  Private
 */
router.post(
  '/single',
  authMiddleware,
  upload.single('file'),
  uploadsController.uploadFile,
);

/**
 * @route   POST /api/uploads/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post(
  '/multiple',
  authMiddleware,
  upload.array('files', 10),
  uploadsController.uploadMultiple,
);

/**
 * @route   GET /api/uploads/:fileId
 * @desc    Get file info
 * @access  Private
 */
router.get(
  '/:fileId',
  authMiddleware,
  uploadsController.getFileInfo,
);

/**
 * @route   DELETE /api/uploads/:fileId
 * @desc    Delete file
 * @access  Private
 */
router.delete(
  '/:fileId',
  authMiddleware,
  uploadsController.deleteFile,
);

module.exports = router;
