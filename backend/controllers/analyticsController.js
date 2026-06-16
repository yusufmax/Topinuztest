const { AnalyticsEvent, Product, Shop, User } = require('../models');
const { Op } = require('sequelize');

// POST /api/analytics/track
exports.trackEvent = async (req, res) => {
    try {
        const { eventType, deviceType, referrer, shopId, productId } = req.body;
        
        await AnalyticsEvent.create({
            eventType,
            deviceType: deviceType || 'desktop',
            referrer: referrer || 'direct',
            ShopId: shopId ? parseInt(shopId) : null,
            ProductId: productId ? parseInt(productId) : null
        });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/store
exports.getStoreAnalytics = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        let shopId = user.ShopId;
        // If super-admin, allow passing a shopId query parameter
        if (user.role === 'admin' && req.query.shopId) {
            shopId = parseInt(req.query.shopId);
        }
        
        if (!shopId && user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'User is not associated with any shop' });
        }
        
        const { range = '30', startDate, endDate } = req.query;
        let start = new Date();
        let end = new Date();
        
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        } else {
            const days = parseInt(range) || 30;
            start.setDate(start.getDate() - days);
            start.setHours(0, 0, 0, 0);
        }
        
        const whereClause = {
            createdAt: {
                [Op.between]: [start, end]
            }
        };
        if (shopId) {
            whereClause.ShopId = shopId;
        }
        
        const events = await AnalyticsEvent.findAll({
            where: whereClause,
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'slug']
                }
            ],
            order: [['createdAt', 'ASC']]
        });
        
        // Aggregate statistics in JavaScript to be 100% dialect-safe
        const dailyViews = {};
        const dailyArLoads = {};
        
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dailyViews[dateStr] = 0;
            dailyArLoads[dateStr] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const productViewsMap = {};
        const productArMap = {};
        const deviceTypeMap = { desktop: 0, mobile: 0, tablet: 0 };
        const referrerMap = { direct: 0, search: 0, social: 0 };
        
        let totalPageViews = 0;
        let totalProductViews = 0;
        let totalArLoads = 0;
        
        events.forEach(event => {
            const dateStr = event.createdAt.toISOString().split('T')[0];
            
            // Device Type
            const dev = (event.deviceType || 'desktop').toLowerCase();
            if (deviceTypeMap[dev] !== undefined) {
                deviceTypeMap[dev]++;
            } else {
                deviceTypeMap[dev] = (deviceTypeMap[dev] || 0) + 1;
            }
            
            // Referrer
            const ref = (event.referrer || 'direct').toLowerCase();
            if (ref.includes('search') || ref.includes('google') || ref.includes('yandex') || ref === 'search') {
                referrerMap.search++;
            } else if (ref.includes('telegram') || ref.includes('instagram') || ref.includes('facebook') || ref.includes('social') || ref === 'social') {
                referrerMap.social++;
            } else {
                referrerMap.direct++;
            }
            
            if (event.eventType === 'page_view') {
                totalPageViews++;
                if (dailyViews[dateStr] !== undefined) dailyViews[dateStr]++;
            } else if (event.eventType === 'product_view') {
                totalProductViews++;
                if (dailyViews[dateStr] !== undefined) dailyViews[dateStr]++;
                
                if (event.Product) {
                    const prodKey = JSON.stringify({ id: event.Product.id, name: event.Product.name, slug: event.Product.slug });
                    productViewsMap[prodKey] = (productViewsMap[prodKey] || 0) + 1;
                }
            } else if (event.eventType === 'ar_load') {
                totalArLoads++;
                if (dailyArLoads[dateStr] !== undefined) dailyArLoads[dateStr]++;
                
                if (event.Product) {
                    const prodKey = JSON.stringify({ id: event.Product.id, name: event.Product.name, slug: event.Product.slug });
                    productArMap[prodKey] = (productArMap[prodKey] || 0) + 1;
                }
            }
        });
        
        const topProducts = Object.keys(productViewsMap).map(key => {
            const info = JSON.parse(key);
            return {
                ...info,
                views: productViewsMap[key]
            };
        }).sort((a, b) => b.views - a.views).slice(0, 10);
        
        const topArProducts = Object.keys(productArMap).map(key => {
            const info = JSON.parse(key);
            return {
                ...info,
                loads: productArMap[key]
            };
        }).sort((a, b) => b.loads - a.loads).slice(0, 10);
        
        const chartData = Object.keys(dailyViews).map(date => ({
            date,
            views: dailyViews[date],
            arLoads: dailyArLoads[date]
        }));
        
        res.json({
            success: true,
            data: {
                summary: {
                    totalPageViews,
                    totalProductViews,
                    totalArLoads,
                    totalViews: totalPageViews + totalProductViews
                },
                chartData,
                topProducts,
                topArProducts,
                deviceBreakdown: deviceTypeMap,
                referrerBreakdown: referrerMap
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/platform
exports.getPlatformAnalytics = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const { range = '30', startDate, endDate } = req.query;
        let start = new Date();
        let end = new Date();
        
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        } else {
            const days = parseInt(range) || 30;
            start.setDate(start.getDate() - days);
            start.setHours(0, 0, 0, 0);
        }
        
        const events = await AnalyticsEvent.findAll({
            where: {
                createdAt: {
                    [Op.between]: [start, end]
                }
            },
            include: [
                { model: Product, attributes: ['id', 'name', 'slug'] },
                { model: Shop, attributes: ['id', 'name', 'slug'] }
            ],
            order: [['createdAt', 'ASC']]
        });
        
        const dailyViews = {};
        const dailyProductViews = {};
        const dailyArLoads = {};
        
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dailyViews[dateStr] = 0;
            dailyProductViews[dateStr] = 0;
            dailyArLoads[dateStr] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const productViewsMap = {};
        const shopViewsMap = {};
        
        events.forEach(event => {
            const dateStr = event.createdAt.toISOString().split('T')[0];
            
            if (event.eventType === 'page_view') {
                if (dailyViews[dateStr] !== undefined) dailyViews[dateStr]++;
                if (event.Shop) {
                    const shopKey = JSON.stringify({ id: event.Shop.id, name: event.Shop.name, slug: event.Shop.slug });
                    shopViewsMap[shopKey] = (shopViewsMap[shopKey] || 0) + 1;
                }
            } else if (event.eventType === 'product_view') {
                if (dailyProductViews[dateStr] !== undefined) dailyProductViews[dateStr]++;
                if (event.Product) {
                    const prodKey = JSON.stringify({ id: event.Product.id, name: event.Product.name, slug: event.Product.slug });
                    productViewsMap[prodKey] = (productViewsMap[prodKey] || 0) + 1;
                }
            } else if (event.eventType === 'ar_load') {
                if (dailyArLoads[dateStr] !== undefined) dailyArLoads[dateStr]++;
            }
        });
        
        const topProducts = Object.keys(productViewsMap).map(key => {
            const info = JSON.parse(key);
            return { ...info, views: productViewsMap[key] };
        }).sort((a, b) => b.views - a.views).slice(0, 20);
        
        const topShops = Object.keys(shopViewsMap).map(key => {
            const info = JSON.parse(key);
            return { ...info, views: shopViewsMap[key] };
        }).sort((a, b) => b.views - a.views).slice(0, 20);
        
        // Month by month store registration (bar chart)
        const registrationsByMonth = {};
        const allShops = await Shop.findAll({ attributes: ['createdAt'] });
        allShops.forEach(s => {
            if (s.createdAt) {
                const monthStr = s.createdAt.toISOString().substring(0, 7); // e.g. "2026-06"
                registrationsByMonth[monthStr] = (registrationsByMonth[monthStr] || 0) + 1;
            }
        });
        
        const chartData = Object.keys(dailyViews).map(date => ({
            date,
            platformVisits: dailyViews[date],
            productViews: dailyProductViews[date],
            arLoads: dailyArLoads[date]
        }));
        
        res.json({
            success: true,
            data: {
                chartData,
                topProducts,
                topShops,
                registrationsByMonth
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/public-stats
exports.getPublicStats = async (req, res) => {
    try {
        const totalShops = await Shop.count({ where: { isActive: true } });
        const totalProducts = await Product.count({ where: { isAvailable: true, isPublished: true } });
        
        // Count products with AR models
        const totalArModels = await Product.count({
            where: {
                isAvailable: true,
                isPublished: true,
                [Op.or]: [
                    { glbUrl: { [Op.ne]: null } },
                    { usdzUrl: { [Op.ne]: null } }
                ]
            }
        });
        
        res.json({
            success: true,
            data: {
                totalShops,
                totalProducts,
                totalArModels
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

