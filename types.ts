export enum Category {
  ALL = 'All',
  KURTI_SET = 'Kurti Set',
  INDO_WESTERN = 'Indo Western',
  COORD_SETS = 'Co-ord Sets',
  TUNICS = 'Tunics'
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number; // Total stock quantity (deprecated - use stockBySize instead)
  stockBySize?: { [size: string]: number }; // Stock quantity by size (e.g., { "S": 5, "M": 10, "L": 8 })
  category: Category;
  image: string;
  images?: string[]; // Multiple images for product detail
  description: string;
  rating: number;
  topLength?: string;
  pantLength?: string;
  fabric?: string;
  washCare?: string;
  availableSizes?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}