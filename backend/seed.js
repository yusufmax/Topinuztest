const { sequelize, Shop, Category, Product } = require('./database');

async function seed() {
    await sequelize.sync({ force: true }); // Reset database

    // Seed Categories
    const categories = [
        { name: 'Furniture', slug: 'furniture', icon: '🛋️' },
        { name: 'Lighting', slug: 'lighting', icon: '💡' },
        { name: 'Art & Decor', slug: 'art-decor', icon: '🎨' },
        { name: 'Walls', slug: 'walls', icon: '🧱' },
        { name: 'Floor', slug: 'floor', icon: '🪵' },
        { name: 'Stone', slug: 'stone', icon: '🪨' },
        { name: 'Real Estate', slug: 'real-estate', icon: '🏘️' },
        { name: 'Plants', slug: 'plants', icon: '🪴' },
        { name: 'Bathroom', slug: 'bathroom', icon: '🛁' },
        { name: 'Other', slug: 'other', icon: '📦' }
    ];

    const categoryDocs = await Category.bulkCreate(categories);

    // Seed Shops (Data extracted from HTML)
    const furnitureCategory = await Category.findOne({ where: { slug: 'furniture' } });
    const lightingCategory = await Category.findOne({ where: { slug: 'lighting' } });
    const officeCategory = await Category.findOne({ where: { slug: 'office' } }); // Assuming office exists or mapped to furniture

    const shopsData = [
        {
            name: 'Kuka Home Mebel',
            description: 'A walk to commonly established brands...', 
            location: 'Ташкент, Узбекистан',
            website: 'https://taplink.cc/kukahome_uz', 
            instagram: 'https://instagram.com/kukahome_uzbekistan',
            telegram: 'https://t.me/KUKAHOME',
            phone: '+998 99 379 99 99',
            logoUrl: '/img/kukaLogo.png',
            descriptionFull: 'Courier feribot 104-1 m.surogat barobari, 70. Samar Mulla adresi. Va, kengshahar Street 02, Toshkent',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Shatura.uz',
            location: 'Ташкент (Махтумкули, 75)',
            website: 'https://shatura.taplink.ws',
            instagram: 'https://instagram.com/shatura.uz',
            telegram: 'https://t.me/shatuura_uz',
            phone: '+998 90 002 33 35',
            logoUrl: '/img/shaturaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Woodline',
            location: 'Ташкент, Шайхантахурский район',
            instagram: 'https://instagram.com/woodline_pro',
            telegram: 'https://t.me/woodline_pro',
            phone: '+998 78 113 70 80',
            logoUrl: '/img/shaturaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Saroyconcept',
            location: 'Ташкент, Шайхантахурский район, махалля Тахтапуль, ул. Тахтапуль, 64',
            website: 'https://saroyconcept.taplink.ws',
            instagram: 'https://instagram.com/saroyconcept',
            telegram: 'https://t.me/saroyconcept',
            phone: '+998 98 302 50 55',
            logoUrl: '/img/kukaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Muborak Modern',
            location: 'Ташкент',
            instagram: 'https://instagram.com/muborak.modern',
            telegram: 'https://t.me/muborakmodern',
            phone: '+998 97 306 06 06',
            logoUrl: '/img/shaturaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Weltew Home',
            location: 'Ташкент, обводная улица Нурафшан 34А',
            website: 'https://weltewhomeuz.taplink.ws',
            instagram: 'https://instagram.com/weltewhomeuz',
            telegram: 'https://t.me/weltew_admin',
            phone: '+998 95 197 00 02',
            logoUrl: '/img/kukaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Modis Interiors',
            location: 'Махтумкули 75, Ташкент, Узбекистан 100005',
            instagram: 'https://instagram.com/modis_interiors.uz',
            telegram: 'https://t.me/modis01',
            phone: '+998 98 778 77 78',
            logoUrl: '/img/shaturaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Zivella Office Furniture',
            location: 'Ташкент',
            telegram: 'https://t.me/Zivella_Office_Furniture',
            logoUrl: '/img/kukaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Casa Uzbekistan',
            location: 'Ташкент, улица Шота Руставели, 75',
            instagram: 'https://instagram.com/casauzbekistan',
            telegram: 'https://t.me/casamia_uz',
            phone: '+998 93 131 77 77',
            logoUrl: '/img/shaturaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Baltic Home',
            location: 'Шоурум - Akay City, блок 6, 2-ой этаж, Кары Ниязи 11А, Ташкент',
            website: 'https://baltichome.store',
            instagram: 'https://instagram.com/baltichomeuz',
            telegram: 'https://t.me/baltichomeuz',
            phone: '+998 99 927 44 44',
            logoUrl: '/img/kukaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Imaj Uzbekistan',
            location: 'Imaj, Ташкент, Узбекистан',
            instagram: 'https://instagram.com/imajuzbekistan',
            telegram: 'https://t.me/imaj_uz',
            phone: '998991999996',
            logoUrl: '/img/shaturaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        },
        {
            name: 'Bonaldo Uzbekistan',
            location: 'ул. Тараса Шевченко, 33, Ташкент, Узбекистан 100015',
            instagram: 'https://instagram.com/bonaldo.uzbekistan',
            phone: '+998 90 983 00 83',
            logoUrl: '/img/kukaLogo.png',
            CategoryId: furnitureCategory ? furnitureCategory.id : 1
        }
    ];

    await Shop.bulkCreate(shopsData);

    console.log('Database seeded successfully.');
}

seed().then(() => process.exit());
