import React, { useState } from 'react';
import { Product, Category } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { Edit, Trash2, Plus, X, Save } from 'lucide-react';
import AddProductModal from './AddProductModal';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (id: number, product: Partial<Product>) => void;
  onDeleteProduct: (id: number) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      details: product.details,
      washCare: product.washCare,
      stockBySize: { ...product.stockBySize } || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    });
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateProduct(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const updateStockBySize = (size: string, value: number) => {
    setEditForm(prev => ({
      ...prev,
      stockBySize: {
        ...(prev.stockBySize || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }),
        [size]: value,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 bg-brand-700 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-brand-800 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Close</span>
              <span className="sm:hidden">Close</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-3 sm:p-4">
                {editingId === product.id ? (
                  <div className="space-y-2 sm:space-y-3">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
                      placeholder="Product Name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={editForm.price || ''}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
                        placeholder="Price"
                      />
                      <select
                        value={editForm.category || Category.KURTI_SET}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}
                        className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
                      >
                        {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
                      rows={2}
                      placeholder="Description"
                    />
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Stock by Size</label>
                      <div className="grid grid-cols-5 gap-1 sm:gap-2">
                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                          <div key={size}>
                            <label className="block text-xs text-gray-600 text-center mb-0.5">{size}</label>
                            <input
                              type="number"
                              value={editForm.stockBySize?.[size] || 0}
                              onChange={(e) => updateStockBySize(size, parseInt(e.target.value) || 0)}
                              className="w-full px-1 sm:px-2 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm text-center"
                              min="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded text-sm sm:text-base hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm sm:text-base hover:bg-gray-400"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{product.category}</p>
                    <p className="text-base sm:text-lg font-bold text-brand-700 mt-2">
                      {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
                    </p>
                    {product.stockBySize && (
                      <div className="mt-2 text-xs text-gray-500 break-words">
                        Stock: {Object.entries(product.stockBySize).map(([size, qty]) => `${size}:${qty}`).join(', ')}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <button
                        onClick={() => startEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1 bg-brand-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm hover:bg-brand-700"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products yet. Add your first product!</p>
          </div>
        )}
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddProduct}
      />
    </div>
  );
};

export default AdminDashboard;

