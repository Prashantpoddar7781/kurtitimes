import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ArrowLeft, MessageCircle, Truck, CreditCard, Loader2 } from 'lucide-react';
import { CartItem } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { initiatePayment, openCashfreeCheckout, verifyPayment } from '../services/cashfreeService';
import { getShippingRates, createShipment, ShippingAddress } from '../services/shiprocketService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setName('');
      setPhone('');
      setEmail('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPincode('');
      setShippingCost(0);
      setEstimatedDays(0);
      setOrderId(null);
    }
  }, [isOpen]);

  // Calculate shipping when pincode changes
  useEffect(() => {
    const calculateShipping = async () => {
      if (pincode && pincode.length === 6) {
        setIsLoadingShipping(true);
        try {
          const weight = cartItems.length * 0.5; // 0.5kg per item
          const rates = await getShippingRates(pincode, weight);
          setShippingCost(rates.available ? rates.cost : 0);
          setEstimatedDays(rates.estimatedDays);
        } catch (error) {
          console.error('Error calculating shipping:', error);
          setShippingCost(0);
          setEstimatedDays(0);
        } finally {
          setIsLoadingShipping(false);
        }
      } else {
        setShippingCost(0);
        setEstimatedDays(0);
      }
    };

    const timeoutId = setTimeout(calculateShipping, 500);
    return () => clearTimeout(timeoutId);
  }, [pincode, cartItems.length]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  const validatePincode = (pin: string) => {
    return /^\d{6}$/.test(pin);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      alert('Please fill in all required fields');
      return;
    }

    if (!validatePincode(pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Generate unique order ID
      const generatedOrderId = `KT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setOrderId(generatedOrderId);

      // Create payment order
      const paymentResponse = await initiatePayment({
        orderId: generatedOrderId,
        orderAmount: total,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
      });

      if (!paymentResponse.success || !paymentResponse.paymentSessionId) {
        throw new Error(paymentResponse.error || 'Failed to create payment order');
      }

      // Open Cashfree checkout
      await openCashfreeCheckout(
        paymentResponse.paymentSessionId,
        async (orderId) => {
          // Payment successful
          try {
            // Verify payment
            const verification = await verifyPayment(orderId);
            
            if (verification.success && verification.paymentStatus === 'SUCCESS') {
              // Create shipment in Shiprocket
              const shippingAddress: ShippingAddress = {
                addressLine1,
                addressLine2: addressLine2 || undefined,
                city,
                state,
                pincode,
              };

              const orderItems = cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              }));

              const shipmentResponse = await createShipment(
                orderId,
                name,
                phone,
                email || '',
                shippingAddress,
                orderItems,
                'Prepaid',
                total
              );

              // Send WhatsApp notification
              const orderItemsText = cartItems.map(item => 
                `• ${item.name} (Size: ${item.selectedSize || 'N/A'}) x${item.quantity} - ${CURRENCY_SYMBOL}${item.price * item.quantity}`
              ).join('\n');

              const message = `*✅ Order Confirmed - Kurti Times* 🛍️\n\n*Order ID:* ${orderId}\n\n*Customer Details:*\n👤 Name: ${name}\n📱 Phone: ${phone}\n${email ? `📧 Email: ${email}\n` : ''}\n*Shipping Address:*\n${addressLine1}${addressLine2 ? `\n${addressLine2}` : ''}\n${city}, ${state} - ${pincode}\n\n*Order Summary:*\n${orderItemsText}\n\n*Subtotal:* ${CURRENCY_SYMBOL}${subtotal.toLocaleString('en-IN')}\n*Shipping:* ${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')}\n*Total:* ${CURRENCY_SYMBOL}${total.toLocaleString('en-IN')}\n\n*Payment Status:* ✅ Paid\n${shipmentResponse.success && shipmentResponse.shipmentId ? `*Shipment ID:* ${shipmentResponse.shipmentId}\n*AWB Code:* ${shipmentResponse.awbCode || 'Pending'}` : ''}\n\n*Estimated Delivery:* ${estimatedDays} days`;

              const whatsappUrl = `https://wa.me/919892794421?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');

              setStep('success');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Error processing order:', error);
            alert('Payment successful but order processing failed. Please contact support with Order ID: ' + orderId);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        (error) => {
          // Payment failed
          setIsProcessingPayment(false);
          alert('Payment failed: ' + error);
        }
      );
    } catch (error) {
      setIsProcessingPayment(false);
      console.error('Payment error:', error);
      alert('Payment failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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
                {step === 'cart' ? 'Your Shopping Bag' : step === 'checkout' ? 'Checkout Details' : 'Order Confirmed'}
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
            ) : step === 'checkout' ? (
              <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
                 <div className="bg-brand-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-brand-900 mb-2">Order Summary</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                       <div className="flex justify-between">
                         <span>Items ({cartItems.length})</span>
                         <span>{CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Shipping</span>
                         <span>
                           {isLoadingShipping ? (
                             <Loader2 className="h-4 w-4 animate-spin inline" />
                           ) : pincode && validatePincode(pincode) ? (
                             shippingCost === 0 ? (
                               <span className="text-green-600 font-medium">FREE</span>
                             ) : (
                               `${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')}`
                             )
                           ) : (
                             <span className="text-gray-400">Enter pincode</span>
                           )}
                         </span>
                       </div>
                       {pincode && validatePincode(pincode) && estimatedDays > 0 && (
                         <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                           <Truck className="h-3 w-3" />
                           <span>Estimated delivery: {estimatedDays} days</span>
                         </div>
                       )}
                       <div className="flex justify-between font-bold text-brand-800 pt-2 border-t border-brand-200 mt-2">
                         <span>Total to Pay</span>
                         <span>{CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}</span>
                       </div>
                    </div>
                 </div>

                 <div>
                   <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
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
                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                   <input 
                     type="tel" 
                     id="phone" 
                     required
                     value={phone}
                     onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                     pattern="[0-9]{10}"
                     maxLength={10}
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                     placeholder="Enter 10-digit mobile number"
                   />
                 </div>

                 <div>
                   <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
                   <input 
                     type="email" 
                     id="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                     placeholder="Enter your email"
                   />
                 </div>

                 {/* Shipping Address Section */}
                 <div className="border-t border-gray-200 pt-6 mt-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                     <Truck className="h-5 w-5 text-brand-700" />
                     Shipping Address
                   </h3>
                   
                   <div className="space-y-4">
                     <div>
                       <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
                       <input 
                         type="text" 
                         id="addressLine1" 
                         required
                         value={addressLine1}
                         onChange={(e) => setAddressLine1(e.target.value)}
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                         placeholder="House/Flat No., Building Name"
                       />
                     </div>

                     <div>
                       <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                       <input 
                         type="text" 
                         id="addressLine2" 
                         value={addressLine2}
                         onChange={(e) => setAddressLine2(e.target.value)}
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                         placeholder="Street, Area, Landmark"
                       />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label htmlFor="city" className="block text-sm font-medium text-gray-700">City *</label>
                         <input 
                           type="text" 
                           id="city" 
                           required
                           value={city}
                           onChange={(e) => setCity(e.target.value)}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                           placeholder="City"
                         />
                       </div>

                       <div>
                         <label htmlFor="state" className="block text-sm font-medium text-gray-700">State *</label>
                         <input 
                           type="text" 
                           id="state" 
                           required
                           value={state}
                           onChange={(e) => setState(e.target.value)}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                           placeholder="State"
                         />
                       </div>
                     </div>

                     <div>
                       <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode *</label>
                       <input 
                         type="text" 
                         id="pincode" 
                         required
                         value={pincode}
                         onChange={(e) => {
                           const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                           setPincode(value);
                         }}
                         pattern="[0-9]{6}"
                         maxLength={6}
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                         placeholder="6-digit pincode"
                       />
                       {pincode && !validatePincode(pincode) && (
                         <p className="mt-1 text-xs text-red-600">Please enter a valid 6-digit pincode</p>
                       )}
                     </div>
                   </div>
                 </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-green-50 p-4 rounded-full mb-4">
                  <CreditCard className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-600 mb-4">Your payment was successful.</p>
                {orderId && (
                  <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
                )}
                <p className="text-sm text-gray-600 mb-6">
                  Your order details have been sent to our WhatsApp. We'll process your order shortly.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setStep('cart');
                  }}
                  className="px-6 py-3 bg-brand-700 text-white rounded-md hover:bg-brand-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
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
              ) : step === 'checkout' ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessingPayment || isLoadingShipping}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-700 hover:bg-brand-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;