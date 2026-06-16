const cheerio = require('cheerio');
const config = require('./config');

// Stunning Unsplash image collection for premium furniture, lighting, and decor
const HIGH_QUALITY_IMAGES = {
    "Furniture": [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop"
    ],
    "Lighting": [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&auto=format&fit=crop"
    ],
    "Walls": [
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop"
    ],
    "Art & Decor": [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&auto=format&fit=crop"
    ]
};

const MOCK_PRODUCTS = {
    "Furniture": [
        { name: "Scandi Accent Chair", price: 1250000, desc: "Minimalist Nordic armchair with solid ash wood legs and premium linen fabric upholstery. Available in beige and graphite." },
        { name: "Lux Velvet Chesterfield Sofa", price: 6800000, desc: "Classic deep button-tufted Chesterfield sofa in emerald green velvet. Seats 3-4 comfortably. Solid beech frame." },
        { name: "Minimalist Oak Coffee Table", price: 950000, desc: "Solid European white oak coffee table with round edges and a lower shelf for magazines and remotes." },
        { name: "Floating Floating Tv Console", price: 2100000, desc: "Sleek wall-mounted media console with walnut veneer and black push-to-open cabinet doors." },
        { name: "Bouclé Cosy Armchair", price: 1750000, desc: "Fluffy bouclé fabric lounge chair, ergonomic shape with high density foam core. Perfect for reading corners." }
    ],
    "Lighting": [
        { name: "Golden Sputnik Chandelier", price: 3400000, desc: "Modern mid-century brass chandelier with 12 light sockets. Fully dimmable and height adjustable." },
        { name: "Concrete Minimalist Pendant", price: 450000, desc: "Industrial style cylindrical concrete pendant light with adjustable woven black cord." },
        { name: "Arch Brass Floor Lamp", price: 1100000, desc: "Elegant arched standing lamp with a heavy black marble base and brushed brass shade." },
        { name: "Smart RGB Ambient Lightbar", price: 780000, desc: "Dual set of smart desk lightbars, syncs with music and TV audio, controlled via app or voice assistant." }
    ],
    "Walls": [
        { name: "Geometric Gold Line Wallpaper", price: 320000, desc: "Non-woven wash resistant roll wallpaper with dark green and gold foil geometric details. 10m x 0.53m." },
        { name: "3D Acoustic Felt Wall Panels", price: 180000, desc: "Sound absorbing felt wall panels in hexagonal shapes. Set of 6 pieces with self-adhesive backing." }
    ],
    "Art & Decor": [
        { name: "Abstract Terrazzo Ceramic Vase", price: 250000, desc: "Hand-poured ceramic vase with terrazzo stone chip patterns, matte finish. Perfect for dry pampas grass." },
        { name: "Framed Canvas Oil Painting - Horizon", price: 890000, desc: "Textured canvas oil painting depicting a warm horizon, framed in a thin gold metal frame. 60x80cm." }
    ]
};

/**
 * Scraper Agent
 * Scrapes a shop and its products from Telegram, Instagram, or OLX.
 */
async function scrapeStore(sourceType, target, shopMetadata = {}) {
    console.log(`[Scraper Agent] Initiating scrape: Type: ${sourceType}, Target: ${target} (Mock Mode: ${config.mockMode})`);
    
    // Default shop schema
    const result = {
        shop: {
            name: shopMetadata.name || target,
            description: shopMetadata.description || `Scraped store from ${sourceType}`,
            location: shopMetadata.location || "Ташкент, Узбекистан",
            phone: shopMetadata.phone || "+998 90 000 00 00",
            instagram: shopMetadata.instagram || "",
            telegram: shopMetadata.telegram || "",
            website: shopMetadata.website || "",
            categoryName: shopMetadata.categoryName || "Furniture"
        },
        products: []
    };

    if (config.mockMode) {
        // Mock scraping flow
        await new Promise(resolve => setTimeout(resolve, 2000));
        result.products = generateMockProducts(result.shop.categoryName);
        return result;
    }

    try {
        if (sourceType === 'telegram') {
            return await scrapeTelegramChannel(target, result);
        } else if (sourceType === 'olx') {
            return await scrapeOLXPage(target, result);
        } else if (sourceType === 'instagram') {
            // Instagram scraping is heavily protected, fall back to mock but log it
            console.log(`[Scraper Agent] Instagram scraping target is protected. Simulating scrape for: ${target}`);
            result.products = generateMockProducts(result.shop.categoryName);
            return result;
        }
    } catch (err) {
        console.error(`[Scraper Agent Error] Scraping failed for ${target}, using fallback mock data.`, err);
        result.products = generateMockProducts(result.shop.categoryName);
        return result;
    }

    return result;
}

/**
 * Live Telegram Channel Preview Scraper
 * Fetches HTML from t.me/s/{channel_username} and parses public posts
 */
async function scrapeTelegramChannel(username, result) {
    // Remove @ or full link if present
    const cleanUsername = username.replace(/https:\/\/t\.me\//, '').replace('@', '').trim();
    const url = `https://t.me/s/${cleanUsername}`;
    
    console.log(`[Scraper Agent] Scraping Telegram public view: ${url}`);
    
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to load Telegram preview page. HTTP Status ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Parse Shop Profile details if available
    const channelName = $('.tgme_channel_info_header_title').text().trim();
    const channelDesc = $('.tgme_channel_info_description').text().trim();
    
    if (channelName) result.shop.name = channelName;
    if (channelDesc) result.shop.description = channelDesc.substring(0, 250);
    result.shop.telegram = `https://t.me/${cleanUsername}`;

    // Parse Messages (Products)
    $('.tgme_widget_message_wrap').each((i, el) => {
        const messageTextEl = $(el).find('.tgme_widget_message_text');
        if (messageTextEl.length === 0) return; // Skip posts without text
        
        const text = messageTextEl.text().trim();
        if (!text || text.length < 10) return;

        // Try to get image url from inline background style
        let imageUrl = '';
        const photoEl = $(el).find('.tgme_widget_message_photo_wrap');
        if (photoEl.length > 0) {
            const style = photoEl.attr('style');
            if (style) {
                const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match) imageUrl = match[1];
            }
        }

        // Skip posts without images since this is a catalog site
        if (!imageUrl) return;

        // Parse product details from text
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const name = lines[0] ? lines[0].substring(0, 100) : "Mebel Product";
        const description = lines.slice(1).join('\n').substring(0, 500) || name;
        
        // Extract Price
        const price = parsePrice(text);

        result.products.push({
            name: name,
            description: description,
            price: price || 0,
            imageUrl: imageUrl,
            images: [imageUrl],
            tags: "telegram, imported",
            stockStatus: "In Stock",
            isPublished: true
        });
    });

    // If no products were found, fall back to mock data
    if (result.products.length === 0) {
        console.warn(`[Scraper Agent] No products found in Telegram channel ${cleanUsername}, loading mock products.`);
        result.products = generateMockProducts(result.shop.categoryName);
    } else {
        // Limit to 10 products for safety
        result.products = result.products.slice(0, 10);
    }

    return result;
}

/**
 * Live OLX Scraper
 * Scrapes listing page from olx.uz
 */
async function scrapeOLXPage(targetUrl, result) {
    if (!targetUrl.includes('olx.uz')) {
        targetUrl = `https://www.olx.uz/d/home-garden/mebel/q-${encodeURIComponent(targetUrl)}`;
    }

    console.log(`[Scraper Agent] Scraping OLX listing: ${targetUrl}`);

    const response = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });

    if (!response.ok) {
        throw new Error(`Failed to load OLX page. HTTP Status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('[data-testid="l-card"]').each((i, el) => {
        if (i >= 8) return; // Limit to 8 products

        const name = $(el).find('h6').text().trim();
        const priceText = $(el).find('[data-testid="ad-price"]').text().trim();
        const price = parsePrice(priceText);
        
        let imageUrl = '';
        const imgEl = $(el).find('img');
        if (imgEl.length > 0) {
            imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
        }

        if (name && imageUrl) {
            result.products.push({
                name: name,
                description: `${name}. Отличный выбор для вашего интерьера. Качественные материалы и современный дизайн.`,
                price: price || 0,
                imageUrl: imageUrl,
                images: [imageUrl],
                tags: "olx, imported",
                stockStatus: "In Stock",
                isPublished: true
            });
        }
    });

    if (result.products.length === 0) {
        console.warn(`[Scraper Agent] No products found on OLX, loading mock products.`);
        result.products = generateMockProducts(result.shop.categoryName);
    }

    return result;
}

function parsePrice(text = '') {
    const cleanText = text.replace(/\s/g, ''); // strip whitespace
    
    // Look for digits followed by currency symbols or words
    const match = cleanText.match(/(\d+)(сум|so'm|som|usd|\$|ye)/i);
    if (match) {
        return parseInt(match[1]);
    }
    
    // Secondary search: find first numeric sequence that is at least 4 digits (e.g. 500000 sum)
    const generalMatch = cleanText.match(/\d{4,10}/);
    if (generalMatch) {
        return parseInt(generalMatch[0]);
    }

    return null;
}

function generateMockProducts(category = 'Furniture') {
    const list = MOCK_PRODUCTS[category] || MOCK_PRODUCTS["Furniture"];
    const images = HIGH_QUALITY_IMAGES[category] || HIGH_QUALITY_IMAGES["Furniture"];
    
    return list.map((item, index) => {
        const imageUrl = images[index % images.length];
        return {
            name: item.name,
            description: item.desc,
            price: item.price,
            imageUrl: imageUrl,
            images: [imageUrl],
            tags: `${category.toLowerCase()}, modern`,
            stockStatus: "In Stock",
            isPublished: true
        };
    });
}

module.exports = {
    scrapeStore,
    parsePrice
};
