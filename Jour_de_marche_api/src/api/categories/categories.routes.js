const express = require('express');
const router = express.Router();
const categoriesController = require('./categories.controller');
const categoriesValidators = require('./categories.validator');
const validationMiddleware = require('../../middlewares/validation.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const rolesMiddleware = require('../../middlewares/roles.middleware');

// Public routes
router.get('/', categoriesController.getAllCategories);

// Admin only routes
router.post('/', authMiddleware, rolesMiddleware(['admin']), categoriesValidators.create, validationMiddleware, categoriesController.createCategory);
router.put('/:id', authMiddleware, rolesMiddleware(['admin']), categoriesValidators.update, validationMiddleware, categoriesController.updateCategory);
router.delete('/:id', authMiddleware, rolesMiddleware(['admin']), categoriesValidators.delete, validationMiddleware, categoriesController.deleteCategory);

module.exports = router;
