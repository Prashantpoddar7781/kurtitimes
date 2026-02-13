import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests when admin is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kurtiTimesAdminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData needs browser-set Content-Type with boundary; remove JSON default
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Helper to transform backend product to frontend Product format
export const transformProduct = (backendProduct: any) => {
  const category = ENUM_TO_CATEGORY[backendProduct.category] || backendProduct.category;
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    price: backendProduct.price,
    stock: backendProduct.stock || 0,
    stockBySize: backendProduct.stockBySize || {},
    category,
    image: backendProduct.image || backendProduct.images?.[0] || '',
    images: backendProduct.images || [backendProduct.image].filter(Boolean),
    description: backendProduct.description || '',
    rating: backendProduct.rating || 0,
    topLength: backendProduct.topLength,
    pantLength: backendProduct.pantLength,
    fabric: backendProduct.fabric,
    availableSizes: backendProduct.availableSizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  };
};

// Map frontend category labels <-> Prisma enum values
const CATEGORY_TO_ENUM: Record<string, string> = {
  'All': 'ALL', 'Kurti Set': 'KURTI_SET', 'Indo Western': 'INDO_WESTERN',
  'Co-ord Sets': 'COORD_SETS', 'Tunics': 'TUNICS',
};
const ENUM_TO_CATEGORY: Record<string, string> = {
  'ALL': 'All', 'KURTI_SET': 'Kurti Set', 'INDO_WESTERN': 'Indo Western',
  'COORD_SETS': 'Co-ord Sets', 'TUNICS': 'Tunics',
};

// Helper to transform frontend product to backend format
export const transformProductForBackend = (product: any) => {
  const category = CATEGORY_TO_ENUM[product.category] || product.category;
  return {
    name: product.name,
    price: product.price,
    stock: product.stock || 0,
    stockBySize: product.stockBySize || {},
    category,
    image: product.image,
    images: product.images || [product.image].filter(Boolean),
    description: product.description || '',
    rating: product.rating || 0,
    topLength: product.topLength,
    pantLength: product.pantLength,
    fabric: product.fabric,
    availableSizes: product.availableSizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  };
};

export default api;
