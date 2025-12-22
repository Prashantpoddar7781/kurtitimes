import React from 'react';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group relative bg-white overflow-hidden transition-all duration-300 flex flex-col h-full border-b border-r border-gray-100 last:border-r-0">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
      </div>

      {/* Info Section */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight truncate">
          {product.category === 'Kurti Set' ? 'Kurti Times' : 'Mira Boutique'}
        </h3>
        <p className="text-[11px] text-gray-500 truncate leading-tight mt-0.5">
          {product.name}
        </p>
        
        {/* Simplified Pricing */}
        <div className="mt-2 flex items-baseline gap-1 flex-wrap">
          <span className="text-sm font-bold text-gray-900">
            {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Add Button - Compact for grid layout */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="mt-auto pt-3 w-full text-brand-700 text-[11px] font-bold uppercase hover:text-brand-900 transition-colors flex items-center justify-center gap-1 border-t border-gray-50"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
