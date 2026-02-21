const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');
const logger = require('../../config/logger');

// Toujours résoudre le chemin absolu pour cohérence avec express.static
const RESOLVED_UPLOAD_DIR = path.resolve(config.storage.path);

const storageService = {
  /**
   * Retourne le chemin absolu utilisé pour les uploads
   */
  getUploadDir: () => RESOLVED_UPLOAD_DIR,

  saveFile: async (file, folder = 'general') => {
    try {
      const uploadDir = path.join(RESOLVED_UPLOAD_DIR, folder);
      
      // Create directory if not exists
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${uuidv4()}-${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, file.buffer);

      logger.info(`✅ Fichier sauvegardé: ${fileName}`);
      return {
        fileName,
        filePath: `/uploads/${folder}/${fileName}`,
        size: file.size,
      };
    } catch (error) {
      logger.error('❌ Erreur lors de la sauvegarde du fichier:', error.message);
      throw error;
    }
  },

  deleteFile: async (filePath) => {
    try {
      const fullPath = path.join(RESOLVED_UPLOAD_DIR, filePath.replace('/uploads/', ''));
      await fs.unlink(fullPath);
      logger.info(`✅ Fichier supprimé: ${filePath}`);
      return true;
    } catch (error) {
      logger.error('❌ Erreur lors de la suppression du fichier:', error.message);
      return false;
    }
  },

  getFile: async (filePath) => {
    try {
      const fullPath = path.join(RESOLVED_UPLOAD_DIR, filePath.replace('/uploads/', ''));
      return await fs.readFile(fullPath);
    } catch (error) {
      logger.error('❌ Erreur lors de la lecture du fichier:', error.message);
      return null;
    }
  },
};

module.exports = storageService;
