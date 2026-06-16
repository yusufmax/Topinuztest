const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload, uploadModel } = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/by-shop/:shopId/by-slug/:productSlug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Protected routes (admin/vendor)
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

// Media uploads
router.post('/:id/images', authMiddleware, upload.array('images', 10), productController.uploadProductImages);
router.post('/:id/ar-models', authMiddleware, uploadModel.single('model'), productController.uploadProductARModel);

module.exports = router;
