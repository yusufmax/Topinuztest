const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

// Configure cloudinary only if env vars are present
const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

/**
 * Uploads a file buffer either to Cloudinary or to the local filesystem (as a fallback).
 * 
 * @param {Buffer} buffer The file buffer
 * @param {string} folder The subfolder name (e.g., 'topin_ar_models')
 * @param {string} filename The desired filename
 * @param {string} resourceType The resource type ('image' or 'raw')
 * @returns {Promise<string>} Resolves with the public URL or relative local path
 */
function uploadBuffer(buffer, folder, filename, resourceType = 'image') {
    return new Promise((resolve, reject) => {
        if (isCloudinaryConfigured) {
            const options = {
                folder: folder,
                resource_type: resourceType
            };
            if (filename) {
                if (resourceType === 'raw') {
                    options.public_id = filename;
                } else {
                    const ext = path.extname(filename);
                    options.public_id = path.basename(filename, ext);
                }
            }
            
            const uploadStream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result.secure_url);
                }
            );
            uploadStream.end(buffer);
        } else {
            // Local fallback
            try {
                const uploadDir = path.join(__dirname, '../../frontend/uploads', folder || '');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                let finalFilename = filename;
                if (!finalFilename) {
                    const ext = resourceType === 'raw' ? 'bin' : 'jpg';
                    finalFilename = `${crypto.randomUUID()}.${ext}`;
                } else {
                    // Make sure the filename is unique/safe by appending timestamp
                    const ext = path.extname(finalFilename);
                    const base = path.basename(finalFilename, ext);
                    finalFilename = `${base}_${Date.now()}${ext}`;
                }
                
                const filePath = path.join(uploadDir, finalFilename);
                fs.writeFileSync(filePath, buffer);
                
                // Return a relative URL starting with /uploads
                const relativeUrl = `/uploads/${folder ? folder + '/' : ''}${finalFilename}`;
                resolve(relativeUrl);
            } catch (err) {
                reject(err);
            }
        }
    });
}

module.exports = {
    uploadBuffer,
    isCloudinaryConfigured
};
