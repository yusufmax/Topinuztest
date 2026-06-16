require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

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
        storage: path.join(__dirname, '../database.sqlite'), // Adjusted path up one level because we are inside config/
        logging: false
    });
}

module.exports = sequelize
