import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus, Save, XCircle } from 'lucide-react';
import { Product, Category } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, products, onUpdateProducts }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editedProducts, setEditedProducts] = useState<Product[]>(products);

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
    const newProduct: Product = {
      id: Math.max(...editedProducts.map(p => p.id), 0) + 1,
      name: 'New Product',
      price: 0,
      stock: 0,
      category: Category.KURTI_SET,
      image: '/logo.jpg',
      description: 'Product description',
      rating: 0,
      availableSizes: ['S', 'M', 'L', 'XL'],
    };
    setEditingProduct(newProduct);
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

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                          <input
                            type="number"
                            value={editingProduct.stock || 0}
                            onChange={(e) => handleUpdateField('stock', parseInt(e.target.value) || 0)}
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className={`text-sm font-medium ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock || 0}
                          </span>
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
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-brand-600 hover:text-brand-900"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

