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
  category: Category;
  image: string;
  description: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}