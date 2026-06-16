module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true
        },
        shortDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT
        },
        price: {
            type: DataTypes.DECIMAL(10, 2)
        },
        salePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.TEXT
        },
        images: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        stockStatus: {
            type: DataTypes.ENUM('In Stock', 'Out of Stock', 'Pre-order', 'Made to Order'),
            defaultValue: 'In Stock'
        },
        glbUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        usdzUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        tags: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        seoTitle: {
            type: DataTypes.STRING,
            allowNull: true
        },
        seoDescription: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
};
