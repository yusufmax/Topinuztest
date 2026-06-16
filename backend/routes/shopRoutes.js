const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

router.get('/', shopController.getAllShops);
router.get('/by-slug/:slug', shopController.getShopBySlug);
router.get('/profile', authMiddleware, shopController.getMyShopProfile);
router.put('/profile', authMiddleware, shopController.updateMyShopProfile);
router.get('/:id', shopController.getShopById);
router.post('/', authMiddleware, shopController.createShop);
router.put('/:id', authMiddleware, shopController.updateShop);
router.delete('/:id', authMiddleware, shopController.deleteShop);

// Products under this shop
router.get('/:shopId/products', productController.getAllProducts);

router.post('/:id/images', authMiddleware, upload.single('image'), shopController.addShopImage);
router.delete('/:id/images/:imageId', authMiddleware, shopController.deleteShopImage);
router.put('/:id/images/reorder', authMiddleware, shopController.reorderShopImages);

module.exports = router;
