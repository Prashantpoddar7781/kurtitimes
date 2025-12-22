import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ArrowLeft, MessageCircle } from 'lucide-react';
import { CartItem } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setName('');
      setPhone('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderItems = cartItems.map(item => 
      `• ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''} (x${item.quantity}) - ${CURRENCY_SYMBOL}${item.price * item.quantity}`
    ).join('\n');
    
    const message = `*New Order Request - Kurti Times* 🛍️\n\n*Customer Details:*\n👤 Name: ${name}\n📱 Phone: ${phone}\n\n*Order Summary:*\n${orderItems}\n\n*Total Amount: ${CURRENCY_SYMBOL}${total.toLocaleString('en-IN')}*\n\nPlease confirm availability and payment details.`;
    
    const whatsappUrl = `https://wa.me/919892794421?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 bg-brand-50 border-b border-brand-100">
            <div className="flex items-center gap-2">
              {step === 'checkout' && (
                <button onClick={() => setStep('cart')} className="mr-2 text-brand-900 hover:text-brand-700">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-lg font-serif font-bold text-brand-900">
                {step === 'cart' ? 'Your Shopping Bag' : 'Checkout Details'}
              </h2>
            </div>
            <button onClick={onClose} className="text-brand-900 hover:text-brand-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {step === 'cart' ? (
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
                              <h3 className="font-serif"><a href="#">{item.name}</a></h3>
                              <p className="ml-4">{CURRENCY_SYMBOL}{item.price * item.quantity}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                            {item.selectedSize && (
                              <p className="mt-1 text-xs text-gray-600">Size: {item.selectedSize}</p>
                            )}
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
            ) : (
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                 <div className="bg-brand-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-brand-900 mb-2">Order Summary</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                       <div className="flex justify-between">
                         <span>Items ({cartItems.length})</span>
                         <span>{CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between font-bold text-brand-800 pt-2 border-t border-brand-200 mt-2">
                         <span>Total to Pay</span>
                         <span>{CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}</span>
                       </div>
                    </div>
                 </div>

                 <div>
                   <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                   <input 
                     type="text" 
                     id="name" 
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                     placeholder="Enter your name"
                   />
                 </div>

                 <div>
                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                   <input 
                     type="tel" 
                     id="phone" 
                     required
                     value={phone}
                     onChange={(e) => setPhone(e.target.value)}
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                     placeholder="Enter 10-digit mobile number"
                   />
                 </div>

                 <div className="bg-green-50 p-3 rounded-md flex items-start gap-3">
                   <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                   <p className="text-sm text-green-800">
                     Your order details will be sent directly to our WhatsApp number (+91 9892794421) for processing.
                   </p>
                 </div>
              </form>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
              {step === 'cart' ? (
                <>
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                    <p>Subtotal</p>
                    <p className="font-bold text-xl">{CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-700 hover:bg-brand-800 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#25D366] hover:bg-[#128C7E] transition-colors gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Place Order via WhatsApp
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;