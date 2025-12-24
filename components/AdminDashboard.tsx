import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus, Save, XCircle } from 'lucide-react';
import { Product, Category } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import AddProductModal from './AddProductModal';

// Stock Display Component
const StockDisplay: React.FC<{ product: Product }> = ({ product }) => {
  const stockBySize = product.stockBySize || {};
  const totalStock = Object.values(stockBySize).reduce((sum, stock) => sum + stock, 0) || product.stock || 0;
  
  if (Object.keys(stockBySize).length > 0) {
    return (
      <div className="text-right">
        <div className={`text-sm font-medium ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
          Total: {totalStock}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Object.entries(stockBySize).map(([size, stock]) => (
            <span key={size} className="mr-2">{size}: {stock}</span>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <span className={`text-sm font-medium ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
      {totalStock}
    </span>
  );
};

// Stock By Size Editor Component
const StockBySizeEditor: React.FC<{ 
  product: Product; 
  onUpdate: (stockBySize: { [size: string]: number }) => void;
}> = ({ product, onUpdate }) => {
  const availableSizes = product.availableSizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const stockBySize = product.stockBySize || {};
  
  const handleSizeStockChange = (size: string, value: number) => {
    const updated = { ...stockBySize, [size]: Math.max(0, value) };
    onUpdate(updated);
  };
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {availableSizes.map(size => (
          <div key={size} className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">{size}</label>
            <input
              type="number"
              min="0"
              value={stockBySize[size] || 0}
              onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="0"
            />
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        Total: {Object.values(stockBySize).reduce((sum, stock) => sum + stock, 0)}
      </div>
    </div>
  );
};

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, products, onUpdateProducts }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editedProducts, setEditedProducts] = useState<Product[]>(products);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  if (!isOpen) return null;

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSave = () => {
    if (!editingProduct) return;

    const updated = editedProducts.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    );
    setEditedProducts(updated);
    onUpdateProducts(updated);
    setEditingProduct(null);
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const handleDelete = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = editedProducts.filter(p => p.id !== productId);
      setEditedProducts(updated);
      onUpdateProducts(updated);
    }
  };

  const handleAddNew = () => {
    setIsAddProductOpen(true);
  };

  const handleSaveNewProduct = (newProduct: Product) => {
    const updated = [...editedProducts, newProduct];
    setEditedProducts(updated);
    onUpdateProducts(updated);
  };

  const handleUpdateField = (field: keyof Product, value: any) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-gray-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add New Product
              </button>
            </div>

            <AddProductModal
              isOpen={isAddProductOpen}
              onClose={() => setIsAddProductOpen(false)}
              onSave={handleSaveNewProduct}
              nextId={Math.max(...editedProducts.map(p => p.id), 0) + 1}
            />

            {/* Products Table - Desktop View */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {editedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded object-cover" src={product.image} alt={product.name} />
                          <div className="ml-4">
                            {editingProduct?.id === product.id ? (
                              <input
                                type="text"
                                value={editingProduct.name}
                                onChange={(e) => handleUpdateField('name', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-medium"
                              />
                            ) : (
                              <>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">ID: {product.id}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProduct?.id === product.id ? (
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => handleUpdateField('price', parseFloat(e.target.value) || 0)}
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProduct?.id === product.id ? (
                          <StockBySizeEditor
                            product={editingProduct}
                            onUpdate={(stockBySize) => handleUpdateField('stockBySize', stockBySize)}
                          />
                        ) : (
                          <StockDisplay product={product} />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProduct?.id === product.id ? (
                          <select
                            value={editingProduct.category}
                            onChange={(e) => handleUpdateField('category', e.target.value as Category)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            {Object.values(Category).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-500">{product.category}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingProduct?.id === product.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleSave}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                              title="Cancel"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-brand-600 hover:text-brand-900 hover:bg-brand-50 rounded"
                              title="Edit"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Products Cards - Mobile View */}
            <div className="md:hidden space-y-4">
              {editedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img className="h-16 w-16 rounded object-cover flex-shrink-0" src={product.image} alt={product.name} />
                    <div className="flex-1 min-w-0">
                      {editingProduct?.id === product.id ? (
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => handleUpdateField('name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-medium mb-1"
                        />
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-500">ID: {product.id}</div>
                        </>
                      )}
                    </div>
                    {editingProduct?.id === product.id ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={handleSave}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                          title="Cancel"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-brand-600 hover:text-brand-900 hover:bg-brand-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Price:</span>
                      {editingProduct?.id === product.id ? (
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => handleUpdateField('price', parseFloat(e.target.value) || 0)}
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-gray-500">Stock:</span>
                      {editingProduct?.id === product.id ? (
                        <div className="flex-1 ml-4">
                          <StockBySizeEditor
                            product={editingProduct}
                            onUpdate={(stockBySize) => handleUpdateField('stockBySize', stockBySize)}
                          />
                        </div>
                      ) : (
                        <StockDisplay product={product} />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Category:</span>
                      {editingProduct?.id === product.id ? (
                        <select
                          value={editingProduct.category}
                          onChange={(e) => handleUpdateField('category', e.target.value as Category)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {Object.values(Category).filter(cat => cat !== Category.ALL).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-500">{product.category}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

