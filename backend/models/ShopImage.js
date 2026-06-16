module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ShopImage', {
        url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });
};
