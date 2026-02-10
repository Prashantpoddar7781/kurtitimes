/**
 * Script to seed the database with products from constants.ts
 * Run this in browser console or as a Node.js script
 */

// This script can be run in the browser console on the deployed site
// Or you can use the admin panel to add products one by one

const PRODUCTS = [
  // Copy all products from constants.ts here
  // For now, we'll create a simpler approach - use the admin panel
];

async function seedProducts() {
  const API_URL = import.meta.env?.VITE_API_URL || 'https://kurtitimes-production.up.railway.app';
  
  console.log('Starting to seed products...');
  console.log(`Total products to add: ${PRODUCTS.length}\n`);

  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          stock: product.stock || 0,
          stockBySize: product.stockBySize || {},
          category: product.category,
          image: product.image,
          images: product.images || [product.image].filter(Boolean),
          description: product.description || '',
          rating: product.rating || 0,
          topLength: product.topLength,
          pantLength: product.pantLength,
          fabric: product.fabric,
          availableSizes: product.availableSizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [${i + 1}/${PRODUCTS.length}] Added: ${product.name}`);
      } else {
        const error = await response.json();
        console.error(`❌ [${i + 1}/${PRODUCTS.length}] Failed: ${product.name} - ${error.error || response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ [${i + 1}/${PRODUCTS.length}] Error: ${product.name} -`, error);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n=== Seeding Complete ===');
}

// Uncomment to run:
// seedProducts();
