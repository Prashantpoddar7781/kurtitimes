import React, { useState, useEffect } from 'react';
import { Package, Truck } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';
import api from '../utils/api';

interface OrderItem {
  quantity: number;
  price: number;
  product?: { name: string };
}

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  cashfreeOrderId?: string | null;
  shiprocketOrderId?: string | null;
  awbCode?: string | null;
  createdAt: string;
  items: OrderItem[];
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = localStorage.getItem('kurtiTimesCurrentUser');
      if (!user) {
        setError('Please sign in to view your orders');
        setLoading(false);
        return;
      }
      try {
        const { mobileNumber } = JSON.parse(user);
        const phone = String(mobileNumber).replace(/\D/g, '').slice(-10);
        if (phone.length !== 10) {
          setError('Invalid phone number');
          setLoading(false);
          return;
        }
        const res = await api.get(`/api/orders/by-phone?phone=${phone}`);
        setOrders(res.data?.orders || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-32 bg-gray-100 rounded" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-brand-50 p-8 rounded-2xl inline-block">
          <Package className="h-16 w-16 text-brand-400 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-bold text-brand-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Your order history will appear here once you place an order.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-950 mb-8">My Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{order.cashfreeOrderId || order.id}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <ul className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.product?.name || 'Item'} × {item.quantity}
                    </span>
                    <span>{CURRENCY_SYMBOL}{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-900">
                    Total: {CURRENCY_SYMBOL}{order.total.toLocaleString('en-IN')}
                  </span>
                  {(order.awbCode || order.shiprocketOrderId) && (
                    <a
                      href={order.awbCode
                        ? `https://shiprocket.in/shipment-tracking?awb=${encodeURIComponent(order.awbCode)}`
                        : 'https://www.shiprocket.in/shipment-tracking'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-700 hover:text-brand-800 text-sm font-medium"
                    >
                      <Truck className="h-4 w-4" /> Track
                    </a>
                  )}
                </div>
                {order.awbCode && (
                  <p className="text-xs text-gray-500">
                    AWB: <span className="font-mono font-medium">{order.awbCode}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
