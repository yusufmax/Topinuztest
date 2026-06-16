const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

// Import modular definitions
const User = require('./User')(sequelize, DataTypes);
const Shop = require('./Shop')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const SubCategory = require('./SubCategory')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const ShopImage = require('./ShopImage')(sequelize, DataTypes);
const AnalyticsEvent = require('./AnalyticsEvent')(sequelize, DataTypes);

// Associations
Shop.hasMany(Product);
Product.belongsTo(Shop);

Shop.hasMany(User);
User.belongsTo(Shop);

Shop.hasMany(ShopImage, { onDelete: 'CASCADE' });
ShopImage.belongsTo(Shop);

Category.hasMany(Product);
Product.belongsTo(Category);

Category.hasMany(Shop);
Shop.belongsTo(Category);

Category.hasMany(SubCategory);
SubCategory.belongsTo(Category);

SubCategory.hasMany(Product);
Product.belongsTo(SubCategory);

SubCategory.belongsToMany(Shop, { through: 'ShopSubCategories' });
Shop.belongsToMany(SubCategory, { through: 'ShopSubCategories' });

Shop.hasMany(AnalyticsEvent, { onDelete: 'CASCADE' });
AnalyticsEvent.belongsTo(Shop);

Product.hasMany(AnalyticsEvent, { onDelete: 'CASCADE' });
AnalyticsEvent.belongsTo(Product);

// Database Initialization function
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        if (sequelize.getDialect() === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = false;');
            await sequelize.sync(); 
            
            // Legacy adjustments
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN socialPlatform VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN socialUrl VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN customLinks TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE SubCategories ADD COLUMN \"order\" INTEGER DEFAULT 0;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE SubCategories ADD COLUMN name_en VARCHAR(255);"); } catch (e) {}

            // Shop storefront columns
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN slug VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN bannerUrl TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN workingHours TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN currency VARCHAR(255) DEFAULT 'UZS';"); } catch (e) {}
            
            // Product catalogue columns
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN slug VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN shortDescription TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN salePrice DECIMAL(10,2);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN images TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN stockStatus VARCHAR(255) DEFAULT 'In Stock';"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN glbUrl TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN usdzUrl TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN tags TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN seoTitle VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN seoDescription VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN isPublished TINYINT(1) DEFAULT 1;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Products ADD COLUMN SubCategoryId INTEGER REFERENCES SubCategories (id) ON DELETE SET NULL ON UPDATE CASCADE;"); } catch (e) {}

            // User role and ShopId columns
            try { await sequelize.query("ALTER TABLE Users ADD COLUMN role VARCHAR(255) DEFAULT 'vendor';"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Users ADD COLUMN ShopId INTEGER REFERENCES Shops (id) ON DELETE SET NULL ON UPDATE CASCADE;"); } catch (e) {}

            await sequelize.query('PRAGMA foreign_keys = true;');
        } else {
            // PostgreSQL handles alter: true safely and natively
            await sequelize.sync({ alter: true });
        }
        
        console.log('Database synced.');

        // Populate missing slugs for existing shops
        const shopsWithoutSlugs = await Shop.findAll({ where: { slug: null } });
        if (shopsWithoutSlugs.length > 0) {
            const slugify = require('../utils/slugify');
            for (const shop of shopsWithoutSlugs) {
                shop.slug = slugify(shop.name);
                await shop.save();
                console.log(`Generated slug "${shop.slug}" for shop "${shop.name}"`);
            }
        }

        // Auto-seed missing vendor accounts for existing shops
        const allShops = await Shop.findAll();
        for (const shop of allShops) {
            const hasUser = await User.findOne({ where: { ShopId: shop.id } });
            if (!hasUser) {
                const vendorUsername = `${shop.slug}_admin`;
                const vendorPassword = `${shop.slug}_pass2026`;
                const hashedPassword = await bcrypt.hash(vendorPassword, 12);
                await User.create({
                    username: vendorUsername,
                    password: hashedPassword,
                    role: 'vendor',
                    ShopId: shop.id
                });
                console.log(`Seeded vendor account for ${shop.name}: Username: ${vendorUsername}, Password: ${vendorPassword}`);
            }
        }
        
        const admin = await User.findOne({ where: { username: 'dragon_admin' } });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('F!re&Ic3_2077$NoBrute!', 12);
            await User.create({ username: 'dragon_admin', password: hashedPassword, role: 'admin' });
            console.log('Default admin user created.');
        } else {
            if (admin.role !== 'admin') {
                admin.role = 'admin';
                await admin.save();
            }
            if (admin.password.length < 60) {
                console.log('Updating legacy plaintext admin password to bcrypt hash...');
                const hashedPassword = await bcrypt.hash('F!re&Ic3_2077$NoBrute!', 12);
                admin.password = hashedPassword;
                await admin.save();
                console.log('Admin password updated.');
            }
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Shop,
    ShopImage,
    Category,
    SubCategory,
    Product,
    AnalyticsEvent,
    initDb
};
