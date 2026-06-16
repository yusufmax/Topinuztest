const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/track', analyticsController.trackEvent);
router.get('/store', authMiddleware, analyticsController.getStoreAnalytics);
router.get('/platform', authMiddleware, analyticsController.getPlatformAnalytics);
router.get('/public-stats', analyticsController.getPublicStats);

module.exports = router;


