module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Category', {
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
};
