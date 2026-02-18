// Cashfree Payment Service - uses SDK loaded via our proxy (avoids CORS)
// Script is loaded from /api/cashfree-sdk (same-origin)

export interface PaymentOptions {
  amount: number; // Amount in rupees (e.g. 543 for ₹543)
  currency: string;
  name: string;
  phone: string;
  email?: string;
  description: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure: (error: any) => void;
  /** Optional: stored before redirect for Shiprocket on return (client-side backup) */
  checkoutForShiprocket?: Record<string, unknown>;
  /** Optional: shipping + cart for webhook (server-side shipment creation) */
  shippingForWebhook?: {
    name: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    cartItems: Array<{ id: number; name: string; quantity: number; price: number; selectedSize?: string }>;
    subtotal: number;
    total: number;
  };
}

export const loadCashfreeScript = (): Promise<boolean> => {
  return Promise.resolve(typeof (window as any).Cashfree === 'function');
};

export const initiatePayment = async (options: PaymentOptions): Promise<void> => {
  try {
    const orderResponse = await fetch('/api/cashfree-create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: options.amount,
        currency: options.currency || 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customer_name: options.name,
          customer_phone: options.phone,
          customer_email: options.email || 'customer@kurtitimes.com',
        },
        order_meta: {
          return_url: window.location.origin + '/payment-success?order_id={order_id}',
          notify_url: window.location.origin + '/api/cashfree-webhook',
        },
        order_note: options.description,
        shipping_for_webhook: options.shippingForWebhook,
      }),
    });

    if (!orderResponse.ok) {
      let errorMessage = 'Failed to create order';
      try {
        const error = await orderResponse.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = (await orderResponse.text()) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const orderData = await orderResponse.json();

    if (!orderData.payment_session_id) {
      throw new Error('Failed to get payment session ID');
    }

    const CashfreeFn = (window as any).Cashfree;
    if (typeof CashfreeFn !== 'function') {
      throw new Error('Failed to load Cashfree SDK');
    }

    const mode = orderData.mode || (import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox');
    const cashfree = CashfreeFn({ mode });

    // Store checkout data right before redirect (backup - survives cross-origin)
    if (options.checkoutForShiprocket) {
      try {
        localStorage.setItem('checkout_for_shiprocket', JSON.stringify(options.checkoutForShiprocket));
      } catch (_) {}
    }

    cashfree.checkout({
      paymentSessionId: orderData.payment_session_id,
      redirectTarget: '_self', // Redirect in same tab - opens Cashfree hosted page
    }).then((result: any) => {
      if (result && result.payment) {
        const paymentId = result.payment.paymentId || result.payment.payment_id;
        verifyPayment(orderData.order_id, paymentId)
          .then((verified) => {
            if (verified) options.onSuccess(paymentId, orderData.order_id);
            else options.onFailure({ code: 'VERIFICATION_FAILED', message: 'Payment verification failed' });
          })
          .catch((err) => options.onFailure({ code: 'VERIFICATION_ERROR', message: err.message }));
      } else if (result && result.error) {
        options.onFailure({ code: 'PAYMENT_ERROR', message: result.error.message || 'Payment failed' });
      } else {
        options.onFailure({ code: 'PAYMENT_CANCELLED', message: 'Payment cancelled by user' });
      }
    }).catch((err: any) => {
      options.onFailure({ code: 'CHECKOUT_ERROR', message: err.message || 'Failed to open checkout' });
    });

  } catch (error: any) {
    options.onFailure({
      code: 'INITIATION_ERROR',
      message: error.message || 'Failed to initiate payment',
    });
  }
};

const verifyPayment = async (orderId: string, paymentId: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/cashfree-verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, payment_id: paymentId }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
};
