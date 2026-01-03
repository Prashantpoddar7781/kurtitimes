import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, ChevronLeft, ChevronRight, ShoppingBag, Ruler } from 'lucide-react';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import SizeChartModal from './SizeChartModal';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const images = product.images || [product.image];
  const availableSizes = product.stockBySize 
    ? Object.entries(product.stockBySize)
        .filter(([_, stock]) => stock > 0)
        .map(([size]) => size)
    : ['S', 'M', 'L', 'XL', 'XXL'];

  const selectedSizeStock = selectedSize && product.stockBySize 
    ? product.stockBySize[selectedSize] || 0 
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (selectedSizeStock < quantity) {
      alert(`Only ${selectedSizeStock} items available in ${selectedSize}`);
      return;
    }
    try {
      onAddToCart(product, selectedSize);
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <h1 className="text-lg md:text-xl font-serif font-bold text-gray-900 truncate flex-1">
            {product.name}
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs md:text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-brand-700 ring-2 ring-brand-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <p className="text-sm md:text-base text-brand-600 font-medium mb-2">{product.category}</p>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-brand-700">
                    {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-lg md:text-xl">★</span>
                      <span className="text-gray-600 text-base md:text-lg">{product.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Details */}
              {product.details && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Product Details</h3>
                  <p className="text-sm md:text-base text-gray-600 whitespace-pre-line leading-relaxed">{product.details}</p>
                </div>
              )}

              {/* Size Selection */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base md:text-lg font-semibold text-gray-900">Select Size</label>
                  <button
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-sm text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    <Ruler className="h-4 w-4" />
                    Size Chart
                  </button>
                </div>
                {selectedSize && selectedSizeStock > 0 && (
                  <p className="text-xs md:text-sm text-gray-500 mb-3">
                    {selectedSizeStock} available in {selectedSize}
                  </p>
                )}
                {availableSizes.length === 0 ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Out of Stock</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {availableSizes.map((size) => {
                      const stock = product.stockBySize?.[size] || 0;
                      const isSelected = selectedSize === size;
                      const isOutOfStock = stock === 0;

                      return (
                        <button
                          key={size}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                          className={`py-2 md:py-3 px-3 md:px-4 rounded-lg border-2 font-semibold transition-all text-sm md:text-base ${
                            isSelected
                              ? 'border-brand-700 bg-brand-50 text-brand-700'
                              : isOutOfStock
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-brand-500 text-gray-700'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quantity Selection */}
              {selectedSize && selectedSizeStock > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <label className="text-base md:text-lg font-semibold text-gray-900 mb-3 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-2 md:p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                      <span className="px-4 md:px-6 py-2 md:py-3 font-medium min-w-[3rem] text-center text-base md:text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                        disabled={quantity >= selectedSizeStock}
                        className="p-2 md:p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </div>
                    <span className="text-sm md:text-base text-gray-600">
                      Max: {selectedSizeStock}
                    </span>
                  </div>
                </div>
              )}

              {/* Wash Care */}
              {product.washCare && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Wash Care Instructions</h3>
                  <p className="text-sm md:text-base text-gray-600 whitespace-pre-line leading-relaxed">{product.washCare}</p>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || availableSizes.length === 0}
                  className="w-full bg-brand-700 text-white py-3 md:py-4 px-6 rounded-lg font-semibold hover:bg-brand-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-base md:text-lg"
                >
                  <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
    </>
  );
};

export default ProductDetail;
