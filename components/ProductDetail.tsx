import React, { useState } from 'react';
import { X, Plus, Minus, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

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
    onAddToCart(product, selectedSize);
    onClose();
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-2xl font-serif font-bold text-gray-900">{product.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
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
            <div className="space-y-6">
              <div>
                <p className="text-sm text-brand-600 font-medium mb-2">{product.category}</p>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-brand-700">
                    {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600">{product.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">Select Size</label>
                  {selectedSize && selectedSizeStock > 0 && (
                    <span className="text-xs text-gray-500">
                      {selectedSizeStock} available
                    </span>
                  )}
                </div>
                {availableSizes.length === 0 ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Out of Stock</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {availableSizes.map((size) => {
                      const stock = product.stockBySize?.[size] || 0;
                      const isSelected = selectedSize === size;
                      const isOutOfStock = stock === 0;

                      return (
                        <button
                          key={size}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                          className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
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
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-3 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                        disabled={quantity >= selectedSizeStock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Max: {selectedSizeStock}
                    </span>
                  </div>
                </div>
              )}

              {/* Product Details */}
              {product.details && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Details</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{product.details}</p>
                </div>
              )}

              {/* Wash Care */}
              {product.washCare && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Wash Care</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{product.washCare}</p>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || availableSizes.length === 0}
                className="w-full bg-brand-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-brand-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

