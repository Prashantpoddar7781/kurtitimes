import React from 'react';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-50">
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-brand-500 font-medium">{product.category}</p>
            <h3 className="mt-1 text-lg font-serif font-semibold text-gray-900 truncate pr-2">
              {product.name}
            </h3>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-900">
            {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="relative z-10 flex items-center gap-1 bg-brand-50 text-brand-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 hover:text-white transition-colors duration-200 cursor-pointer active:bg-brand-800 active:text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;