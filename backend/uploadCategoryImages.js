require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const categories = [
  { slug: 'furniture',   file: 'Furniture.png' },
  { slug: 'lighting',    file: 'Lighting.png' },
  { slug: 'art-decor',   file: 'Art & Decor.png' },
  { slug: 'walls',       file: 'Walls.png' },
  { slug: 'floor',       file: 'Floor.png' },
  { slug: 'stone',       file: 'Stone.png' },
  { slug: 'real-estate', file: 'Real Estate.png' },
  { slug: 'plants',      file: 'Plants.png' },
  { slug: 'bathroom',    file: 'Bathroom.png' },
  { slug: 'other',       file: 'Other.png' },
];

async function uploadAll() {
  const results = {};

  for (const cat of categories) {
    const filePath = path.join(__dirname, '../frontend/img', cat.file);
    try {
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 'houz_categories',
        public_id: cat.slug,
        overwrite: true,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      results[cat.slug] = res.secure_url;
      console.log(`✅ ${cat.slug}: ${res.secure_url}`);
    } catch (err) {
      console.error(`❌ ${cat.slug}: ${err.message}`);
    }
  }

  console.log('\n--- Copy these URLs into home.js ---\n');
  console.log(JSON.stringify(results, null, 2));
}

uploadAll();
