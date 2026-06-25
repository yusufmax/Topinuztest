const fs = require('fs');
const path = require('path');
const { Shop, Category, SubCategory, Product, sequelize } = require('./models');
const slugify = require('./utils/slugify');

async function seedKano() {
    try {
        console.log('Loading scraped products...');
        const jsonPath = path.join(__dirname, 'kano_products.json');
        
        let data = fs.readFileSync(jsonPath, 'utf8');
        const products = JSON.parse(data);
        console.log(`Loaded ${products.length} products from JSON.`);

        // Find Kano shop
        // In local DB it might be ERGO, in remote VPS DB it is KANO, but in both it is ID 17 and slug ergo
        const shop = await Shop.findOne({
            where: {
                [sequelize.Sequelize.Op.or]: [
                    { id: 17 },
                    { slug: 'ergo' }
                ]
            }
        });

        if (!shop) {
            console.error('Kano shop (ID 17 or slug ergo) not found in database!');
            return;
        }
        console.log(`Found Shop: ID ${shop.id}, Name: ${shop.name}, Slug: ${shop.slug}`);

        // Category ID 1 (Furniture)
        const categoryId = 1;

        // Subcategory mappings
        // 42: Kreslolar, 27: Stollar, 43: Divonlar, 17: cabinet-furniture, 41: mebellar
        let addedCount = 0;
        let updatedCount = 0;

        for (const p of products) {
            const name = p.name;
            const slug = slugify(name);
            const price = p.price || null;
            const imageUrl = p.imageUrl || null;
            const stockStatus = p.stockStatus || 'In Stock';

            // Determine subcategory based on name keywords
            let subcategoryId = 41; // Default: mebellar
            const lowerName = name.toLowerCase();
            if (lowerName.includes('кресло') || lowerName.includes('стул') || lowerName.includes('kreslo') || lowerName.includes('stul')) {
                subcategoryId = 42; // Kreslolar
            } else if (lowerName.includes('стол') || lowerName.includes('stol')) {
                subcategoryId = 27; // Stollar
            } else if (lowerName.includes('диван') || lowerName.includes('divan')) {
                subcategoryId = 43; // Divonlar
            } else if (lowerName.includes('шкаф') || lowerName.includes('тумба') || lowerName.includes('стеллаж') || lowerName.includes('shkaf') || lowerName.includes('tumba')) {
                subcategoryId = 17; // cabinet-furniture
            }

            // Check if product already exists for this shop
            const existing = await Product.findOne({
                where: {
                    slug: slug,
                    ShopId: shop.id
                }
            });

            const productData = {
                name,
                slug,
                price,
                imageUrl,
                stockStatus,
                CategoryId: categoryId,
                SubCategoryId: subcategoryId,
                ShopId: shop.id,
                shortDescription: 'Дизайнерская офисная мебель KANO премиум качества.',
                description: `Премиальный продукт от официального представителя KANO в Узбекистане. Выполнен из высококачественных материалов, сочетает в себе эргономичность, современный стиль и комфорт.`,
                isPublished: true,
                isAvailable: true,
                rating: 5.0,
                reviewsCount: 0
            };

            if (existing) {
                await existing.update(productData);
                updatedCount++;
            } else {
                await Product.create(productData);
                addedCount++;
            }
        }

        console.log(`Seeding complete: Created ${addedCount} products, Updated ${updatedCount} products.`);

        // Add subcategories to the shop so they show up as filters
        console.log('Associating subcategories with the shop...');
        const subcatIds = [42, 27, 43, 17, 41];
        
        // We'll manually insert into ShopSubCategories to support both Sequelize v5/v6 syntax safely
        for (const subcatId of subcatIds) {
            try {
                // Check if association exists
                const [result] = await sequelize.query(
                    `SELECT * FROM ShopSubCategories WHERE ShopId = ${shop.id} AND SubCategoryId = ${subcatId}`
                );
                if (result.length === 0) {
                    await sequelize.query(
                        `INSERT INTO ShopSubCategories (ShopId, SubCategoryId, createdAt, updatedAt) VALUES (${shop.id}, ${subcatId}, datetime('now'), datetime('now'))`
                    );
                }
            } catch (e) {
                console.log(`Association for SubCat ${subcatId} already exists or failed: ${e.message}`);
            }
        }
        console.log('Subcategories associated successfully.');

    } catch (err) {
        console.error('Error seeding Kano products:', err);
    }
}

// Run if called directly
if (require.main === module) {
    seedKano().then(() => {
        console.log('Done!');
        process.exit(0);
    });
}

module.exports = seedKano;
