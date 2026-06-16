const { Category, Shop, SubCategory, Product } = require('../models');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        await category.update(req.body);
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        
        // Also delete related shops
        await Shop.destroy({ where: { CategoryId: req.params.id } });
        await SubCategory.destroy({ where: { CategoryId: req.params.id } });
        await Product.destroy({ where: { CategoryId: req.params.id } });
        
        await category.destroy();
        res.json({ success: true, message: 'Category and all related data deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
