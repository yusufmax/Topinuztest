module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Shop', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
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
            type: DataTypes.TEXT
        },
        bannerUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        workingHours: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'UZS'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
};
