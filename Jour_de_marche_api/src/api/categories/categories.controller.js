const Category = require('../../models/Category');
const logger = require('../../../config/logger');

const categoriesController = {
  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const filter = { status: 'active' };

      const categories = await Category.find(filter)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await Category.countDocuments(filter);

      res.json({
        success: true,
        data: categories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des catégories:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des catégories',
      });
    }
  },

  // Create category
  createCategory: async (req, res) => {
    try {
      const { name, description, icon, subcategories } = req.body;

      const category = new Category({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        icon,
        subcategories: subcategories || [],
      });

      await category.save();

      logger.info(`✅ Catégorie créée: ${name}`);

      res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès',
        data: category,
      });
    } catch (error) {
      logger.error('Erreur lors de la création de la catégorie:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la catégorie',
      });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, icon, status, subcategories } = req.body;

      const updateData = { name, description, icon, status };
      
      // Only add subcategories to update if it's provided
      if (subcategories !== undefined) {
        updateData.subcategories = subcategories;
      }

      const category = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée',
        });
      }

      logger.info(`✅ Catégorie mise à jour: ${name}`);

      res.json({
        success: true,
        message: 'Catégorie mise à jour avec succès',
        data: category,
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la catégorie:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la catégorie',
      });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée',
        });
      }

      logger.info(`✅ Catégorie supprimée: ${category.name}`);

      res.json({
        success: true,
        message: 'Catégorie supprimée avec succès',
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression de la catégorie:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la catégorie',
      });
    }
  },
};

module.exports = categoriesController;
