const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/', subCategoryController.getAllSubCategories);
router.post('/', authMiddleware, subCategoryController.createSubCategory);
router.put('/reorder', authMiddleware, subCategoryController.reorderSubcategories);
router.put('/:id', authMiddleware, subCategoryController.updateSubCategory);
router.delete('/:id', authMiddleware, subCategoryController.deleteSubCategory);

module.exports = router;
