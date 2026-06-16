const { sequelize, Shop, ShopImage, Category, SubCategory } = require('./models');

async function run() {
    try {
        console.log('Starting data migration from topin.uz...');

        // 1. Fetch Categories, Subcategories, and Shops from production
        console.log('Fetching categories...');
        const catRes = await fetch('https://topin.uz/api/categories');
        const catJson = await catRes.json();
        const productionCategories = catJson.data || [];
        console.log(`Fetched ${productionCategories.length} categories.`);

        console.log('Fetching subcategories...');
        const subRes = await fetch('https://topin.uz/api/subcategories');
        const subJson = await subRes.json();
        const productionSubcategories = subJson.data || [];
        console.log(`Fetched ${productionSubcategories.length} subcategories.`);

        console.log('Fetching shops (with embedded gallery images and subcategories)...');
        const shopsRes = await fetch('https://topin.uz/api/shops');
        const shopsJson = await shopsRes.json();
        const productionShops = shopsJson.data || [];
        console.log(`Fetched ${productionShops.length} shops.`);

        // 2. Disable foreign key checks for clean truncation
        if (sequelize.getDialect() === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = false;');
        }

        // 3. Clear database tables
        console.log('Truncating tables...');
        await ShopImage.destroy({ where: {} });
        await Shop.destroy({ where: {} });
        await SubCategory.destroy({ where: {} });
        await Category.destroy({ where: {} });
        try {
            await sequelize.query('DELETE FROM ShopSubCategories;');
        } catch (e) {}

        // 4. Import Categories
        console.log('Importing categories...');
        const categoryDocs = [];
        for (const cat of productionCategories) {
            const doc = await Category.create({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon
            });
            categoryDocs.push(doc);
        }

        // 5. Import Subcategories
        console.log('Importing subcategories...');
        const subcatDocs = [];
        for (const sub of productionSubcategories) {
            const doc = await SubCategory.create({
                id: sub.id,
                name: sub.name,
                name_ru: sub.name_ru,
                name_en: sub.name_en,
                slug: sub.slug,
                order: sub.order,
                CategoryId: sub.CategoryId
            });
            subcatDocs.push(doc);
        }

        // 6. Import Shops, ShopImages, and ShopSubCategories mappings
        console.log('Importing shops, gallery images, and subcategory mappings...');
        for (const prodShop of productionShops) {
            const createdShop = await Shop.create({
                id: prodShop.id,
                name: prodShop.name,
                description: prodShop.description,
                descriptionFull: prodShop.description_ru || prodShop.description,
                location: prodShop.location,
                website: prodShop.website,
                instagram: prodShop.instagram,
                telegram: prodShop.telegram,
                phone: prodShop.phone,
                logoUrl: prodShop.logoUrl,
                bannerUrl: prodShop.bannerUrl,
                workingHours: typeof prodShop.workingHours === 'string' ? prodShop.workingHours : JSON.stringify(prodShop.workingHours),
                currency: prodShop.currency || 'UZS',
                slug: prodShop.slug,
                CategoryId: prodShop.CategoryId,
                isActive: prodShop.isActive
            });

            // Import ShopImages
            if (prodShop.ShopImages && prodShop.ShopImages.length > 0) {
                for (const img of prodShop.ShopImages) {
                    await ShopImage.create({
                        id: img.id,
                        url: img.url,
                        order: img.order,
                        ShopId: createdShop.id
                    });
                }
            }

            // Import ShopSubCategories
            if (prodShop.SubCategories && prodShop.SubCategories.length > 0) {
                for (const sub of prodShop.SubCategories) {
                    try {
                        await sequelize.query(
                            'INSERT INTO ShopSubCategories (ShopId, SubCategoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
                            {
                                replacements: [createdShop.id, sub.id, new Date(), new Date()]
                            }
                        );
                    } catch (e) {
                        console.error(`Error inserting ShopSubCategory mapping for Shop ${createdShop.id} and SubCategory ${sub.id}:`, e.message);
                    }
                }
            }
        }

        // Re-enable foreign key checks
        if (sequelize.getDialect() === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = true;');
        }

        console.log('Scrape and import migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
