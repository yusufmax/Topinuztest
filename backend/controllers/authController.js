const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const { uploadBuffer } = require('../utils/uploader');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.role === 'vendor') {
            const { Shop } = require('../models');
            const shop = await Shop.findByPk(user.ShopId);
            if (!shop || !shop.storeEnabled) {
                return res.status(401).json({ success: false, message: 'Store dashboard login is disabled for this store' });
            }
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, role: user.role });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        const fileUrl = await uploadBuffer(req.file.buffer, 'houz_shops', req.file.originalname, 'image');
        res.json({ success: true, data: { url: fileUrl } });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.impersonate = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const { shopId } = req.params;
        const targetUser = await User.findOne({ where: { ShopId: shopId, role: 'vendor' } });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'Vendor account not found for this shop' });
        }
        
        console.log(`[IMPERSONATION LOG] Admin ${currentUser.username} is impersonating shop ID ${shopId} (${targetUser.username}) at ${new Date().toISOString()}`);
        
        const token = jwt.sign(
            { id: targetUser.id, username: targetUser.username, role: targetUser.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        
        res.json({ success: true, token, role: targetUser.role });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

