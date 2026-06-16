const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
const token = jwt.sign({ id: 1, username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

const categories = [
  {"name":"Furniture","slug":"furniture"},
  {"name":"Lighting","slug":"lighting"},
  {"name":"Art & Decor","slug":"art-decor"},
  {"name":"Walls","slug":"walls"},
  {"name":"Floor","slug":"floor"},
  {"name":"Stone","slug":"stone"},
  {"name":"Real Estate","slug":"real-estate"},
  {"name":"Plants","slug":"plants"},
  {"name":"Bathroom","slug":"bathroom"},
  {"name":"Other","slug":"other"}
];

async function seed() {
  for (const cat of categories) {
    const res = await fetch('https://houz-platform.onrender.com/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cat)
    });
    const data = await res.json();
    console.log(`Seeded ${cat.name}:`, data);
  }
}
seed();
