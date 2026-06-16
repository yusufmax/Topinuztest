require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

let sequelize;
if (process.env.DATABASE_URL) {
    // Production (Render) with PostgreSQL
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    // Local Development with SQLite
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });
}

// Models

// Admin Users
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Categories (e.g., Living Room, Bedroom, Office)
const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    icon: {
      type: DataTypes.STRING
    }
});



// SubCategories (e.g., Sofas, Beds, Desks)
const SubCategory = sequelize.define('SubCategory', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name_ru: {
        type: DataTypes.STRING,
        allowNull: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// Shops
const Shop = sequelize.define('Shop', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customLinks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    socialPlatform: {
        type: DataTypes.STRING,
        allowNull: true
    },
    socialUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT
    },
    description_ru: {
        type: DataTypes.TEXT
    },
    location: {
        type: DataTypes.STRING
    },
    locationLink: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    },
    instagram: {
        type: DataTypes.STRING
    },
    telegram: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    logoUrl: {
        type: DataTypes.STRING
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// Products (Furniture items)
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    imageUrl: {
        type: DataTypes.STRING
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// Relationships
Shop.hasMany(Product);
Product.belongsTo(Shop);

Category.hasMany(Product);
Product.belongsTo(Category);

Category.hasMany(Shop);
Shop.belongsTo(Category);

Category.hasMany(SubCategory);
SubCategory.belongsTo(Category);

SubCategory.belongsToMany(Shop, { through: 'ShopSubCategories' });
Shop.belongsToMany(SubCategory, { through: 'ShopSubCategories' });

// Initialize Database
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Sync models with database
        if (sequelize.getDialect() === 'sqlite') {
            // SQLite has bugs with alter: true on Many-to-Many tables, so we do it manually
            await sequelize.query('PRAGMA foreign_keys = false;');
            await sequelize.sync(); 
            
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN socialPlatform VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN socialUrl VARCHAR(255);"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE Shops ADD COLUMN customLinks TEXT;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE SubCategories ADD COLUMN \"order\" INTEGER DEFAULT 0;"); } catch (e) {}
            try { await sequelize.query("ALTER TABLE SubCategories ADD COLUMN name_ru VARCHAR(255);"); } catch (e) {}

            await sequelize.query('PRAGMA foreign_keys = true;');
        } else {
            // PostgreSQL handles alter: true safely and natively
            await sequelize.sync({ alter: true });
        }
        
        console.log('Database synced.');
        
        // Create default admin if not exists
        const admin = await User.findOne({ where: { username: 'dragon_admin' } });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('F!re&Ic3_2077$NoBrute!', 12);
            await User.create({ username: 'dragon_admin', password: hashedPassword });
            console.log('Default admin user created.');
        } else {
            // Check if existing admin has plaintext password (simple check: length < 60)
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
    Category,
    SubCategory,
    Product,
    initDb
};
