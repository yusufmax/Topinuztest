const { Product, Shop, Category, SubCategory, Review, sequelize } = require('../models');
const { Op } = require('sequelize');
const sharp = require('sharp');
const crypto = require('crypto');
const slugify = require('../utils/slugify');
const { uploadBuffer } = require('../utils/uploader');
const { recalculateProductRating } = require('../utils/ratingHelper');

const productIncludes = [
    { model: Shop, attributes: ['id', 'name', 'slug', 'logoUrl', 'phone', 'telegram', 'instagram'] },
    { model: Category, attributes: ['id', 'name', 'slug'] },
    { model: SubCategory, attributes: ['id', 'name', 'slug'] }
];

// GET /api/products or /api/shops/:shopId/products
exports.getAllProducts = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { category, subcategory, search, minPrice, maxPrice, inStock, hasAr, page = 1, limit = 24, includeDrafts } = req.query;

        let whereClause = {};
        if (includeDrafts !== 'true') {
            whereClause.isAvailable = true;
            whereClause.isPublished = true;
        }
        
        if (shopId) whereClause.ShopId = shopId;
        if (category) whereClause.CategoryId = category;
        if (subcategory) whereClause.SubCategoryId = subcategory;
        
        // Search filter (full text search mockup on name & tags)
        if (search) {
            const isSqlite = sequelize.getDialect() === 'sqlite';
            const likeOp = isSqlite ? Op.like : Op.iLike;
            whereClause[Op.or] = [
                { name: { [likeOp]: `%${search}%` } },
                { description: { [likeOp]: `%${search}%` } },
                { tags: { [likeOp]: `%${search}%` } }
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }

        // Stock status filter
        if (inStock === 'true') {
            whereClause.stockStatus = 'In Stock';
        }

        // AR availability filter
        if (hasAr === 'true') {
            whereClause[Op.or] = [
                { glbUrl: { [Op.ne]: null } },
                { usdzUrl: { [Op.ne]: null } }
            ];
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: productIncludes,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            meta: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, { include: productIncludes });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/shops/:shopId/products/by-slug/:productSlug
exports.getProductBySlug = async (req, res) => {
    try {
        const { shopId, productSlug } = req.params;
        const product = await Product.findOne({
            where: { ShopId: shopId, slug: productSlug },
            include: productIncludes
        });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/products
exports.createProduct = async (req, res) => {
    try {
        if (req.body.name && !req.body.slug) {
            req.body.slug = slugify(req.body.name);
        } else if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        }

        const product = await Product.create(req.body);
        await recalculateProductRating(product.id);
        const updatedProduct = await Product.findByPk(product.id, { include: productIncludes });
        res.status(201).json({ success: true, data: updatedProduct });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        } else if (req.body.name && !product.slug) {
            req.body.slug = slugify(req.body.name);
        }

        await product.update(req.body);
        await recalculateProductRating(product.id);
        const updatedProduct = await Product.findByPk(product.id, { include: productIncludes });
        res.json({ success: true, data: updatedProduct });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        await product.destroy();
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/products/:id/images (multi-image upload)
exports.uploadProductImages = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        let currentImages = [];
        if (product.images) {
            try {
                currentImages = JSON.parse(product.images);
            } catch (e) {
                currentImages = [];
            }
        }

        if (currentImages.length + req.files.length > 10) {
            return res.status(400).json({ success: false, message: 'Max 10 images per product allowed' });
        }

        const uploadPromises = req.files.map(async (file) => {
            const processedBuffer = await sharp(file.buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();

            const ext = file.originalname.split('.').pop().toLowerCase() || 'jpg';
            const filename = `${crypto.randomUUID()}.${ext}`;
            return uploadBuffer(processedBuffer, 'topin_products_gallery', filename, 'image');
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        currentImages.push(...uploadedUrls);

        // Update product images
        product.images = JSON.stringify(currentImages);
        // Automatically set first image as imageUrl if currently empty
        if (!product.imageUrl && currentImages.length > 0) {
            product.imageUrl = currentImages[0];
        }
        await product.save();

        res.json({ success: true, data: currentImages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/products/:id/ar-models (handles GLB / USDZ uploads)
exports.uploadProductARModel = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Limit check (50 MB)
        if (req.file.size > 50 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'File size exceeds 50 MB limit' });
        }

        const ext = req.file.originalname.split('.').pop().toLowerCase();
        if (ext !== 'glb' && ext !== 'usdz') {
            return res.status(400).json({ success: false, message: 'Invalid file extension. Only .glb and .usdz are allowed.' });
        }

        const filename = `${product.slug}_${Date.now()}.${ext}`;
        const fileUrl = await uploadBuffer(req.file.buffer, 'topin_ar_models', filename, 'raw');

        if (ext === 'glb') {
            product.glbUrl = fileUrl;
        } else if (ext === 'usdz') {
            product.usdzUrl = fileUrl;
        }
        
        await product.save();
        res.json({ success: true, data: { glbUrl: product.glbUrl, usdzUrl: product.usdzUrl } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { ProductId: req.params.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createProductReview = async (req, res) => {
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
            ProductId: req.params.id
        });

        // Recalculate combined rating
        await recalculateProductRating(req.params.id);

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
