const { sequelize, Category, SubCategory } = require('./database');

const subCategoriesData = {
  "furniture": [
    { slug: 'soft-furniture', name: 'Yumshoq mebel' },
    { slug: 'cabinet-furniture', name: 'Korpusnaya mebel' },
    { slug: 'kitchen-furniture', name: 'Oshxona mebeli' },
    { slug: 'bedroom-furniture', name: 'Yotoqxona' },
    { slug: 'outdoor-furniture', name: 'Bog‘ mebeli' },
    { slug: 'tables', name: 'Stollar' }
  ],
  "lighting": [
    { slug: 'ceiling-lighting', name: 'Shift chiroqlari' },
    { slug: 'wall-lighting', name: 'Devor chiroqlari' },
    { slug: 'floor-lighting', name: 'Pol va stol lampalari' },
    { slug: 'street-lighting', name: 'Tashqi yoritish' },
    { slug: 'tech-lighting', name: 'Texnik yoritish' }
  ],
  "art-decor": [
    { slug: 'wall-decor', name: 'Devor dekori' },
    { slug: 'sculptures', name: 'Haykaltaroshlik' },
    { slug: 'textile', name: 'To‘qimachilik' },
    { slug: 'accessories', name: 'Aksessuarlar' }
  ],
  "walls": [
    { slug: 'paint', name: 'Bo‘yoqlar' },
    { slug: 'wallpaper', name: 'Gulqog‘ozlar' },
    { slug: 'panels', name: 'Panellar' },
    { slug: 'wall-tiles', name: 'Kafel' }
  ],
  "floor": [
    { slug: 'wood-floor', name: 'Yog‘ochli qoplamalar' },
    { slug: 'laminate', name: 'Laminat va vinil' },
    { slug: 'floor-tiles', name: 'Kafel' },
    { slug: 'carpet', name: 'Yumshoq qoplamalar' }
  ],
  "stone": [
    { slug: 'natural-stone', name: 'Tabiiy tosh' },
    { slug: 'artificial-stone', name: 'Sun’iy tosh' },
    { slug: 'format', name: 'Format' }
  ],
  "real-estate": [
    { slug: 'facade', name: 'Fasad materiallari' },
    { slug: 'roofing', name: 'Krovlya va vodostoki' },
    { slug: 'landscape', name: 'Landshaft' },
    { slug: 'pools', name: 'Basseynlar' },
    { slug: 'fences', name: 'Zaborlar va avtomatik darvozalar' },
    { slug: 'facade-lights', name: 'Arxitektura yoritilishi' }
  ],
  "plants": [
    { slug: 'artificial-plants', name: 'Sun’iy o‘simliklar' }
  ],
  "bathroom": [
    { slug: 'plumbing', name: 'Santexnika' },
    { slug: 'shower', name: 'Dush' },
    { slug: 'faucets', name: 'Smesitellar va aksessuarlar' },
    { slug: 'bathroom-furniture', name: 'Vanna mebellari' }
  ],
  "other": [
    { slug: 'furniture-fittings', name: 'Furnituralar' },
    { slug: 'smart-home', name: 'Texnika' },
    { slug: 'acoustics', name: 'Akustika' }
  ]
};

async function seed() {
    await sequelize.authenticate();
    console.log('Connected to Database...');
    
    // For each main category in data
    for (const [catSlug, subCats] of Object.entries(subCategoriesData)) {
        // Find existing Category
        const category = await Category.findOne({ where: { slug: catSlug } });
        
        if (category) {
            console.log(`Seeding subcategories for Category: ${catSlug} (ID: ${category.id})`);
            
            for (const sub of subCats) {
                // Upsert Subcategory
                const [sc, created] = await SubCategory.findOrCreate({
                    where: { slug: sub.slug },
                    defaults: {
                        name: sub.name,
                        CategoryId: category.id
                    }
                });
                
                // Keep it synced if it already exists but doesn't have the CategoryId
                if (!created && sc.CategoryId !== category.id) {
                    sc.CategoryId = category.id;
                    await sc.save();
                }
            }
        } else {
            console.log(`Warning: Category ${catSlug} not found in DB!`);
        }
    }
    
    console.log('Subcategories seeded successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
