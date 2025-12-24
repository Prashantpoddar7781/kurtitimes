import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  nextId: number;
}

interface ImageFile {
  file: File;
  preview: string;
  dataUrl: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, nextId }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState<Category>(Category.KURTI_SET);
  const [description, setDescription] = useState('');
  const [topLength, setTopLength] = useState('45 inches');
  const [pantLength, setPantLength] = useState('39 inches');
  const [fabric, setFabric] = useState('Rayon');
  const [washCare, setWashCare] = useState('This Product is handmade. Actual colors may vary slightly due to your screens resolution and settings.');
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: ImageFile[] = [];
    const remainingSlots = 5 - imageFiles.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          dataUrl: dataUrl as string,
        });
      }
    }

    setImageFiles([...imageFiles, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = imageFiles[index];
    URL.revokeObjectURL(imageToRemove.preview);
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const toggleSize = (size: string) => {
    if (availableSizes.includes(size)) {
      setAvailableSizes(availableSizes.filter(s => s !== size));
    } else {
      setAvailableSizes([...availableSizes, size]);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (imageFiles.length < 1) {
      newErrors.images = 'At least 1 image is required';
    }
    if (imageFiles.length > 5) {
      newErrors.images = 'Maximum 5 images allowed';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (availableSizes.length === 0) {
      newErrors.sizes = 'At least one size must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Convert image files to data URLs for storage
    const imageUrls = imageFiles.map(img => img.dataUrl);

    const newProduct: Product = {
      id: nextId,
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category: category,
      image: imageUrls[0],
      images: imageUrls,
      description: description.trim(),
      rating: 0,
      topLength: topLength.trim() || undefined,
      pantLength: pantLength.trim() || undefined,
      fabric: fabric.trim() || undefined,
      availableSizes: availableSizes,
    };

    onSave(newProduct);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    // Clean up object URLs
    imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    
    setName('');
    setPrice('');
    setStock('10');
    setCategory(Category.KURTI_SET);
    setDescription('');
    setTopLength('45 inches');
    setPantLength('39 inches');
    setFabric('Rayon');
    setWashCare('This Product is handmade. Actual colors may vary slightly due to your screens resolution and settings.');
    setImageFiles([]);
    setAvailableSizes(['S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[250] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-serif font-bold text-gray-900">Add New Product</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500`}
                  placeholder="e.g., Design 14 - Elegant Kurti Set"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="1"
                    className={`w-full border ${errors.price ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500`}
                    placeholder="2499"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    min="0"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                >
                  {Object.values(Category).filter(cat => cat !== Category.ALL).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images * (Min: 1, Max: 5)
                </label>
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Image Preview Grid */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {imageFiles.map((imageFile, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={imageFile.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-brand-700 text-white text-xs rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {imageFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-500 hover:text-brand-700 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    {imageFiles.length === 0 ? 'Upload Images (1-5)' : `Add More Images (${imageFiles.length}/5)`}
                  </button>
                )}

                {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  Upload 1-5 product images. First image will be used as the main product image.
                </p>
              </div>

              {/* Available Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes * (Select at least one)
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        availableSizes.includes(size)
                          ? 'border-brand-700 bg-brand-50 text-brand-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {errors.sizes && <p className="mt-1 text-sm text-red-600">{errors.sizes}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500`}
                  placeholder="Elegant kurti set with modern design and comfortable fit."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Top Length
                  </label>
                  <input
                    type="text"
                    value={topLength}
                    onChange={(e) => setTopLength(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    placeholder="45 inches"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pant Length
                  </label>
                  <input
                    type="text"
                    value={pantLength}
                    onChange={(e) => setPantLength(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    placeholder="39 inches"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fabric
                  </label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Rayon"
                  />
                </div>
              </div>

              {/* Details & Wash Care */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details & Wash Care
                </label>
                <textarea
                  value={washCare}
                  onChange={(e) => setWashCare(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="This Product is handmade. Actual colors may vary slightly due to your screens resolution and settings."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-700 text-white rounded-md hover:bg-brand-800 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;

