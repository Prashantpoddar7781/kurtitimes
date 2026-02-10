# How to Add Products from constants.ts to Database

Since the database is empty, you need to add the products. Here are **3 ways** to do it:

## Method 1: Use Admin Panel (Easiest) ⭐

1. **Deploy the site** (if not already deployed)
2. **Open the admin panel** on your deployed site
3. **Add products one by one** using the "Add Product" button
4. All 22 products from `constants.ts` will be added to the database

## Method 2: Browser Console Script (Quick)

1. **Open your deployed site** in browser
2. **Open Developer Console** (F12)
3. **Copy and paste this script** (see below)
4. **Run it** - it will add all products automatically

### Browser Console Script:

```javascript
// Get products from constants
const products = [
  {
    id: 1,
    name: "Design 1 - Elegant Kurti Set",
    price: 2499,
    stock: 10,
    category: "Kurti Set",
    image: "/designs/D1/IMG-20251221-WA0005.jpg",
    images: [
      "/designs/D1/IMG-20251221-WA0005.jpg",
      "/designs/D1/IMG-20251221-WA0006.jpg",
      "/designs/D1/IMG-20251221-WA0033.jpg"
    ],
    description: "Elegant kurti set with modern design and comfortable fit.",
    rating: 4.5,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  // ... add all 22 products here
];

const API_URL = 'https://kurtitimes-production.up.railway.app';

async function seedProducts() {
  for (let product of products) {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          stock: product.stock || 0,
          category: product.category,
          image: product.image,
          images: product.images || [product.image],
          description: product.description || '',
          rating: product.rating || 0,
          topLength: product.topLength,
          pantLength: product.pantLength,
          fabric: product.fabric,
          availableSizes: product.availableSizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        })
      });
      
      if (response.ok) {
        console.log(`✅ Added: ${product.name}`);
      } else {
        console.error(`❌ Failed: ${product.name}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${product.name}`, error);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('Done!');
}

seedProducts();
```

## Method 3: Create a Seeding Component (For Development)

I can create a one-time seeding component that you can add to the admin dashboard to bulk import products.

## Recommended: Method 1 (Admin Panel)

**Easiest and safest** - just use the admin panel to add products. It's already set up and working!

---

**Note**: The products in `constants.ts` are now only used as a **fallback** if the API fails. Once you add products to the database, they'll be loaded from there instead.
