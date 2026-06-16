const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

router.post('/login', authController.login);
router.post('/upload', authMiddleware, upload.single('image'), authController.uploadImage);
router.post('/impersonate/:shopId', authMiddleware, authController.impersonate);

module.exports = router;

