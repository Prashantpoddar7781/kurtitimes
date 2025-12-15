import { Product, Category } from './types';

export const PRODUCTS: Product[] = [
  // Kurti Sets
  {
    id: 1,
    name: "Emerald Green Anarkali Set",
    price: 2499,
    category: Category.KURTI_SET,
    image: "https://picsum.photos/400/600?random=1",
    description: "Elegant emerald green floral print anarkali with dupatta.",
    rating: 4.5
  },
  {
    id: 2,
    name: "Cotton Block Print Set",
    price: 1899,
    category: Category.KURTI_SET,
    image: "https://picsum.photos/400/600?random=2",
    description: "Breathable cotton kurti with palazzo pants, perfect for summer.",
    rating: 4.2
  },
  {
    id: 3,
    name: "Festive Maroon Gotapatti",
    price: 3299,
    category: Category.KURTI_SET,
    image: "https://picsum.photos/400/600?random=3",
    description: "Heavy gotapatti work on maroon silk base.",
    rating: 4.8
  },
  
  // Indo Western
  {
    id: 4,
    name: "Asymmetric Hem Fusion Dress",
    price: 2199,
    category: Category.INDO_WESTERN,
    image: "https://picsum.photos/400/600?random=4",
    description: "Modern cut with traditional motifs.",
    rating: 4.3
  },
  {
    id: 5,
    name: "Dhoti Style Saree Kurta",
    price: 2799,
    category: Category.INDO_WESTERN,
    image: "https://picsum.photos/400/600?random=5",
    description: "Chic dhoti pants paired with a crop kurta and drape.",
    rating: 4.6
  },
  {
    id: 6,
    name: "Cape Style Maxi",
    price: 2999,
    category: Category.INDO_WESTERN,
    image: "https://picsum.photos/400/600?random=6",
    description: "Floor length maxi with an attached sheer cape.",
    rating: 4.4
  },

  // Co-ord Sets
  {
    id: 7,
    name: "Ikat Print Co-ord",
    price: 1599,
    category: Category.COORD_SETS,
    image: "https://picsum.photos/400/600?random=7",
    description: "Trendy ikat print shirt and pant set.",
    rating: 4.1
  },
  {
    id: 8,
    name: "Silk Lounge Set",
    price: 3499,
    category: Category.COORD_SETS,
    image: "https://picsum.photos/400/600?random=8",
    description: "Luxurious silk co-ord set in pastel peach.",
    rating: 4.9
  },
  {
    id: 9,
    name: "Boho Chic Trouser Set",
    price: 1999,
    category: Category.COORD_SETS,
    image: "https://picsum.photos/400/600?random=9",
    description: "Relaxed fit trousers with a matching kaftan top.",
    rating: 4.5
  },

  // Tunics
  {
    id: 10,
    name: "Embroidered Georgette Tunic",
    price: 1299,
    category: Category.TUNICS,
    image: "https://picsum.photos/400/600?random=10",
    description: "Short georgette tunic with neck embroidery.",
    rating: 4.0
  },
  {
    id: 11,
    name: "Denim Fusion Tunic",
    price: 1499,
    category: Category.TUNICS,
    image: "https://picsum.photos/400/600?random=11",
    description: "Casual denim tunic with indian prints.",
    rating: 4.3
  },
  {
    id: 12,
    name: "Angrakha Style Short Kurti",
    price: 1199,
    category: Category.TUNICS,
    image: "https://picsum.photos/400/600?random=12",
    description: "Traditional angrakha pattern in a short tunic length.",
    rating: 4.2
  },
];

export const APP_NAME = "Kurti Times";
export const CURRENCY_SYMBOL = "₹";