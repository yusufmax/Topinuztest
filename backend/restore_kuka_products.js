const { sequelize, Product, Shop } = require('./models');

const kukaProducts = [
  {
    name: "Test 3D Product (USDZ)",
    slug: "test-3d-product-usdz",
    shortDescription: "Original Test 3D Product with USDZ",
    description: "Original test product with iOS Quick Look AR model.",
    price: 1000,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop",
    images: JSON.stringify(["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop"]),
    stockStatus: "In Stock",
    glbUrl: null,
    usdzUrl: "/uploads/topin_ar_models/test-3d-product_1781373147269_1781373147270.usdz",
    tags: "test, ar, usdz",
    ShopId: 1,
    CategoryId: 1,
    SubCategoryId: null,
    isPublished: true,
    isAvailable: true
  },
  {
    name: "Test 3D Product (Basic)",
    slug: "test-3d-product-basic",
    shortDescription: "Original Test 3D Product without AR",
    description: "Original test product without AR models.",
    price: 1000,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop",
    images: JSON.stringify(["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop"]),
    stockStatus: "In Stock",
    glbUrl: null,
    usdzUrl: null,
    tags: "test",
    ShopId: 1,
    CategoryId: 1,
    SubCategoryId: null,
    isPublished: true,
    isAvailable: true
  },
  {
    name: "Test 3D Product (GLB 1)",
    slug: "test-3d-product-glb-1",
    shortDescription: "Original Test 3D Product with GLB",
    description: "Original test product with Android GLB AR model.",
    price: 1000,
    imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop",
    images: JSON.stringify(["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop"]),
    stockStatus: "In Stock",
    glbUrl: "/uploads/topin_ar_models/test-3d-product_1781371752353_1781371752353.glb",
    usdzUrl: null,
    tags: "test, ar, glb",
    ShopId: 1,
    CategoryId: 1,
    SubCategoryId: null,
    isPublished: true,
    isAvailable: true
  },
  {
    name: "Test 3D Product (GLB 2)",
    slug: "test-3d-product-glb-2",
    shortDescription: "Original Test 3D Product with GLB Alt",
    description: "Original test product with secondary Android GLB AR model.",
    price: 1000,
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop",
    images: JSON.stringify(["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop"]),
    stockStatus: "In Stock",
    glbUrl: "/uploads/topin_ar_models/test-3d-product_1781371776677_1781371776677.glb",
    usdzUrl: null,
    tags: "test, ar, glb",
    ShopId: 1,
    CategoryId: 1,
    SubCategoryId: null,
    isPublished: true,
    isAvailable: true
  },
  {
    name: "Product 12312",
    slug: "product-12312",
    shortDescription: "Original 12312 Product",
    description: "Original product with ID 12312.",
    price: 11,
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop",
    images: JSON.stringify(["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop"]),
    stockStatus: "Pre-order",
    glbUrl: null,
    usdzUrl: null,
    tags: "test",
    ShopId: 1,
    CategoryId: 2,
    SubCategoryId: 7, // wall-lighting (Devor chiroqlari)
    isPublished: true,
    isAvailable: true
  },
  {
    name: "Product 434334 (AR)",
    slug: "product-434334-ar",
    shortDescription: "Original 434334 Product with USDZ",
    description: "Original product 434334 with custom USDZ AR model.",
    price: 43,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop",
    images: JSON.stringify(["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop"]),
    stockStatus: "Made to Order",
    glbUrl: null,
    usdzUrl: "/uploads/topin_ar_models/4343_1781376122072_1781376122073.usdz",
    tags: "test, ar, usdz",
    ShopId: 1,
    CategoryId: 4,
    SubCategoryId: 6, // paint (Bo‘yoqlar)
    isPublished: true,
    isAvailable: true
  },
  {
    name: "Divan (Original)",
    slug: "divan-original",
    shortDescription: "Original Divan Product",
    description: "Original Divan product.",
    price: 11,
    imageUrl: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop",
    images: JSON.stringify(["https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop"]),
    stockStatus: "In Stock",
    glbUrl: null,
    usdzUrl: null,
    tags: "divan, soft-furniture",
    ShopId: 1,
    CategoryId: 2,
    SubCategoryId: 7, // wall-lighting (Devor chiroqlari)
    isPublished: true,
    isAvailable: true
  }
];

async function run() {
  try {
    console.log('Verifying Kuka Home Mebel (ShopId 1)...');
    const shop = await Shop.findByPk(1);
    if (!shop) {
      console.error('Kuka Home Mebel (ShopId 1) not found in database.');
      process.exit(1);
    }

    console.log('Restoring products...');
    for (const prod of kukaProducts) {
      // Check if product with this slug already exists for ShopId 1
      const exists = await Product.findOne({ where: { ShopId: 1, slug: prod.slug } });
      if (exists) {
        console.log(`Product "${prod.name}" already exists. Updating...`);
        await exists.update(prod);
      } else {
        console.log(`Creating product "${prod.name}"...`);
        await Product.create(prod);
      }
    }

    console.log('Successfully restored original Kuka Home products with AR!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to restore products:', err);
    process.exit(1);
  }
}

run();
