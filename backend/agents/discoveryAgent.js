const cheerio = require('cheerio');
const config = require('./config');

// A high-quality list of Tashkent home/interior stores for mock fallback
const CURATED_MOCK_STORES = [
    {
        name: "AIKO Rattan Furniture",
        description: "Premium outdoor rattan furniture and garden decor in Tashkent.",
        location: "Ташкент, Мирзо-Улугбекский район, ул. Паркент, 131",
        phone: "+998 71 200 44 44",
        instagram: "aiko.uz",
        telegram: "aiko_rattan",
        website: "https://aiko.uz",
        categoryName: "Furniture",
        sourceType: "telegram",
        scrapeTarget: "aiko_rattan" // Mock telegram channel/handle
    },
    {
        name: "Decoria Tashkent",
        description: "Designer wallpapers, custom panels, and interior wall decorations.",
        location: "Ташкент, ул. Чехова, 40",
        phone: "+998 90 990 11 22",
        instagram: "decoria.uz",
        telegram: "decoria_wallpapers",
        website: "https://decoria.uz",
        categoryName: "Walls",
        sourceType: "instagram",
        scrapeTarget: "decoria.uz"
    },
    {
        name: "Glow Lighting",
        description: "Luxury chandeliers, modern pendant lights, and architectural lighting solutions.",
        location: "Ташкент, массив Чиланзар, ул. Мукими, 99",
        phone: "+998 97 100 20 30",
        instagram: "glow_lighting_tashkent",
        telegram: "glow_lighting_uz",
        website: "https://glow.uz",
        categoryName: "Lighting",
        sourceType: "telegram",
        scrapeTarget: "glow_lighting_uz"
    },
    {
        name: "Mebel House Tashkent",
        description: "Modern modular sofas, bedroom sets, and custom wardrobes.",
        location: "Ташкент, Чиланзарский район, ул. Гулхани, 4A",
        phone: "+998 99 888 77 66",
        instagram: "mebelhouse.uz",
        telegram: "mebelhouse_uz",
        website: "https://mebelhouse.uz",
        categoryName: "Furniture",
        sourceType: "olx",
        scrapeTarget: "https://www.olx.uz/d/home-garden/mebel/q-mebel-house/"
    },
    {
        name: "Verona Design",
        description: "Italian classic and contemporary kitchen sets and dining tables.",
        location: "Ташкент, ул. Шота Руставели, 55",
        phone: "+998 71 255 12 34",
        instagram: "veronadesign.uz",
        telegram: "veronadesign_kitchens",
        website: "https://verona.uz",
        categoryName: "Furniture",
        sourceType: "instagram",
        scrapeTarget: "veronadesign.uz"
    },
    {
        name: "Bella Home Decor",
        description: "Exclusive carpets, curtains, and high-end home decoration assets.",
        location: "Ташкент, Юнусабадский район, ул. Амира Темура, 107B",
        phone: "+998 95 300 40 50",
        instagram: "belladecor.uz",
        telegram: "belladecor_uz",
        website: "https://belladecor.uz",
        categoryName: "Art & Decor",
        sourceType: "telegram",
        scrapeTarget: "belladecor_channel"
    }
];

/**
 * Discovery Agent
 * Searches for site-specific stores (furniture, lighting, wall decor) in Tashkent.
 */
async function discoverShops(query = '') {
    console.log(`[Discovery Agent] Initiating search for query: "${query}" (Mock Mode: ${config.mockMode})`);
    
    const results = [];
    const lowerQuery = query.toLowerCase();

    // Helper to get filtered curated shops matching query
    const getFilteredShops = () => {
        return CURATED_MOCK_STORES.filter(store => 
            store.name.toLowerCase().includes(lowerQuery) ||
            store.description.toLowerCase().includes(lowerQuery) ||
            store.categoryName.toLowerCase().includes(lowerQuery) ||
            store.instagram.toLowerCase().includes(lowerQuery) ||
            store.telegram.toLowerCase().includes(lowerQuery)
        );
    };

    // Helper to generate a realistic fallback shop matching query
    const generateFallbackShop = () => {
        const formattedQuery = query.charAt(0).toUpperCase() + query.slice(1);
        const categoryName = getCategoryFromQuery(query);
        const guessedTelegram = lowerQuery.replace(/[^a-z0-9]/g, '');
        return {
            name: `${formattedQuery} Tashkent`,
            description: `Specialized boutique for high-quality ${query} products in Uzbekistan.`,
            location: "Ташкент, ул. Бабура, 25",
            phone: "+998 90 123 45 67",
            instagram: `${guessedTelegram}_tashkent`,
            telegram: `${guessedTelegram}_uz`,
            website: `https://${guessedTelegram}-tashkent.uz`,
            categoryName: categoryName,
            sourceType: "telegram",
            scrapeTarget: `${guessedTelegram}_uz`
        };
    };

    // 1. If Mock Mode is active, filter from our curated database or generate a matched list
    if (config.mockMode || !query) {
        const filteredCurated = getFilteredShops();
        if (filteredCurated.length > 0) {
            results.push(...filteredCurated);
        } else {
            results.push(generateFallbackShop());
        }
        
        // Add artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));
        return results;
    }

    // 2. Real Web Search Crawling mode (DuckDuckGo search parsing)
    try {
        const searchUrl = `https://html.duckduckgo.com/html/?q=site:instagram.com+tashkent+${encodeURIComponent(query)}`;
        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const ddgResults = [];
        $('.result__body').each((i, el) => {
            if (i >= 5) return; // Limit to 5 results for speed
            const title = $(el).find('.result__title a').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            const url = $(el).find('.result__title a').attr('href');
            
            ddgResults.push({ title, snippet, url });
        });

        for (const item of ddgResults) {
            // Extract instagram username
            let instagramHandle = '';
            const instMatch = item.url.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/);
            if (instMatch) {
                instagramHandle = instMatch[1];
            }

            // Parse shop name from Title
            let shopName = item.title.replace(/(@[a-zA-Z0-9_\.]+)|(Instagram photos and videos)|(•.*)/g, '').trim();
            if (!shopName || shopName.length < 3) shopName = instagramHandle || 'Tashkent Shop';
            
            // Clean title
            shopName = shopName.replace(/^[\|\-\s]+|[\|\-\s]+$/g, '');

            // Guess category
            const categoryName = getCategoryFromQuery(shopName + ' ' + item.snippet);
            const guessedTelegram = instagramHandle || shopName.toLowerCase().replace(/[^a-z0-9]/g, '');

            results.push({
                name: shopName,
                description: item.snippet.substring(0, 250),
                location: extractLocation(item.snippet) || "Ташкент, Узбекистан",
                phone: extractPhone(item.snippet) || "+998 90 000 00 00",
                instagram: instagramHandle || guessedTelegram,
                telegram: `${guessedTelegram}_uz`,
                website: '',
                categoryName: categoryName,
                sourceType: 'telegram', // Set to telegram for actual channel scraping support
                scrapeTarget: `${guessedTelegram}_uz`
            });
        }
    } catch (error) {
        console.error("[Discovery Agent Error] Web search crawl failed, falling back to curated list.", error);
        // Fallback to filtered Curated list or generate fallback shop if network crawl fails
        const filteredCurated = getFilteredShops();
        if (filteredCurated.length > 0) {
            return filteredCurated;
        } else {
            return [generateFallbackShop()];
        }
    }

    if (results.length === 0) {
        const filteredCurated = getFilteredShops();
        if (filteredCurated.length > 0) {
            return filteredCurated;
        } else {
            return [generateFallbackShop()];
        }
    }

    return results;
}

function getCategoryFromQuery(text = '') {
    const txt = text.toLowerCase();
    if (txt.includes('svet') || txt.includes('light') || txt.includes('lyustra') || txt.includes('lamp') || txt.includes('свет') || txt.includes('люстр') || txt.includes('ламп') || txt.includes('светильник')) return 'Lighting';
    if (txt.includes('oboi') || txt.includes('wall') || txt.includes('panel') || txt.includes('sten') || txt.includes('обои') || txt.includes('панел') || txt.includes('стен')) return 'Walls';
    if (txt.includes('stone') || txt.includes('kamen') || txt.includes('mramor') || txt.includes('камен') || txt.includes('мрамор') || txt.includes('гранит')) return 'Stone';
    if (txt.includes('floor') || txt.includes('parket') || txt.includes('laminat') || txt.includes('пол') || txt.includes('паркет') || txt.includes('ламинат')) return 'Floor';
    if (txt.includes('art') || txt.includes('decor') || txt.includes('kartin') || txt.includes('kartina') || txt.includes('декор') || txt.includes('картин') || txt.includes('ваза')) return 'Art & Decor';
    if (txt.includes('plant') || txt.includes('flower') || txt.includes('rasten') || txt.includes('цвет') || txt.includes('растен')) return 'Plants';
    return 'Furniture'; // Default
}

function extractPhone(text = '') {
    const phoneRegex = /(\+?998)?\s?\(?\d{2}\)?\s?\d{3}\s?\d{2}\s?\d{2}/g;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
}

function extractLocation(text = '') {
    const locationKeywords = ['улица', 'ул.', 'проспект', 'квартал', 'массив', 'район', 'орбита', 'сергели', 'чиланзар', 'юнусабад', 'миробод', 'яккасарой'];
    const sentences = text.split(/[.!?]/);
    for (const sentence of sentences) {
        if (locationKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
            return sentence.trim();
        }
    }
    return null;
}

module.exports = {
    discoverShops
};
