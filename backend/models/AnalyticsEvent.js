module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AnalyticsEvent', {
        eventType: {
            type: DataTypes.STRING, // 'page_view', 'product_view', 'ar_load'
            allowNull: false
        },
        deviceType: {
            type: DataTypes.STRING, // 'desktop', 'mobile', 'tablet'
            defaultValue: 'desktop'
        },
        referrer: {
            type: DataTypes.STRING, // 'direct', 'search', 'social', etc.
            defaultValue: 'direct'
        },
        ShopId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ProductId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });
};
