/**
 * Script to seed the database with products from constants.ts
 * Run this script to add all products from constants.ts to the Railway database
 */

import { PRODUCTS } from '../constants';
import api, { transformProductForBackend } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app';

async function seedProducts() {
  console.log('Starting to seed products...');
  console.log(`API URL: ${API_URL}`);
  console.log(`Total products to add: ${PRODUCTS.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    const productData = transformProductForBackend(product);

    try {
      console.log(`[${i + 1}/${PRODUCTS.length}] Adding: ${product.name}...`);
      
      const response = await api.post('/api/products', productData);
      
      if (response.data) {
        console.log(`✅ Successfully added: ${product.name} (ID: ${response.data.id || 'N/A'})`);
        successCount++;
      } else {
        console.log(`⚠️  Added but no response data: ${product.name}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ Failed to add ${product.name}:`, error.response?.data?.error || error.message);
      errorCount++;
      
      // If product already exists (409 conflict), count as success
      if (error.response?.status === 409 || error.response?.status === 400) {
        console.log(`   (Product may already exist)`);
        successCount++;
        errorCount--;
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n=== Seeding Complete ===');
  console.log(`✅ Successfully added: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total products: ${PRODUCTS.length}`);
}

// Run the seeding
seedProducts().catch(console.error);
