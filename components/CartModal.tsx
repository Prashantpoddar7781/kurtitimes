import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ArrowLeft, Loader2, MapPin, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { createCashfreeOrder, verifyPayment } from '../services/cashfreeService';
import { getShippingRates, createShipment, generateLabel, requestPickup } from '../services/shiprocketService';
import type { ShippingAddress } from '../services/shiprocketService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
}

type Step = 'cart' | 'shipping' | 'payment' | 'processing' | 'success';

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const [step, setStep] = useState<Step>('cart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Customer details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Shipping details
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Payment
  const [orderId, setOrderId] = useState('');
  const [orderToken, setOrderToken] = useState('');
  const [paymentSessionId, setPaymentSessionId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setName('');
      setPhone('');
      setEmail('');
      setShippingAddress({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      });
      setShippingRates([]);
      setSelectedCourier(null);
      setShippingCost(0);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch shipping rates
      const rates = await getShippingRates(shippingAddress.pincode, 0.5);
      setShippingRates(rates);
      
      if (rates.length > 0) {
        // Auto-select cheapest option
        const cheapest = rates.reduce((min, rate) => rate.rate < min.rate ? rate : min);
        setSelectedCourier(cheapest);
        setShippingCost(cheapest.rate);
        setStep('payment');
      } else {
        setError('No shipping options available for this pincode');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shipping rates');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedCourier) {
      setError('Please select a shipping option');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Cashfree order
      const orderResponse = await createCashfreeOrder(
        total,
        name,
        phone,
        email || `${phone}@kurtitimes.com`
      );

      if (!orderResponse || !orderResponse.payment_session_id) {
        throw new Error('Invalid response from payment gateway');
      }

      setOrderId(orderResponse.order_id);
      setOrderToken(orderResponse.order_token);
      setPaymentSessionId(orderResponse.payment_session_id);

      // Load Cashfree Checkout
      try {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onerror = () => {
          setError('Failed to load payment gateway. Please refresh and try again.');
          setLoading(false);
          setStep('payment');
        };
        script.onload = () => {
          try {
            if (window.Cashfree && orderResponse.payment_session_id) {
              const cashfree = new window.Cashfree();
              cashfree.checkout({
                paymentSessionId: orderResponse.payment_session_id,
                redirectTarget: '_self',
              });
              setStep('processing');
            } else {
              throw new Error('Payment gateway not initialized');
            }
          } catch (checkoutErr: any) {
            console.error('Checkout error:', checkoutErr);
            setError(checkoutErr.message || 'Failed to initialize payment. Please try again.');
            setLoading(false);
            setStep('payment');
          }
        };
        document.body.appendChild(script);
      } catch (scriptErr: any) {
        console.error('Script loading error:', scriptErr);
        setError('Failed to load payment gateway. Please refresh and try again.');
        setLoading(false);
        setStep('payment');
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
      setStep('payment');
    }
  };

  // Check payment status after redirect
  useEffect(() => {
    if (step === 'processing' && orderId && orderToken) {
      const checkPayment = async () => {
        try {
          const verified = await verifyPayment(orderId, orderToken);
          if (verified) {
            // Create shipment
            try {
              await handleShipmentCreation();
            } catch (shipErr) {
              console.error('Shipment creation error:', shipErr);
            }
            setStep('success');
          } else {
            setError('Payment verification failed. Please contact support.');
            setStep('cart');
            setLoading(false);
          }
        } catch (err) {
          console.error('Payment verification failed:', err);
          setError('Payment verification failed. Please contact support.');
          setStep('cart');
          setLoading(false);
        }
      };
      
      const timer = setTimeout(checkPayment, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, orderId, orderToken]);

  const handleShipmentCreation = async () => {
    try {
      const items = cartItems.map((item) => ({
        name: item.name,
        sku: `SKU-${item.id}`,
        units: item.quantity,
        selling_price: item.price,
      }));

      const shipment = await createShipment(
        orderId,
        items,
        {
          ...shippingAddress,
          name: name,
          phone: phone,
          email: email || `${phone}@kurtitimes.com`,
        },
        'prepaid'
      );

      // Generate label and request pickup (non-blocking)
      if (shipment.shipment_id) {
        // Don't await these - they're non-critical
        generateLabel(shipment.shipment_id).catch(err => {
          console.error('Label generation error:', err);
        });
        requestPickup(shipment.shipment_id).catch(err => {
          console.error('Pickup request error:', err);
        });
      }
    } catch (err) {
      console.error('Shipment creation error:', err);
      // Don't throw - allow success page to show even if shipment fails
      // Admin can create shipment manually if needed
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 bg-brand-50 border-b border-brand-100">
            <div className="flex items-center gap-2">
              {step !== 'cart' && (
                <button onClick={() => {
                  if (step === 'shipping') setStep('cart');
                  else if (step === 'payment') setStep('shipping');
                }} className="mr-2 text-brand-900 hover:text-brand-700">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-lg font-serif font-bold text-brand-900">
                {step === 'cart' && 'Your Shopping Bag'}
                {step === 'shipping' && 'Shipping Details'}
                {step === 'payment' && 'Payment'}
                {step === 'processing' && 'Processing...'}
                {step === 'success' && 'Order Placed!'}
              </h2>
            </div>
            <button onClick={onClose} className="text-brand-900 hover:text-brand-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {step === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-brand-50 p-4 rounded-full mb-4">
                      <X className="h-8 w-8 text-brand-300" />
                    </div>
                    <p className="text-gray-500 text-lg">Your bag is empty.</p>
                    <p className="text-sm text-gray-400 mt-2">Time to add some style!</p>
                    <button onClick={onClose} className="mt-6 text-brand-600 font-medium hover:underline">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-32 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3 className="font-serif">{item.name}</h3>
                              <p className="ml-4">{CURRENCY_SYMBOL}{item.price * item.quantity}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center border rounded-md">
                              <button 
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-2 font-medium text-gray-900">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="p-1 hover:bg-gray-100 text-gray-600"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setShippingAddress(prev => ({ ...prev, name: e.target.value }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                      setShippingAddress(prev => ({ ...prev, phone: val }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={shippingAddress.address_line1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.address_line2}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setShippingAddress(prev => ({ ...prev, pincode: val }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-700 text-white py-3 rounded-md hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{CURRENCY_SYMBOL}{shippingCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {shippingRates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Option</label>
                    <div className="space-y-2">
                      {shippingRates.map((rate) => (
                        <button
                          key={rate.courier_id}
                          onClick={() => {
                            setSelectedCourier(rate);
                            setShippingCost(rate.rate);
                          }}
                          className={`w-full text-left p-3 border rounded-md ${
                            selectedCourier?.courier_id === rate.courier_id
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{rate.courier_name}</p>
                              <p className="text-xs text-gray-500">{rate.estimated_delivery_days} days</p>
                            </div>
                            <p className="font-bold">{CURRENCY_SYMBOL}{rate.rate}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || !selectedCourier}
                  className="w-full bg-brand-700 text-white py-3 rounded-md hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Pay {CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}
                </button>
              </div>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="h-12 w-12 animate-spin text-brand-600 mb-4" />
                <p className="text-gray-600">Processing your payment...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Truck className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
                <p className="text-gray-600 mb-4">Your order has been confirmed and will be shipped soon.</p>
                <p className="text-sm text-gray-500">Order ID: {orderId}</p>
                <button
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                  className="mt-6 bg-brand-700 text-white px-6 py-2 rounded-md hover:bg-brand-800"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {step === 'cart' && cartItems.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p className="font-bold text-xl">{CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping calculated at checkout.</p>
              <button
                onClick={() => {
                  if (!name || !phone) {
                    setStep('shipping');
                  } else {
                    handleShippingSubmit(new Event('submit') as any);
                  }
                }}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-700 hover:bg-brand-800 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for Cashfree
declare global {
  interface Window {
    Cashfree: any;
  }
}

export default CartModal;
