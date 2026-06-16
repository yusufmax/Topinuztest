module.exports = (sequelize, DataTypes) => {
    return sequelize.define('SubCategory', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name_ru: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name_en: {
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
};
