const multer = require('multer');

// Store file in memory buffer, upload manually to Cloudinary in the controller
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg', 'image/jpg', 'image/pjpeg', 
            'image/png', 'image/x-png', 
            'image/webp', 'image/gif', 'image/svg+xml'
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
});

// Store 3D models in memory buffer with 50MB limit
const uploadModel = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const allowedExtensions = ['glb', 'usdz', 'zip'];
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only .glb, .usdz and .zip files are allowed'));
        }
    }
});

module.exports = {
    upload,
    uploadModel
};
