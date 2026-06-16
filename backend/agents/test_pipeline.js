const discoveryAgent = require('./discoveryAgent');
const scraperAgent = require('./scraperAgent');
const uploaderAgent = require('./uploaderAgent');

async function runTest() {
    console.log('🧪 Starting automated agent pipeline validation test...\n');
    
    // 1. Test Discovery Agent
    console.log('1️⃣ Testing Discovery Agent: searching for "lighting"...');
    const shops = await discoveryAgent.discoverShops('lighting');
    if (!shops || shops.length === 0) {
        console.error('❌ Discovery failed: no shops found.');
        process.exit(1);
    }
    console.log(`✅ Discovery success: found ${shops.length} shops. Selected: "${shops[0].name}"`);
    
    // 2. Test Scraper Agent
    console.log('\n2️⃣ Testing Scraper Agent on selected shop...');
    const selectedShop = shops[0];
    const scrapedData = await scraperAgent.scrapeStore(
        selectedShop.sourceType, 
        selectedShop.scrapeTarget, 
        selectedShop
    );
    
    if (!scrapedData.products || scrapedData.products.length === 0) {
        console.error('❌ Scraper failed: no products parsed.');
        process.exit(1);
    }
    console.log(`✅ Scraper success: scraped store details and ${scrapedData.products.length} products.`);
    console.log(`   Sample product: "${scrapedData.products[0].name}" - Price: ${scrapedData.products[0].price} UZS`);
    
    // 3. Test Uploader Agent
    console.log('\n3️⃣ Testing Uploader Agent: uploading to local topin.uz instance...');
    try {
        const uploadResult = await uploaderAgent.uploadStoreAndProducts(scrapedData);
        console.log('\n==================================================');
        console.log('✅ PIPELINE TEST SUCCESSFULLY COMPLETED!');
        console.log(`• Store Created: ${uploadResult.shop.name} (Slug: ${uploadResult.shop.slug})`);
        console.log(`• Products Uploaded: ${uploadResult.productsUploaded}/${uploadResult.totalProducts}`);
        console.log(`• Vendor Username: ${uploadResult.credentials.username}`);
        console.log(`• Vendor Password: ${uploadResult.credentials.password}`);
        console.log('==================================================\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Uploader failed:', error);
        process.exit(1);
    }
}

runTest();
