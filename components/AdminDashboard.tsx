import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus, Package, ShoppingBag } from 'lucide-react';
import { Product, Category } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import AddProductModal from './AddProductModal';
import api, { transformProduct, transformProductForBackend } from '../utils/api';

const SHIPROCKET_COD_SETTLEMENT_URL = 'https://app.shiprocket.in/reports/cod-remittance';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress?: string | null;
  total: number;
  status: string;
  paymentMethod?: string | null;
  cashfreeOrderId?: string | null;
  shiprocketOrderId?: string | null;
  createdAt: string;
  items: Array<{
    quantity: number;
    price: number;
    size?: string | null;
    product?: { name: string };
  }>;
}

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
  const [editedProducts, setEditedProducts] = useState<Product[]>(products);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Update local products when props change
  React.useEffect(() => {
    setEditedProducts(products);
  }, [products]);

  // Refresh products from API when dashboard opens
  React.useEffect(() => {
    if (isOpen) {
      const refreshProducts = async () => {
        try {
          const response = await api.get('/api/products?limit=1000');
          let productsArray: any[] = [];
          if (response.data && response.data.products && Array.isArray(response.data.products)) {
            productsArray = response.data.products;
          } else if (Array.isArray(response.data)) {
            productsArray = response.data;
          }
          if (productsArray.length > 0) {
            const transformedProducts = productsArray.map(transformProduct);
            setEditedProducts(transformedProducts);
            onUpdateProducts(transformedProducts);
          }
        } catch (error) {
          console.error('Failed to refresh products:', error);
        }
      };
      refreshProducts();
    }
  }, [isOpen]);

  // Fetch orders when Orders tab is selected
  const [ordersError, setOrdersError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      setOrdersLoading(true);
      setOrdersError(null);
      api.get('/api/orders?limit=100')
        .then((res) => {
          const list = res.data?.orders ?? res.data;
          setOrders(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          console.error('Failed to fetch orders:', err);
          setOrders([]);
          const msg = err.response?.status === 401
            ? 'Please log in again as admin'
            : err.response?.data?.error || err.message || 'Failed to load orders';
          setOrdersError(msg);
        })
        .finally(() => setOrdersLoading(false));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleEdit = (product: Product) => {
    setEditProduct({ ...product });
    setError(null);
    setIsAddProductOpen(true);
  };

  const handleCloseAddOrEdit = () => {
    setIsAddProductOpen(false);
    setEditProduct(null);
  };


  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/api/products/${productId}`);
      
      const updated = editedProducts.filter(p => p.id !== productId);
      setEditedProducts(updated);
      onUpdateProducts(updated);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(err.response?.data?.error || 'Failed to delete product. Please try again.');
      // Still update locally for better UX
      const updated = editedProducts.filter(p => p.id !== productId);
      setEditedProducts(updated);
      onUpdateProducts(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsAddProductOpen(true);
    setError(null);
  };

  const handleSaveProduct = async (product: Product) => {
    setLoading(true);
    setError(null);
    try {
      const productData = transformProductForBackend(product);
      const isEdit = !!editProduct;
      
      if (isEdit) {
        const response = await api.put(`/api/products/${product.id}`, productData);
        const savedProduct = transformProduct(response.data);
        const updated = editedProducts.map(p => p.id === product.id ? savedProduct : p);
        setEditedProducts(updated);
        onUpdateProducts(updated);
      } else {
        const response = await api.post('/api/products', productData);
        const savedProduct = transformProduct(response.data);
        const updated = [...editedProducts, savedProduct];
        setEditedProducts(updated);
        onUpdateProducts(updated);
      }
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.error || 'Failed to save product. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-allocate stock for existing products (5 to first size, 1 each to rest)
  const handleAutoAllocateStock = async (product: Product) => {
    if (!confirm(`Allocate stock for "${product.name}"? (5 to ${product.availableSizes?.[0] || 'S'}, 1 each to others)`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const totalStock = product.stock || 10;
      const availableSizes = product.availableSizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      const stockBySize: { [size: string]: number } = {};
      
      // Allocate 5 to first size (S)
      if (availableSizes.length > 0) {
        stockBySize[availableSizes[0]] = Math.min(5, totalStock);
      }
      
      // Allocate 1 each to remaining sizes
      const allocatedSoFar = Object.values(stockBySize).reduce((sum, s) => sum + s, 0);
      const remaining = totalStock - allocatedSoFar;
      const remainingSizes = availableSizes.slice(1);
      
      remainingSizes.forEach((size, index) => {
        if (remaining > index) {
          stockBySize[size] = 1;
        } else {
          stockBySize[size] = 0;
        }
      });
      
      // Distribute any remaining stock to first size
      const allocatedTotal = Object.values(stockBySize).reduce((sum, s) => sum + s, 0);
      const finalRemaining = totalStock - allocatedTotal;
      if (finalRemaining > 0 && availableSizes.length > 0) {
        stockBySize[availableSizes[0]] = (stockBySize[availableSizes[0]] || 0) + finalRemaining;
      }
      
      const updatedProduct = { ...product, stockBySize };
      const productData = transformProductForBackend(updatedProduct);
      const response = await api.put(`/api/products/${product.id}`, productData);
      
      const savedProduct = transformProduct(response.data);
      const updated = editedProducts.map(p => p.id === product.id ? savedProduct : p);
      setEditedProducts(updated);
      onUpdateProducts(updated);
    } catch (err: any) {
      console.error('Failed to allocate stock:', err);
      setError(err.response?.data?.error || 'Failed to allocate stock. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <div className="flex gap-4 mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 pb-3 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-5 w-5" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 pb-3 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              Orders
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {loading && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">Processing...</p>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Orders Received</h2>
                  <button
                    onClick={() => {
                      setOrdersError(null);
                      setOrdersLoading(true);
                      api.get('/api/orders?limit=100')
                        .then((res) => {
                          const list = res.data?.orders ?? res.data;
                          setOrders(Array.isArray(list) ? list : []);
                        })
                        .catch((err) => {
                          setOrders([]);
                          setOrdersError(err.response?.status === 401 ? 'Please log out and log in again as admin' : err.response?.data?.error || err.message || 'Failed to load');
                        })
                        .finally(() => setOrdersLoading(false));
                    }}
                    className="text-sm px-3 py-1.5 bg-brand-100 text-brand-800 rounded-md hover:bg-brand-200"
                  >
                    Refresh
                  </button>
                </div>
                {ordersError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{ordersError}</p>
                  </div>
                )}
                {ordersLoading ? (
                  <p className="text-gray-500">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">{!ordersError && 'No orders yet.'}</p>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8"></th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orders.map((order) => (
                            <React.Fragment key={order.id}>
                              <tr className="hover:bg-gray-50">
                                <td className="px-2 py-2">
                                  <button
                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                    className="p-1 text-gray-500 hover:text-brand-600"
                                    title={expandedOrderId === order.id ? 'Collapse' : 'View order details'}
                                  >
                                    {expandedOrderId === order.id ? '▼' : '▶'}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{order.customerName}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{order.customerPhone}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{CURRENCY_SYMBOL}{order.total.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                                      order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                      order.status === 'COD_PENDING' ? 'bg-amber-100 text-amber-800' :
                                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {order.status}
                                    </span>
                                    {order.paymentMethod === 'COD' && (
                                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-800">COD</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              {expandedOrderId === order.id && (
                                <tr>
                                  <td colSpan={6} className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                    <div className="space-y-2">
                                      {order.shippingAddress && (
                                        <p className="text-xs text-gray-600"><strong>Shipping:</strong> {order.shippingAddress}</p>
                                      )}
                                      {order.paymentMethod === 'COD' && (
                                        <p className="text-sm">
                                          <a
                                            href={SHIPROCKET_COD_SETTLEMENT_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-brand-600 hover:text-brand-800 font-medium underline"
                                          >
                                            Settle COD in Shiprocket →
                                          </a>
                                          {' '}Manage cash collection and remittance for this order.
                                        </p>
                                      )}
                                      <div className="text-sm">
                                        <strong className="block mb-2">Order items:</strong>
                                        <ul className="space-y-1">
                                          {order.items?.map((item, idx) => (
                                            <li key={idx} className="flex justify-between gap-4">
                                              <span>{item.product?.name || 'Product'}{item.size ? ` (Size: ${item.size})` : ''} × {item.quantity}</span>
                                              <span>{CURRENCY_SYMBOL}{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
              <button
                onClick={handleAddNew}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                Add New Product
              </button>
            </div>

            <AddProductModal
              isOpen={isAddProductOpen}
              onClose={handleCloseAddOrEdit}
              onSave={handleSaveProduct}
              nextId={0}
              initialProduct={editProduct}
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
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}</span>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-col items-end gap-1">
                           <StockDisplay product={product} />
                           {(!product.stockBySize || Object.keys(product.stockBySize).length === 0) && (
                             <button
                               onClick={() => handleAutoAllocateStock(product)}
                               className="text-xs text-brand-600 hover:text-brand-800 underline"
                               title="Auto-allocate: 5 to S, 1 each to others"
                             >
                               Auto-allocate
                             </button>
                           )}
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                      <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="text-xs text-gray-500">ID: {product.id}</div>
                    </div>
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
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Price:</span>
                      <span className="text-sm font-medium text-gray-900">{CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}</span>
                    </div>
                    
                     <div className="flex justify-between items-start">
                       <span className="text-xs text-gray-500">Stock:</span>
                       <div className="flex flex-col items-end gap-1">
                         <StockDisplay product={product} />
                         {(!product.stockBySize || Object.keys(product.stockBySize).length === 0) && (
                           <button
                             onClick={() => handleAutoAllocateStock(product)}
                             className="text-xs text-brand-600 hover:text-brand-800 underline"
                             title="Auto-allocate: 5 to S, 1 each to others"
                           >
                             Auto-allocate
                           </button>
                         )}
                       </div>
                     </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Category:</span>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

