import React, { useState } from 'react';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { ChevronLeft, ChevronRight, Ruler, ShoppingBag, MessageCircle, CreditCard } from 'lucide-react';
import SizeChartModal from './SizeChartModal';
import { initiatePayment } from '../services/razorpayService';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  onBuyNow: (product: Product, size: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart, onBuyNow }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSizeChart, setShowSizeChart] = useState(false);

  const images = product.images || [product.image];
  const availableSizes = product.availableSizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onAddToCart(product, selectedSize);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onBuyNow(product, selectedSize);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Product Details</h1>
            <div className="w-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="relative bg-gray-100">
              <div className="sticky top-0">
                {/* Main Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="bg-white p-4 border-t border-gray-200">
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === idx
                              ? 'border-brand-700 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white p-6">
              <div className="mb-4">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{product.name.toUpperCase().replace(/\s/g, '')}-{selectedSize || 'M'}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Tax included. Shipping calculated at checkout.</p>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-900 uppercase">Size</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'border-brand-700 bg-brand-50 text-brand-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="mt-4 flex items-center gap-2 text-brand-700 hover:text-brand-800 transition-colors"
                >
                  <Ruler className="h-4 w-4" />
                  <span className="text-sm font-medium">SIZE CHART</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white border-2 border-gray-900 text-gray-900 font-bold py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-brand-700 text-white font-bold py-4 rounded-lg hover:bg-brand-800 transition-colors"
                >
                  BUY NOW
                </button>
              </div>

              {/* Help Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-3 rounded-full">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Need Help? Chat with us</p>
                    <a href="https://wa.me/919892794421" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-brand-700">
                      WhatsApp Support
                    </a>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Top Length:</strong> {product.topLength || '45 inches'}</p>
                    <p><strong>Pant Length:</strong> {product.pantLength || '39 inches'}</p>
                    <p><strong>Fabric:</strong> {product.fabric || 'Rayon'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Details & Wash Care</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This Product is handmade. Actual colors may vary slightly due to your screens resolution and settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </>
  );
};

export default ProductDetail;


