import { Product, Category } from './types';

export const PRODUCTS: Product[] = [
  // Kurti Sets - Using D1, D2, D3, D4
  {
    id: 1,
    name: "Emerald Green Anarkali Set",
    price: 2499,
    category: Category.KURTI_SET,
    image: "/designs/D1/IMG-20251221-WA0005.jpg",
    images: [
      "/designs/D1/IMG-20251221-WA0005.jpg",
      "/designs/D1/IMG-20251221-WA0006.jpg",
      "/designs/D1/IMG-20251221-WA0033.jpg"
    ],
    description: "Elegant emerald green floral print anarkali with dupatta.",
    rating: 4.5,
    stockBySize: { S: 5, M: 8, L: 10, XL: 6, XXL: 3 }
  },
  {
    id: 2,
    name: "Cotton Block Print Set",
    price: 1899,
    category: Category.KURTI_SET,
    image: "/designs/D2/IMG-20251221-WA0003.jpg",
    images: [
      "/designs/D2/IMG-20251221-WA0003.jpg",
      "/designs/D2/IMG-20251221-WA0016.jpg",
      "/designs/D2/IMG-20251221-WA0017.jpg",
      "/designs/D2/IMG-20251221-WA0027.jpg"
    ],
    description: "Breathable cotton kurti with palazzo pants, perfect for summer.",
    rating: 4.2,
    stockBySize: { S: 4, M: 7, L: 9, XL: 5, XXL: 2 }
  },
  {
    id: 3,
    name: "Festive Maroon Gotapatti",
    price: 3299,
    category: Category.KURTI_SET,
    image: "/designs/D3/IMG-20251221-WA0001.jpg",
    images: [
      "/designs/D3/IMG-20251221-WA0001.jpg",
      "/designs/D3/IMG-20251221-WA0004.jpg",
      "/designs/D3/IMG-20251221-WA0012.jpg",
      "/designs/D3/IMG-20251221-WA0036.jpg"
    ],
    description: "Heavy gotapatti work on maroon silk base.",
    rating: 4.8,
    stockBySize: { S: 3, M: 6, L: 8, XL: 4, XXL: 2 }
  },
  {
    id: 4,
    name: "Floral Print Kurti Set",
    price: 2199,
    category: Category.KURTI_SET,
    image: "/designs/D4/IMG-20251221-WA0022.jpg",
    images: [
      "/designs/D4/IMG-20251221-WA0022.jpg",
      "/designs/D4/IMG-20251221-WA0030.jpg",
      "/designs/D4/IMG-20251221-WA0032.jpg",
      "/designs/D4/IMG-20251221-WA0038.jpg"
    ],
    description: "Beautiful floral print kurti with matching bottom.",
    rating: 4.4,
    stockBySize: { S: 6, M: 9, L: 11, XL: 7, XXL: 4 }
  },
  
  // Indo Western - Using D5, D6, D7
  {
    id: 5,
    name: "Asymmetric Hem Fusion Dress",
    price: 2199,
    category: Category.INDO_WESTERN,
    image: "/designs/D5/IMG-20251221-WA0014.jpg",
    images: [
      "/designs/D5/IMG-20251221-WA0014.jpg",
      "/designs/D5/IMG-20251221-WA0019.jpg",
      "/designs/D5/IMG-20251221-WA0025.jpg",
      "/designs/D5/IMG-20251221-WA0043.jpg"
    ],
    description: "Modern cut with traditional motifs.",
    rating: 4.3,
    stockBySize: { S: 5, M: 8, L: 10, XL: 6, XXL: 3 }
  },
  {
    id: 6,
    name: "Dhoti Style Saree Kurta",
    price: 2799,
    category: Category.INDO_WESTERN,
    image: "/designs/D6/IMG-20251221-WA0021.jpg",
    images: [
      "/designs/D6/IMG-20251221-WA0021.jpg",
      "/designs/D6/IMG-20251221-WA0044.jpg",
      "/designs/D6/IMG-20251221-WA0048.jpg",
      "/designs/D6/IMG-20251221-WA0050.jpg"
    ],
    description: "Chic dhoti pants paired with a crop kurta and drape.",
    rating: 4.6,
    stockBySize: { S: 4, M: 7, L: 9, XL: 5, XXL: 2 }
  },
  {
    id: 7,
    name: "Cape Style Maxi",
    price: 2999,
    category: Category.INDO_WESTERN,
    image: "/designs/D7/IMG-20251221-WA0023.jpg",
    images: [
      "/designs/D7/IMG-20251221-WA0023.jpg",
      "/designs/D7/IMG-20251221-WA0034.jpg",
      "/designs/D7/IMG-20251221-WA0049.jpg",
      "/designs/D7/IMG-20251221-WA0056.jpg"
    ],
    description: "Floor length maxi with an attached sheer cape.",
    rating: 4.4,
    stockBySize: { S: 3, M: 6, L: 8, XL: 4, XXL: 2 }
  },

  // Co-ord Sets - Using D8, D9, D10
  {
    id: 8,
    name: "Ikat Print Co-ord",
    price: 1599,
    category: Category.COORD_SETS,
    image: "/designs/D8/IMG-20251221-WA0007.jpg",
    images: [
      "/designs/D8/IMG-20251221-WA0007.jpg",
      "/designs/D8/IMG-20251221-WA0069.jpg",
      "/designs/D8/IMG-20251221-WA0074.jpg",
      "/designs/D8/IMG-20251221-WA0076.jpg"
    ],
    description: "Trendy ikat print shirt and pant set.",
    rating: 4.1,
    stockBySize: { S: 7, M: 10, L: 12, XL: 8, XXL: 5 }
  },
  {
    id: 9,
    name: "Silk Lounge Set",
    price: 3499,
    category: Category.COORD_SETS,
    image: "/designs/D9/IMG-20251221-WA0065.jpg",
    images: [
      "/designs/D9/IMG-20251221-WA0065.jpg",
      "/designs/D9/IMG-20251221-WA0077.jpg",
      "/designs/D9/IMG-20251221-WA0079.jpg",
      "/designs/D9/IMG-20251221-WA0086.jpg"
    ],
    description: "Luxurious silk co-ord set in pastel peach.",
    rating: 4.9,
    stockBySize: { S: 2, M: 5, L: 7, XL: 4, XXL: 1 }
  },
  {
    id: 10,
    name: "Boho Chic Trouser Set",
    price: 1999,
    category: Category.COORD_SETS,
    image: "/designs/D10/IMG-20251221-WA0054.jpg",
    images: [
      "/designs/D10/IMG-20251221-WA0054.jpg",
      "/designs/D10/IMG-20251221-WA0072.jpg",
      "/designs/D10/IMG-20251221-WA0075.jpg"
    ],
    description: "Relaxed fit trousers with a matching kaftan top.",
    rating: 4.5,
    stockBySize: { S: 6, M: 9, L: 11, XL: 7, XXL: 4 }
  },

  // Tunics - Using D11, D12, D13
  {
    id: 11,
    name: "Embroidered Georgette Tunic",
    price: 1299,
    category: Category.TUNICS,
    image: "/designs/D11/IMG-20251221-WA0062.jpg",
    images: [
      "/designs/D11/IMG-20251221-WA0062.jpg",
      "/designs/D11/IMG-20251221-WA0073.jpg",
      "/designs/D11/IMG-20251221-WA0081.jpg",
      "/designs/D11/IMG-20251221-WA0085.jpg"
    ],
    description: "Short georgette tunic with neck embroidery.",
    rating: 4.0,
    stockBySize: { S: 8, M: 12, L: 15, XL: 10, XXL: 6 }
  },
  {
    id: 12,
    name: "Denim Fusion Tunic",
    price: 1499,
    category: Category.TUNICS,
    image: "/designs/D12/IMG-20251221-WA0064.jpg",
    images: [
      "/designs/D12/IMG-20251221-WA0064.jpg",
      "/designs/D12/IMG-20251221-WA0066.jpg",
      "/designs/D12/IMG-20251221-WA0083.jpg"
    ],
    description: "Casual denim tunic with indian prints.",
    rating: 4.3,
    stockBySize: { S: 5, M: 8, L: 10, XL: 6, XXL: 3 }
  },
  {
    id: 13,
    name: "Angrakha Style Short Kurti",
    price: 1199,
    category: Category.TUNICS,
    image: "/designs/D13/IMG-20251221-WA0057.jpg",
    images: [
      "/designs/D13/IMG-20251221-WA0057.jpg",
      "/designs/D13/IMG-20251221-WA0059.jpg",
      "/designs/D13/IMG-20251221-WA0071.jpg"
    ],
    description: "Traditional angrakha pattern in a short tunic length.",
    rating: 4.2,
    stockBySize: { S: 7, M: 10, L: 13, XL: 9, XXL: 5 }
  },
];

export const APP_NAME = "Kurti Times";
export const CURRENCY_SYMBOL = "₹";
