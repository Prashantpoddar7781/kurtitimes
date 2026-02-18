import React from 'react';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductClick }) => {
  return (
    <div 
      className="group relative bg-white overflow-hidden transition-all duration-300 flex flex-col h-full border-b border-r border-gray-100 last:border-r-0 cursor-pointer"
      onClick={() => onProductClick?.(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23d1d5db"%3E%3Cpath d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E';
          }}
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
