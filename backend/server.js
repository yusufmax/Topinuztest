require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { initDb } = require('./models');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
// Increase body parser limits for large Base64 payloads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Cache the shops.html file in memory — cleared on each deploy (process restart)
let _shopsHtml = null;

// SSR Open Graph Interceptor for Telegram/WhatsApp previews & Clean URL serving
app.get('/shops', async (req, res, next) => {
    const shopId = req.query.shop;

    try {
        if (!_shopsHtml) _shopsHtml = fs.readFileSync(path.join(__dirname, '../frontend/shops.html'), 'utf-8');
        let html = _shopsHtml;

        if (shopId) {
            const { Shop, Category } = require('./models');
            const shop = await Shop.findByPk(shopId, { include: [{ model: Category }] });

            if (shop) {
                const catName = shop.Category ? (shop.Category.name_ru || shop.Category.name) : '';
                const titleStr = catName ? `${catName} - ${shop.name}` : shop.name;
                const safeTitle = (titleStr || 'Topin').replace(/"/g, '&quot;');
                
                const rawDesc = shop.description_ru || shop.description || "";
                const safeDesc = rawDesc.substring(0, 160).replace(/"/g, '&quot;');
                const safeImage = 'https://topin.uz/img/Topin_logo.jpeg';
                const url = `https://topin.uz/shops?category=${req.query.category || 'all'}&shop=${shopId}`;

                const ogTags = `
            <!-- Dynamic Open Graph Data -->
            <meta property="og:title" content="${safeTitle}">
            <meta property="og:description" content="${safeDesc}">
            <meta property="og:image" content="${safeImage}">
            <meta property="og:url" content="${url}">
            <meta property="og:type" content="website">
            
            <!-- Dynamic Twitter Card Data -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${safeTitle}">
            <meta name="twitter:description" content="${safeDesc}">
            <meta name="twitter:image" content="${safeImage}">
                `;

                // Inject into <head>
                html = html.replace('</head>', `${ogTags}\n</head>`);
                html = html.replace(/<title>.*<\/title>/, `<title>${safeTitle} | Topin</title>`);
            }
        }
        
        return res.send(html);
    } catch (err) {
        console.error('OG Tag Injection Error:', err);
        return res.sendFile(path.join(__dirname, '../frontend/shops.html'));
    }
});

// Redirects for legacy .html URLs to clean dynamic routes
app.get('/shops.html', (req, res) => {
    const query = req.url.split('?')[1] || '';
    res.redirect(301, `/shops${query ? '?' + query : ''}`);
});

app.get('/index.html', (req, res) => {
    const query = req.url.split('?')[1] || '';
    res.redirect(301, `/${query ? '?' + query : ''}`);
});

let _storeHtml = null;
app.get('/stores/:storeSlug', async (req, res, next) => {
    const { storeSlug } = req.params;
    try {
        const { Shop, Category } = require('./models');
        const shop = await Shop.findOne({
            where: { slug: storeSlug },
            include: [{ model: Category }]
        });

        if (!shop) return next();

        if (!_storeHtml) {
            const filePath = path.join(__dirname, '../frontend/store.html');
            if (fs.existsSync(filePath)) {
                _storeHtml = fs.readFileSync(filePath, 'utf-8');
            } else {
                return res.status(404).send('Storefront template not found');
            }
        }
        let html = _storeHtml;

        const catName = shop.Category ? (shop.Category.name_ru || shop.Category.name) : '';
        const titleStr = catName ? `${catName} - ${shop.name}` : shop.name;
        const safeTitle = (titleStr || 'Topin').replace(/"/g, '&quot;');

        const rawDesc = shop.description_ru || shop.description || "";
        const safeDesc = rawDesc.substring(0, 160).replace(/"/g, '&quot;');
        const safeImage = shop.logoUrl || 'https://topin.uz/img/Topin_logo.jpeg';
        const url = `https://topin.uz/stores/${storeSlug}`;

        const ogTags = `
    <!-- Dynamic Open Graph Data -->
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="website">
    
    <!-- Dynamic Twitter Card Data -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${safeImage}">
        `;

        // JSON-LD Structured Data for Storefront
        const storefrontSchema = {
            "@context": "https://schema.org",
            "@type": "Store",
            "name": shop.name,
            "description": rawDesc.substring(0, 300),
            "image": safeImage,
            "url": url,
            "telephone": shop.phone || "",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": shop.location || ""
            }
        };
        const jsonLdStore = `<script type="application/ld+json">${JSON.stringify(storefrontSchema)}</script>`;

        html = html.replace('</head>', `${ogTags}\n    ${jsonLdStore}\n</head>`);
        html = html.replace(/<title>.*<\/title>/, `<title>${safeTitle} | Topin</title>`);

        return res.send(html);
    } catch (err) {
        console.error('OG Tag Injection Error (Storefront):', err);
        return next();
    }
});

let _productHtml = null;
app.get('/stores/:storeSlug/products/:productSlug', async (req, res, next) => {
    const { storeSlug, productSlug } = req.params;
    try {
        const { Product, Shop } = require('./models');
        const shop = await Shop.findOne({ where: { slug: storeSlug } });
        if (!shop) return next();

        const product = await Product.findOne({
            where: { ShopId: shop.id, slug: productSlug }
        });
        if (!product) return next();

        if (!_productHtml) {
            const filePath = path.join(__dirname, '../frontend/product.html');
            if (fs.existsSync(filePath)) {
                _productHtml = fs.readFileSync(filePath, 'utf-8');
            } else {
                return res.status(404).send('Product template not found');
            }
        }
        let html = _productHtml;

        const titleStr = `${product.name} - ${shop.name}`;
        const safeTitle = titleStr.replace(/"/g, '&quot;');

        const rawDesc = product.shortDescription || product.description || "";
        const safeDesc = rawDesc.substring(0, 160).replace(/"/g, '&quot;');
        const safeImage = product.imageUrl || 'https://topin.uz/img/Topin_logo.jpeg';
        const url = `https://topin.uz/stores/${storeSlug}/products/${productSlug}`;

        const ogTags = `
    <!-- Dynamic Open Graph Data -->
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="website">
    
    <!-- Dynamic Twitter Card Data -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${safeImage}">
        `;

        // JSON-LD Structured Data for Product
        const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": safeImage,
            "description": rawDesc.substring(0, 300),
            "url": url,
            "offers": {
                "@type": "Offer",
                "price": parseFloat(product.salePrice || product.price || 0).toFixed(2),
                "priceCurrency": shop.currency || "UZS",
                "availability": product.stockStatus === 'In Stock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
        };
        const jsonLdProduct = `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`;

        html = html.replace('</head>', `${ogTags}\n    ${jsonLdProduct}\n</head>`);
        html = html.replace(/<title>.*<\/title>/, `<title>${safeTitle} | Topin</title>`);

        return res.send(html);
    } catch (err) {
        console.error('OG Tag Injection Error (Product):', err);
        return next();
    }
});

// SEO: robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /login.html
Disallow: /api/
Sitemap: https://topin.uz/sitemap.xml`);
});

// SEO: Dynamic sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
    try {
        const { Shop, Product } = require('./models');
        const shops = await Shop.findAll({ where: { isActive: true }, attributes: ['slug', 'updatedAt'] });
        const products = await Product.findAll({
            where: { isAvailable: true, isPublished: true },
            include: [{ model: Shop, attributes: ['slug'] }],
            attributes: ['slug', 'updatedAt']
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        xml += `  <url><loc>https://topin.uz/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>\n`;
        xml += `  <url><loc>https://topin.uz/shops.html</loc><priority>0.8</priority><changefreq>daily</changefreq></url>\n`;

        shops.forEach(shop => {
            const lastmod = shop.updatedAt ? shop.updatedAt.toISOString().split('T')[0] : '';
            xml += `  <url><loc>https://topin.uz/stores/${shop.slug}</loc><priority>0.7</priority>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq></url>\n`;
        });

        products.forEach(p => {
            if (p.Shop && p.slug) {
                const lastmod = p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : '';
                xml += `  <url><loc>https://topin.uz/stores/${p.Shop.slug}/products/${p.slug}</loc><priority>0.6</priority>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq></url>\n`;
            }
        });

        xml += `</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap generation error:', err);
        res.status(500).send('Error generating sitemap');
    }
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.use(express.static(path.join(__dirname, '../frontend'), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Database Initialization
initDb();

// API Routes
app.get('/api/run-migration', async (req, res) => {
    try {
        const { SubCategory } = require('./models');
        
        // Final layout & fixes with precise ordering based on user's Excel sheet
        const orderList = [
            // Furniture
            'soft-furniture', 'cabinet-furniture', 'kitchen-furniture', 'bedroom-furniture', 'outdoor-furniture', 'tables',
            // Lighting
            'ceiling-lighting', 'wall-lighting', 'floor-lighting', 'street-lighting', 'tech-lighting',
            // Art & Decor
            'wall-decor', 'sculptures', 'textile', 'accessories',
            // Walls
            'paint', 'wallpaper', 'panels', 'wall-tiles',
            // Floor
            'wood-floor', 'laminate', 'floor-tiles', 'carpet',
            // Stone
            'natural-stone', 'artificial-stone', 'format',
            // Real Estate / Exterior
            'facade', 'roofing', 'landscape', 'pools', 'fences', 'facade-lights',
            // Plants
            'artificial-plants',
            // Bathroom
            'plumbing', 'shower', 'faucets', 'bathroom-furniture',
            // Other
            'furniture-fittings', 'smart-home', 'acoustics'
        ];

        // Ensure legacy fixes are still applied just in case they haven't run it yet
        const legacyFixes = {
            'soft-furniture': { nameRu: 'Мягкая мебель' },
            'cabinet-furniture': { nameRu: 'Корпусная мебель' },
            'outdoor-furniture': { nameRu: 'Уличная мебель' }, 
            'roofing': { nameRu: 'Кровля и водостоки' },
            'fences': { nameRu: 'Заборы и автоматические ворота' },
            'facade-lights': { nameRu: 'Архитектурная подсветка фасада' },
            'pools': { nameRu: 'Бассейны и водные зоны' },
            'furniture-fittings': { nameRu: 'Фурнитура' }
        };

        const allSubs = await SubCategory.findAll();
        let updated = 0;

        for (const sub of allSubs) {
            let fieldsToUpdate = {};
            
            // Reapply translation fix if needed
            if (legacyFixes[sub.slug] && !sub.name_ru) {
                fieldsToUpdate.name_ru = legacyFixes[sub.slug].nameRu;
            }

            // Map order index exactly as listed above. 
            // If it's not in the list, push it to the end (99)
            const targetOrder = orderList.indexOf(sub.slug) !== -1 ? orderList.indexOf(sub.slug) : 99;
            
            if (sub.order !== targetOrder || Object.keys(fieldsToUpdate).length > 0) {
                fieldsToUpdate.order = targetOrder;
                await sub.update(fieldsToUpdate);
                updated++;
            }
        }

        // Clean duplicates
        const duplicatesToRemove = ['bog-mebeli', 'krovkya-va-vodostoki', 'basseynlar', 'zaborlar-va-avtomatik-darvozalar'];
        for (const dupSlug of duplicatesToRemove) {
            const dup = allSubs.find(s => s.slug === dupSlug);
            if (dup) {
                try { await dup.destroy(); } catch(e) {}
            }
        }

        res.json({ success: true, message: `Perfect ordering applied! Updated layout order for ${updated} subcategories.` });
    } catch(err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.use('/api', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized Error Handling Middleware (for Multer and general server errors)
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'An unexpected error occurred'
    });
});

// Fallback to index.html for undefined routes (SPA behavior support)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
