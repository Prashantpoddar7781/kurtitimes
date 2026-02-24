import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ArrowLeft, MessageCircle, CreditCard, CheckCircle, Truck, Banknote } from 'lucide-react';
import { CartItem } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { initiatePayment } from '../services/cashfreeService';
import { calculateShipping, validatePincode, ShippingAddress } from '../services/shippingService';
import { createShipment } from '../services/shiprocketService';
import api from '../utils/api';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [orderSuccessType, setOrderSuccessType] = useState<'online' | 'cod'>('online');

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
      setIsProcessing(false);
      setShippingCost(0);
      setEstimatedDays(0);
      setPaymentMethod('online');
    }
  }, [isOpen]);

  // Shipping disabled for now - always free
  useEffect(() => {
    setShippingCost(0);
    if (pincode && validatePincode(pincode)) {
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = calculateShipping(pincode, total);
      setEstimatedDays(shipping.estimatedDays);
    } else {
      setEstimatedDays(0);
    }
  }, [pincode, cartItems]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;
  // Cashfree expects amount in rupees (e.g. 543 for ₹543), not paise
  const amountInRupees = Math.round(total * 100) / 100;

  const handleCOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountInRupees < 1) {
      alert('Minimum order amount is ₹1.00');
      return;
    }
    if (!addressLine1 || !city || !state || !pincode) {
      alert('Please fill in all shipping address fields');
      return;
    }
    if (!validatePincode(pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    setIsProcessing(true);
    const shippingAddr = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ${state} - ${pincode}`;
    const orderId = `KT-COD-${Date.now()}`;
    try {
      const shipmentData = {
        order_id: orderId,
        order_date: new Date().toISOString(),
        pickup_location: 'warehouse',
        billing_customer_name: name.split(' ')[0] || name,
        billing_last_name: name.split(' ').slice(1).join(' ') || '',
        billing_address: addressLine1,
        billing_address_2: addressLine2 || '',
        billing_city: city,
        billing_pincode: pincode,
        billing_state: state,
        billing_country: 'India',
        billing_email: email || phone + '@temp.com',
        billing_phone: phone,
        shipping_is_billing: true,
        shipping_customer_name: name.split(' ')[0] || name,
        shipping_last_name: name.split(' ').slice(1).join(' ') || '',
        shipping_address: addressLine1,
        shipping_address_2: addressLine2 || '',
        shipping_city: city,
        shipping_pincode: pincode,
        shipping_state: state,
        shipping_country: 'India',
        shipping_email: email || phone + '@temp.com',
        shipping_phone: phone,
        order_items: cartItems.map((item) => ({
          name: item.name,
          sku: `SKU-${item.id}-${item.selectedSize || 'M'}`,
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: 'COD',
        sub_total: subtotal,
        length: 20,
        breadth: 15,
        height: 5,
        weight: Math.max(0.5, cartItems.length * 0.3),
      };
      const shipment = await createShipment(shipmentData);
      await api.post('/api/orders/confirm', {
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        shippingAddress: shippingAddr,
        total,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.selectedSize || null,
        })),
        paymentMethod: 'COD',
        shiprocketOrderId: String(shipment.order_id || shipment.shipment_id),
        awbCode: shipment.awb_code || null,
      });
      if (email && !email.includes('@temp.com')) {
        const orderDetails = cartItems.map((item) =>
          `• ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''} (x${item.quantity}) - ${CURRENCY_SYMBOL}${(item.price * item.quantity).toLocaleString('en-IN')}`
        ).join('\n');
        fetch(`${window.location.origin}/api/send-order-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            name,
            orderId,
            awbCode: shipment.awb_code || null,
            courierName: shipment.courier_name || null,
            orderDetails,
            total,
            isCOD: true,
          }),
        }).catch(() => {});
      }
      setOrderSuccessType('cod');
      setStep('success');
    } catch (err: any) {
      setIsProcessing(false);
      alert(err?.response?.data?.error || err?.message || 'COD order failed. Please try again.');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amountInRupees < 1) {
      alert('Minimum order amount is ₹1.00');
      return;
    }

    // Validate shipping address
    if (!addressLine1 || !city || !state || !pincode) {
      alert('Please fill in all shipping address fields');
      return;
    }

    if (!validatePincode(pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    setIsProcessing(true);

    const orderItems = cartItems.map(item => 
      `${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''} x${item.quantity}`
    ).join(', ');

    const checkoutData = {
      name,
      phone,
      email: email || '',
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      cartItems: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize,
      })),
      subtotal,
      total,
    };

    try {
      await initiatePayment({
        amount: amountInRupees,
        currency: 'INR',
        name: name,
        phone: phone,
        email: email || undefined,
        description: `Order from Kurti Times - ${orderItems}`,
        checkoutForShiprocket: checkoutData,
        shippingForWebhook: checkoutData,
        onSuccess: async (paymentId, orderId) => {
          setIsProcessing(false);
          
          // Create shipment in Shiprocket
          try {
            const shipmentData = {
              order_id: `KT-${Date.now()}`,
              order_date: new Date().toISOString(),
              pickup_location: 'warehouse', // Pickup location name from Shiprocket
              billing_customer_name: name.split(' ')[0] || name,
              billing_last_name: name.split(' ').slice(1).join(' ') || '',
              billing_address: addressLine1,
              billing_address_2: addressLine2 || '',
              billing_city: city,
              billing_pincode: pincode,
              billing_state: state,
              billing_country: 'India',
              billing_email: email || phone + '@temp.com',
              billing_phone: phone,
              shipping_is_billing: true,
              shipping_customer_name: name.split(' ')[0] || name,
              shipping_last_name: name.split(' ').slice(1).join(' ') || '',
              shipping_address: addressLine1,
              shipping_address_2: addressLine2 || '',
              shipping_city: city,
              shipping_pincode: pincode,
              shipping_state: state,
              shipping_country: 'India',
              shipping_email: email || phone + '@temp.com',
              shipping_phone: phone,
              order_items: cartItems.map((item) => ({
                name: item.name,
                sku: `SKU-${item.id}-${item.selectedSize || 'M'}`,
                units: item.quantity,
                selling_price: item.price,
              })),
              payment_method: 'Prepaid',
              sub_total: subtotal,
              length: 20,
              breadth: 15,
              height: 5,
              weight: Math.max(0.5, cartItems.length * 0.3),
            };

            const shipment = await createShipment(shipmentData);
            
            setOrderSuccessType('online');
            setStep('success');
            
            // Send order confirmation via WhatsApp with shipping address and tracking
            const orderDetails = cartItems.map(item => 
              `• ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''} (x${item.quantity}) - ${CURRENCY_SYMBOL}${item.price * item.quantity}`
            ).join('\n');
            
            const shippingAddress = `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ''}, ${city}, ${state} - ${pincode}`;
            
            let message = `*Order Confirmed - Kurti Times* ✅\n\n*Payment ID:* ${paymentId}\n*Order ID:* ${orderId || 'N/A'}`;
            
            if (shipment.shipment_id) {
              message += `\n*Shipment ID:* ${shipment.shipment_id}\n*AWB Code:* ${shipment.awb_code || 'Pending'}\n*Courier:* ${shipment.courier_name || 'TBD'}`;
            }
            
            message += `\n\n*Customer Details:*\n👤 Name: ${name}\n📱 Phone: ${phone}${email ? `\n📧 Email: ${email}` : ''}\n\n*Shipping Address:*\n📍 ${shippingAddress}\n\n*Order Summary:*\n${orderDetails}\n\n*Subtotal: ${CURRENCY_SYMBOL}${subtotal.toLocaleString('en-IN')}*\n*Shipping: ${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')}*\n*Total Amount Paid: ${CURRENCY_SYMBOL}${total.toLocaleString('en-IN')}*\n\nThank you for your order! We'll process it shortly.`;
            
            setTimeout(() => {
              const whatsappUrl = `https://wa.me/919892794421?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }, 2000);
          } catch (shipError: any) {
            // If Shiprocket fails, still show success but log error
            console.error('Shiprocket error:', shipError);
            setOrderSuccessType('online');
            setStep('success');
            
            // Send order confirmation without shipment details
            const orderDetails = cartItems.map(item => 
              `• ${item.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''} (x${item.quantity}) - ${CURRENCY_SYMBOL}${item.price * item.quantity}`
            ).join('\n');
            
            const shippingAddress = `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ''}, ${city}, ${state} - ${pincode}`;
            
            const message = `*Order Confirmed - Kurti Times* ✅\n\n*Payment ID:* ${paymentId}\n*Order ID:* ${orderId || 'N/A'}\n\n*Customer Details:*\n👤 Name: ${name}\n📱 Phone: ${phone}${email ? `\n📧 Email: ${email}` : ''}\n\n*Shipping Address:*\n📍 ${shippingAddress}\n\n*Order Summary:*\n${orderDetails}\n\n*Subtotal: ${CURRENCY_SYMBOL}${subtotal.toLocaleString('en-IN')}*\n*Shipping: ${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')}*\n*Total Amount Paid: ${CURRENCY_SYMBOL}${total.toLocaleString('en-IN')}*\n\nThank you for your order! We'll process it shortly.`;
            
            setTimeout(() => {
              const whatsappUrl = `https://wa.me/919892794421?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }, 2000);
          }
        },
        onFailure: (error) => {
          setIsProcessing(false);
          // Don't alert for USER_CLOSED or PAYMENT_CANCELLED - with redirect, SDK may falsely report these before navigating
          if (error.code !== 'USER_CLOSED' && error.code !== 'PAYMENT_CANCELLED') {
            alert(`Payment failed: ${error.message || 'Please try again'}`);
          }
        },
      });
    } catch (error: any) {
      setIsProcessing(false);
      alert(`Error initiating payment: ${error.message || 'Please try again'}`);
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
              {(step === 'checkout' || step === 'success') && (
                <button onClick={() => step === 'checkout' ? setStep('cart') : setStep('cart')} className="mr-2 text-brand-900 hover:text-brand-700">
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
            ) : step === 'checkout' ? (
              <form id="checkout-form" onSubmit={(e) => paymentMethod === 'cod' ? handleCOD(e) : handlePayment(e)} className="space-y-6">
                 <div className="bg-brand-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-brand-900 mb-2">Order Summary</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                       <div className="flex justify-between">
                         <span>Items ({cartItems.length})</span>
                         <span>{CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Shipping</span>
                         <span className="text-green-600 font-medium">FREE</span>
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
                     onChange={(e) => setPhone(e.target.value)}
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

                 {/* Payment Method Selection */}
                 <div className="border-t border-gray-200 pt-6 mt-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                   <div className="space-y-3">
                     <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                       <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="text-brand-600" />
                       <CreditCard className="h-5 w-5 text-brand-600" />
                       <div>
                         <span className="font-medium text-gray-900">Online Payment</span>
                         <p className="text-xs text-gray-500">Pay securely via UPI, Card, Net Banking (Cashfree)</p>
                       </div>
                     </label>
                     <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                       <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-brand-600" />
                       <Banknote className="h-5 w-5 text-brand-600" />
                       <div>
                         <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                         <p className="text-xs text-gray-500">Pay when your order is delivered</p>
                       </div>
                     </label>
                   </div>
                 </div>

                 {paymentMethod === 'online' && (
                 <div className="bg-blue-50 p-3 rounded-md flex items-start gap-3">
                   <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                   <p className="text-sm text-blue-800">
                     Secure payment powered by Cashfree. All transactions are encrypted and secure.
                   </p>
                 </div>
                 )}
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-green-50 p-4 rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                  {orderSuccessType === 'cod' ? 'Order Placed!' : 'Payment Successful!'}
                </h3>
                <p className="text-gray-600 mb-4">Thank you for your order.</p>
                <p className="text-sm text-gray-500">
                  {orderSuccessType === 'cod' ? 'Pay the amount when your order is delivered.' : 'Order confirmation has been sent to WhatsApp.'}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                  className="mt-6 px-6 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
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
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                    <p>Subtotal</p>
                    <p className="font-bold text-xl">{CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping calculated at checkout.</p>
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
                  disabled={isProcessing}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-700 hover:bg-brand-800 transition-colors gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <Banknote className="h-5 w-5" />
                      Place Order (COD) {CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pay {CURRENCY_SYMBOL}{total.toLocaleString('en-IN')}
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