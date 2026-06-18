const { Review, Shop, Product } = require('../models');

async function recalculateShopRating(shopId) {
    try {
        const shop = await Shop.findByPk(shopId);
        if (!shop) return;

        const reviews = await Review.findAll({ where: { ShopId: shopId } });
        const count = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);

        const baseRating = (shop.baseRating !== undefined && shop.baseRating !== null) ? parseFloat(shop.baseRating) : 5.0;
        const baseRatingCount = (shop.baseRatingCount !== undefined && shop.baseRatingCount !== null) ? parseInt(shop.baseRatingCount) : 1;

        const divisor = baseRatingCount + count;
        const combinedRating = divisor > 0 ? (baseRating * baseRatingCount + sum) / divisor : 5.0;
        
        shop.rating = parseFloat(combinedRating.toFixed(2));
        shop.reviewsCount = count;
        await shop.save();
    } catch (err) {
        console.error('Error recalculating shop rating:', err);
    }
}

async function recalculateProductRating(productId) {
    try {
        const product = await Product.findByPk(productId);
        if (!product) return;

        const reviews = await Review.findAll({ where: { ProductId: productId } });
        const count = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);

        const baseRating = (product.baseRating !== undefined && product.baseRating !== null) ? parseFloat(product.baseRating) : 5.0;
        const baseRatingCount = (product.baseRatingCount !== undefined && product.baseRatingCount !== null) ? parseInt(product.baseRatingCount) : 1;

        const divisor = baseRatingCount + count;
        const combinedRating = divisor > 0 ? (baseRating * baseRatingCount + sum) / divisor : 5.0;

        product.rating = parseFloat(combinedRating.toFixed(2));
        product.reviewsCount = count;
        await product.save();
    } catch (err) {
        console.error('Error recalculating product rating:', err);
    }
}

module.exports = {
    recalculateShopRating,
    recalculateProductRating
};
