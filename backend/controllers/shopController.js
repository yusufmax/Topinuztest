const { Shop, ShopImage, SubCategory, Category, User, Review, sequelize } = require('../models');
const { Op } = require('sequelize');
const sharp = require('sharp');
const slugify = require('../utils/slugify');
const { uploadBuffer } = require('../utils/uploader');
const { recalculateShopRating } = require('../utils/ratingHelper');

const shopIncludes = [
    { model: SubCategory, through: { attributes: [] } },
    { model: Category, attributes: ['id', 'name', 'slug', 'icon'] },
    { model: ShopImage, attributes: ['id', 'url', 'order'] }
];

const bcrypt = require('bcryptjs');

const syncShopVendorAccount = async (shop, storeEnabled) => {
    const isEnabled = storeEnabled === true || storeEnabled === 'true' || storeEnabled === 1 || storeEnabled === '1';
    if (isEnabled) {
        let user = await User.findOne({ where: { ShopId: shop.id, role: 'vendor' } });
        if (!user) {
            const vendorUsername = `${shop.slug}_admin`;
            const vendorPassword = `${shop.slug}_pass2026`;
            const hashedPassword = await bcrypt.hash(vendorPassword, 12);

            user = await User.create({
                username: vendorUsername,
                password: hashedPassword,
                role: 'vendor',
                ShopId: shop.id
            });
            
            await shop.update({
                vendorUsername: vendorUsername,
                vendorPassword: vendorPassword
            });
            console.log(`Generated vendor account for ${shop.name}: ${vendorUsername} / ${vendorPassword}`);
        } else {
            const updates = {};
            if (!shop.vendorUsername) updates.vendorUsername = user.username;
            if (!shop.vendorPassword) updates.vendorPassword = `${shop.slug}_pass2026`;
            if (Object.keys(updates).length > 0) {
                await shop.update(updates);
            }
        }
    } else {
        await User.destroy({ where: { ShopId: shop.id, role: 'vendor' } });
        await shop.update({
            vendorUsername: null,
            vendorPassword: null
        });
        console.log(`Deleted vendor account for shop ${shop.id}`);
    }
};

// Simple in-memory cache for shop list queries
const _cache = new Map();
const CACHE_TTL = 60_000; // 60 seconds
function cacheGet(key) {
    const entry = _cache.get(key);
    if (!entry || Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.data;
}
function cacheSet(key, data) { _cache.set(key, { data, ts: Date.now() }); }
function cacheClear() { _cache.clear(); }

exports.getAllShops = async (req, res) => {
    try {
        const { category, subcategory, search } = req.query;
        const cacheKey = `${category}|${subcategory}|${search}`;
        const cached = cacheGet(cacheKey);
        if (cached) return res.json(cached);

        let whereClause = { isActive: true };
        if (search) {
            const isSqlite = sequelize.getDialect() === 'sqlite';
            const likeOp = isSqlite ? Op.like : Op.iLike;
            whereClause.name = { [likeOp]: `%${search}%` };
        }
        if (category) whereClause.CategoryId = category;

        // Filter by subcategory at DB level — avoids sending all shops to the client
        const subCatInclude = { model: SubCategory, through: { attributes: [] } };
        if (subcategory) {
            subCatInclude.where = { id: subcategory };
            subCatInclude.required = true;
        }

        const shops = await Shop.findAll({
            where: whereClause,
            include: [
                subCatInclude,
                { model: Category, attributes: ['id', 'name', 'slug', 'icon'] },
                { model: ShopImage, attributes: ['id', 'url', 'order'] },
            ],
        });

        const plainShops = shops.map(shop => {
            const s = shop.toJSON();
            if (!s.latitude || !s.longitude) {
                // Generate deterministic coordinate in Tashkent based on shop ID
                const angle = (s.id * 0.987654) * 2 * Math.PI;
                // radius between 0.005 and 0.065 degrees (~0.5km to 7km)
                const radius = 0.005 + ((s.id * 17) % 100) * 0.0006;
                s.latitude = 41.311081 + radius * Math.sin(angle);
                s.longitude = 69.240562 + radius * Math.cos(angle);
                s.isMockCoords = true;
            }
            return s;
        });

        // Shuffle on server so clients don't need to
        for (let i = plainShops.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [plainShops[i], plainShops[j]] = [plainShops[j], plainShops[i]];
        }

        const result = { success: true, data: plainShops };
        if (!search) cacheSet(cacheKey, result); // don't cache search results
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getShopBySlug = async (req, res) => {
    try {
        const shop = await Shop.findOne({
            where: { slug: req.params.slug },
            include: shopIncludes
        });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
        
        const shopJson = shop.toJSON();
        if (!shopJson.latitude || !shopJson.longitude) {
            const angle = (shopJson.id * 0.987654) * 2 * Math.PI;
            const radius = 0.005 + ((shopJson.id * 17) % 100) * 0.0006;
            shopJson.latitude = 41.311081 + radius * Math.sin(angle);
            shopJson.longitude = 69.240562 + radius * Math.cos(angle);
            shopJson.isMockCoords = true;
        }
        
        res.json({ success: true, data: shopJson });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getShopById = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id, { include: shopIncludes });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
        
        const shopJson = shop.toJSON();
        if (!shopJson.latitude || !shopJson.longitude) {
            const angle = (shopJson.id * 0.987654) * 2 * Math.PI;
            const radius = 0.005 + ((shopJson.id * 17) % 100) * 0.0006;
            shopJson.latitude = 41.311081 + radius * Math.sin(angle);
            shopJson.longitude = 69.240562 + radius * Math.cos(angle);
            shopJson.isMockCoords = true;
        }
        
        res.json({ success: true, data: shopJson });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createShop = async (req, res) => {
    try {
        if (req.body.name && !req.body.slug) {
            req.body.slug = slugify(req.body.name);
        } else if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        }

        const shop = await Shop.create(req.body);
        await recalculateShopRating(shop.id);

        const subCats = req.body.SubCategories || req.body.subCategoryIds;
        if (subCats && subCats.length) {
            await shop.setSubCategories(subCats);
        }

        await syncShopVendorAccount(shop, req.body.storeEnabled);

        cacheClear();
        const updatedShop = await Shop.findByPk(shop.id, { include: shopIncludes });
        res.json({ 
            success: true, 
            data: updatedShop
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateShop = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        } else if (req.body.name && !shop.slug) {
            req.body.slug = slugify(req.body.name);
        }

        await shop.update(req.body);
        await recalculateShopRating(shop.id);

        const subCats = req.body.SubCategories || req.body.subCategoryIds;
        if (subCats) {
            await shop.setSubCategories(subCats);
        }

        await syncShopVendorAccount(shop, req.body.storeEnabled);

        cacheClear();
        const updatedShop = await Shop.findByPk(shop.id, { include: shopIncludes });
        res.json({ success: true, data: updatedShop });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        await shop.destroy();
        cacheClear();
        res.json({ success: true, message: 'Shop deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addShopImage = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        const count = await ShopImage.count({ where: { ShopId: req.params.id } });
        if (count >= 3) {
            return res.status(400).json({ success: false, message: 'Max 3 images per shop' });
        }

        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const processedBuffer = await sharp(req.file.buffer)
            .resize(1000, 1000, { fit: 'cover', position: 'centre' })
            .jpeg({ quality: 85 })
            .toBuffer();

        try {
            const fileUrl = await uploadBuffer(processedBuffer, 'houz_shops_gallery', req.file.originalname, 'image');
            const image = await ShopImage.create({ url: fileUrl, order: count, ShopId: req.params.id });
            res.json({ success: true, data: image });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteShopImage = async (req, res) => {
    try {
        const image = await ShopImage.findOne({ where: { id: req.params.imageId, ShopId: req.params.id } });
        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

        await image.destroy();

        const remaining = await ShopImage.findAll({ where: { ShopId: req.params.id }, order: [['order', 'ASC']] });
        for (let i = 0; i < remaining.length; i++) {
            await remaining[i].update({ order: i });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.reorderShopImages = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'ids must be an array' });
        }
        for (let i = 0; i < ids.length; i++) {
            await ShopImage.update({ order: i }, { where: { id: ids[i], ShopId: req.params.id } });
        }
        const images = await ShopImage.findAll({ where: { ShopId: req.params.id }, order: [['order', 'ASC']] });
        res.json({ success: true, data: images });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMyShopProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.ShopId) {
            return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });
        }
        const shop = await Shop.findByPk(user.ShopId, { include: shopIncludes });
        res.json({ success: true, data: shop });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateMyShopProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.ShopId) {
            return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });
        }
        const shop = await Shop.findByPk(user.ShopId);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        } else if (req.body.name && !shop.slug) {
            req.body.slug = slugify(req.body.name);
        }

        await shop.update(req.body);
        await recalculateShopRating(shop.id);
        cacheClear();
        const updatedShop = await Shop.findByPk(shop.id, { include: shopIncludes });
        res.json({ success: true, data: updatedShop });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getShopReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { ShopId: req.params.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createShopReview = async (req, res) => {
    try {
        const { authorName, comment, rating } = req.body;
        if (!comment || rating === undefined) {
            return res.status(400).json({ success: false, message: 'Comment and rating are required' });
        }
        const numericRating = parseInt(rating);
        if (numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }
        const review = await Review.create({
            authorName: authorName || 'Гость',
            comment,
            rating: numericRating,
            ShopId: req.params.id
        });

        // Recalculate combined rating
        await recalculateShopRating(req.params.id);
        cacheClear();

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserLocationFromIp = async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return res.json({ success: true, data: { latitude: 41.311081, longitude: 69.240562, ip: ip, isFallback: true } });
        }
        
        try {
            const geoRes = await fetch(`https://freeipapi.com/api/json/${ip}`);
            if (geoRes.ok) {
                const data = await geoRes.json();
                if (data && data.latitude && data.longitude) {
                    return res.json({
                        success: true,
                        data: {
                            latitude: parseFloat(data.latitude),
                            longitude: parseFloat(data.longitude),
                            ip: ip
                        }
                    });
                }
            }
        } catch (e) {
            console.error('freeipapi error:', e.message);
        }
        
        try {
            const geoRes2 = await fetch(`https://ipapi.co/${ip}/json/`);
            if (geoRes2.ok) {
                const data2 = await geoRes2.json();
                if (data2 && data2.latitude && data2.longitude) {
                    return res.json({
                        success: true,
                        data: {
                            latitude: parseFloat(data2.latitude),
                            longitude: parseFloat(data2.longitude),
                            ip: ip
                        }
                    });
                }
            }
        } catch (e) {
            console.error('ipapi error:', e.message);
        }
        
        res.json({ success: true, data: { latitude: 41.311081, longitude: 69.240562, ip: ip, isFallback: true } });
    } catch (err) {
        res.json({ success: true, data: { latitude: 41.311081, longitude: 69.240562, isFallback: true, message: err.message } });
    }
};
