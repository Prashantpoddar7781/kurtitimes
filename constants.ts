import { Product, Category } from './types';

export const PRODUCTS: Product[] = [
  // Kurti Sets - 13 Designs
  {
    id: 1,
    name: "Design 1 - Elegant Kurti Set",
    price: 2499,
    stock: 10,
    category: Category.KURTI_SET,
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
  {
    id: 2,
    name: "Design 2 - Classic Kurti Set",
    price: 2299,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D2/IMG-20251221-WA0003.jpg",
    images: [
      "/designs/D2/IMG-20251221-WA0003.jpg",
      "/designs/D2/IMG-20251221-WA0016.jpg",
      "/designs/D2/IMG-20251221-WA0017.jpg",
      "/designs/D2/IMG-20251221-WA0027.jpg"
    ],
    description: "Classic kurti set with traditional patterns and contemporary style.",
    rating: 4.6,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 3,
    name: "Design 3 - Premium Kurti Set",
    price: 2799,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D3/IMG-20251221-WA0001.jpg",
    images: [
      "/designs/D3/IMG-20251221-WA0001.jpg",
      "/designs/D3/IMG-20251221-WA0004.jpg",
      "/designs/D3/IMG-20251221-WA0012.jpg",
      "/designs/D3/IMG-20251221-WA0036.jpg"
    ],
    description: "Premium quality kurti set with intricate detailing.",
    rating: 4.8,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 4,
    name: "Design 4 - Stylish Kurti Set",
    price: 2399,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D4/IMG-20251221-WA0022.jpg",
    images: [
      "/designs/D4/IMG-20251221-WA0022.jpg",
      "/designs/D4/IMG-20251221-WA0030.jpg",
      "/designs/D4/IMG-20251221-WA0032.jpg",
      "/designs/D4/IMG-20251221-WA0038.jpg"
    ],
    description: "Stylish kurti set perfect for casual and semi-formal occasions.",
    rating: 4.4,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 5,
    name: "Design 5 - Trendy Kurti Set",
    price: 2599,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D5/IMG-20251221-WA0014.jpg",
    images: [
      "/designs/D5/IMG-20251221-WA0014.jpg",
      "/designs/D5/IMG-20251221-WA0019.jpg",
      "/designs/D5/IMG-20251221-WA0025.jpg",
      "/designs/D5/IMG-20251221-WA0043.jpg"
    ],
    description: "Trendy kurti set with modern prints and comfortable fabric.",
    rating: 4.7,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 6,
    name: "Design 6 - Elegant Print Kurti Set",
    price: 2499,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D6/IMG-20251221-WA0021.jpg",
    images: [
      "/designs/D6/IMG-20251221-WA0021.jpg",
      "/designs/D6/IMG-20251221-WA0044.jpg",
      "/designs/D6/IMG-20251221-WA0048.jpg",
      "/designs/D6/IMG-20251221-WA0050.jpg"
    ],
    description: "Elegant printed kurti set with beautiful patterns.",
    rating: 4.5,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 7,
    name: "Design 7 - Chic Kurti Set",
    price: 2699,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D7/IMG-20251221-WA0023.jpg",
    images: [
      "/designs/D7/IMG-20251221-WA0023.jpg",
      "/designs/D7/IMG-20251221-WA0034.jpg",
      "/designs/D7/IMG-20251221-WA0049.jpg",
      "/designs/D7/IMG-20251221-WA0056.jpg"
    ],
    description: "Chic kurti set with contemporary design elements.",
    rating: 4.6,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 8,
    name: "Design 8 - Modern Kurti Set",
    price: 2399,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D8/IMG-20251221-WA0007.jpg",
    images: [
      "/designs/D8/IMG-20251221-WA0007.jpg",
      "/designs/D8/IMG-20251221-WA0069.jpg",
      "/designs/D8/IMG-20251221-WA0074.jpg",
      "/designs/D8/IMG-20251221-WA0076.jpg"
    ],
    description: "Modern kurti set with sleek design and perfect fit.",
    rating: 4.4,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 9,
    name: "Design 9 - Beautiful Kurti Set",
    price: 2599,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D9/IMG-20251221-WA0065.jpg",
    images: [
      "/designs/D9/IMG-20251221-WA0065.jpg",
      "/designs/D9/IMG-20251221-WA0077.jpg",
      "/designs/D9/IMG-20251221-WA0079.jpg",
      "/designs/D9/IMG-20251221-WA0086.jpg"
    ],
    description: "Beautiful kurti set with elegant styling and premium quality.",
    rating: 4.7,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 10,
    name: "Design 10 - Fashionable Kurti Set",
    price: 2499,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D10/IMG-20251221-WA0054.jpg",
    images: [
      "/designs/D10/IMG-20251221-WA0054.jpg",
      "/designs/D10/IMG-20251221-WA0072.jpg",
      "/designs/D10/IMG-20251221-WA0075.jpg"
    ],
    description: "Fashionable kurti set for the modern woman.",
    rating: 4.5,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 11,
    name: "Design 11 - Exquisite Kurti Set",
    price: 2799,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D11/IMG-20251221-WA0062.jpg",
    images: [
      "/designs/D11/IMG-20251221-WA0062.jpg",
      "/designs/D11/IMG-20251221-WA0073.jpg",
      "/designs/D11/IMG-20251221-WA0081.jpg",
      "/designs/D11/IMG-20251221-WA0085.jpg"
    ],
    description: "Exquisite kurti set with fine craftsmanship.",
    rating: 4.8,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 12,
    name: "Design 12 - Sophisticated Kurti Set",
    price: 2699,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D12/IMG-20251221-WA0064.jpg",
    images: [
      "/designs/D12/IMG-20251221-WA0064.jpg",
      "/designs/D12/IMG-20251221-WA0066.jpg",
      "/designs/D12/IMG-20251221-WA0083.jpg"
    ],
    description: "Sophisticated kurti set with refined elegance.",
    rating: 4.6,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: 13,
    name: "Design 13 - Deluxe Kurti Set",
    price: 2899,
    stock: 10,
    category: Category.KURTI_SET,
    image: "/designs/D13/IMG-20251221-WA0057.jpg",
    images: [
      "/designs/D13/IMG-20251221-WA0057.jpg",
      "/designs/D13/IMG-20251221-WA0059.jpg",
      "/designs/D13/IMG-20251221-WA0071.jpg"
    ],
    description: "Deluxe kurti set with premium finish and luxurious feel.",
    rating: 4.9,
    topLength: "45 inches",
    pantLength: "39 inches",
    fabric: "Rayon",
    availableSizes: ["S", "M", "L", "XL", "XXL", "XXXL"]
  },
  
  // Indo Western
  {
    id: 14,
    name: "Asymmetric Hem Fusion Dress",
    price: 2199,
    stock: 10,
    category: Category.INDO_WESTERN,
    image: "https://picsum.photos/400/600?random=4",
    description: "Modern cut with traditional motifs.",
    rating: 4.3
  },
  {
    id: 15,
    name: "Dhoti Style Saree Kurta",
    price: 2799,
    stock: 10,
    category: Category.INDO_WESTERN,
    image: "https://picsum.photos/400/600?random=5",
    description: "Chic dhoti pants paired with a crop kurta and drape.",
    rating: 4.6
  },
  {
    id: 16,
    name: "Cape Style Maxi",
    price: 2999,
    stock: 10,
    category: Category.INDO_WESTERN,
    image: "https://picsum.photos/400/600?random=6",
    description: "Floor length maxi with an attached sheer cape.",
    rating: 4.4
  },

  // Co-ord Sets
  {
    id: 17,
    name: "Ikat Print Co-ord",
    price: 1599,
    stock: 10,
    category: Category.COORD_SETS,
    image: "https://picsum.photos/400/600?random=7",
    description: "Trendy ikat print shirt and pant set.",
    rating: 4.1
  },
  {
    id: 18,
    name: "Silk Lounge Set",
    price: 3499,
    stock: 10,
    category: Category.COORD_SETS,
    image: "https://picsum.photos/400/600?random=8",
    description: "Luxurious silk co-ord set in pastel peach.",
    rating: 4.9
  },
  {
    id: 19,
    name: "Boho Chic Trouser Set",
    price: 1999,
    stock: 10,
    category: Category.COORD_SETS,
    image: "https://picsum.photos/400/600?random=9",
    description: "Relaxed fit trousers with a matching kaftan top.",
    rating: 4.5
  },

  // Tunics
  {
    id: 20,
    name: "Embroidered Georgette Tunic",
    price: 1299,
    stock: 10,
    category: Category.TUNICS,
    image: "https://picsum.photos/400/600?random=10",
    description: "Short georgette tunic with neck embroidery.",
    rating: 4.0
  },
  {
    id: 21,
    name: "Denim Fusion Tunic",
    price: 1499,
    stock: 10,
    category: Category.TUNICS,
    image: "https://picsum.photos/400/600?random=11",
    description: "Casual denim tunic with indian prints.",
    rating: 4.3
  },
  {
    id: 22,
    name: "Angrakha Style Short Kurti",
    price: 1199,
    stock: 10,
    category: Category.TUNICS,
    image: "https://picsum.photos/400/600?random=12",
    description: "Traditional angrakha pattern in a short tunic length.",
    rating: 4.2
  },
];

export const APP_NAME = "Kurti Times";
export const CURRENCY_SYMBOL = "₹";