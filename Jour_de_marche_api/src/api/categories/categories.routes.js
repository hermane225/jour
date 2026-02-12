const express = require('express');
const router = express.Router();
const categoriesController = require('./categories.controller');
const categoriesValidators = require('./categories.validator');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public routes
router.get('/', categoriesController.getAllCategories);

// Admin only routes
router.post('/', authenticate, authorize(['admin']), validate(categoriesValidators.create), categoriesController.createCategory);
router.put('/:id', authenticate, authorize(['admin']), validate(categoriesValidators.update), categoriesController.updateCategory);
router.delete('/:id', authenticate, authorize(['admin']), validate(categoriesValidators.delete), categoriesController.deleteCategory);

module.exports = router;
