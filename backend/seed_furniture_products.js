const { sequelize, Shop, Category, SubCategory, Product } = require('./models');
const slugify = require('./utils/slugify');

const mockProducts = [
    {
        name: 'Современный модульный диван',
        nameUz: 'Zamonaviy modulli divan',
        subcatSlug: 'soft-furniture',
        price: 15500000,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop'
        ],
        description: 'Элегантный модульный диван с обивкой из износостойкой велюровой ткани. Идеально подходит для просторных гостиных.',
        tags: 'диван, гостиная, мягкая мебель'
    },
    {
        name: 'Велюровое кресло для отдыха',
        nameUz: 'Velur dam olish kreslosi',
        subcatSlug: 'soft-furniture',
        price: 3200000,
        imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop'
        ],
        description: 'Уютное дизайнерское кресло с эргономичной спинкой и прочными ножками из натурального бука.',
        tags: 'кресло, велюр, дизайнерское'
    },
    {
        name: 'Обеденный стол из массива дуба',
        nameUz: 'Eman massividan ovqat stoli',
        subcatSlug: 'tables',
        price: 8900000,
        imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop'
        ],
        description: 'Прочный обеденный стол ручной работы из цельного массива дуба, покрытый защитным воском.',
        tags: 'стол, обеденный стол, дуб, дерево'
    },
    {
        name: 'Журнальный столик в стиле лофт',
        nameUz: 'Loft uslubidagi jurnal stoli',
        subcatSlug: 'tables',
        price: 1800000,
        imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop'
        ],
        description: 'Минималистичный журнальный столик со столешницей из шпонированного ореха и металлическим каркасом.',
        tags: 'столик, журнальный, лофт, металл'
    },
    {
        name: 'Двуспальная кровать с мягким изголовьем',
        nameUz: 'Yumshoq boshli ikki kishilik karavot',
        subcatSlug: 'bedroom-furniture',
        price: 12500000,
        imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop'
        ],
        description: 'Роскошная двуспальная кровать с высоким изголовьем из премиального льна и ортопедическим основанием.',
        tags: 'кровать, спальня, двуспальная'
    },
    {
        name: 'Шкаф-купе с зеркальными дверями',
        nameUz: 'Ko\'zguli eshikli shkaf-kupe',
        subcatSlug: 'cabinet-furniture',
        price: 9800000,
        imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop'
        ],
        description: 'Вместительный шкаф-купе с продуманной внутренней системой хранения и доводчиками плавного закрывания.',
        tags: 'шкаф, шкаф-купе, хранение'
    },
    {
        name: 'Плетеный комплект садовой мебели',
        nameUz: 'Bog\' uchun to\'qilgan mebel to\'plami',
        subcatSlug: 'outdoor-furniture',
        price: 14200000,
        imageUrl: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&auto=format&fit=crop'
        ],
        description: 'Комплект уличной мебели из искусственного ротанга: диван, два кресла и кофейный столик с каленым стеклом.',
        tags: 'садовая мебель, ротанг, терраса, уличная'
    }
];

async function seedFurnitureProducts() {
    try {
        console.log('Starting Furniture category seeding...');

        // Find Category 'Furniture'
        const category = await Category.findOne({ where: { slug: 'furniture' } });
        if (!category) {
            console.error('Furniture category not found in database.');
            process.exit(1);
        }

        // Find all shops in Furniture Category
        const shops = await Shop.findAll({ where: { CategoryId: category.id } });
        console.log(`Found ${shops.length} shops in the Furniture category.`);

        if (shops.length === 0) {
            console.warn('No shops found in the Furniture category to seed products.');
            process.exit(0);
        }

        // Fetch subcategories for mapping
        const subcategories = await SubCategory.findAll({ where: { CategoryId: category.id } });

        // Let's seed products for only the first shop (Kuka Home Mebel)
        const targetShops = shops.slice(0, 1);
        let productsCreated = 0;

        for (const shop of targetShops) {
            console.log(`Seeding products for shop: "${shop.name}"...`);
            
            // Delete existing products for this shop to avoid duplicate seeds
            await Product.destroy({ where: { ShopId: shop.id } });

            for (const mockItem of mockProducts) {
                // Find matching subcategory
                const subcat = subcategories.find(s => s.slug === mockItem.subcatSlug);
                
                await Product.create({
                    name: mockItem.name,
                    slug: slugify(mockItem.name),
                    shortDescription: mockItem.nameUz,
                    description: mockItem.description,
                    price: mockItem.price,
                    imageUrl: mockItem.imageUrl,
                    images: JSON.stringify(mockItem.images),
                    stockStatus: 'In Stock',
                    isPublished: true,
                    isAvailable: true,
                    tags: mockItem.tags,
                    ShopId: shop.id,
                    CategoryId: category.id,
                    SubCategoryId: subcat ? subcat.id : null
                });
                productsCreated++;
            }
        }

        console.log(`Successfully seeded ${productsCreated} products across ${targetShops.length} furniture shops!`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed furniture products:', error);
        process.exit(1);
    }
}

seedFurnitureProducts();
