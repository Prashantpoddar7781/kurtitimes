// Cashfree Payment Service with Split Payment Support
// Supports marketplace model with automatic commission split (1% to developer, 99% to merchant)

declare global {
  interface Window {
    cashfree: any;
  }
}

export interface PaymentOptions {
  amount: number; // Amount in paise (e.g., 1000 = ₹10.00)
  currency: string;
  name: string;
  phone: string;
  email?: string;
  description: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure: (error: any) => void;
}

export const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof (window as any).Cashfree === 'function') {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      resolve(typeof (window as any).Cashfree === 'function');
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (options: PaymentOptions): Promise<void> => {
  try {
    // Create order on backend first (with split payment configuration)
    const orderResponse = await fetch('/api/cashfree-create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
          return_url: window.location.origin + '/payment-success',
          notify_url: window.location.origin + '/api/cashfree-webhook',
        },
        order_note: options.description,
      }),
    });

    if (!orderResponse.ok) {
      let errorMessage = 'Failed to create order';
      try {
        const error = await orderResponse.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        const text = await orderResponse.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const orderData = await orderResponse.json();

    if (!orderData.payment_session_id) {
      throw new Error('Failed to get payment session ID');
    }

    // Load Cashfree script (exposes window.Cashfree - capital C)
    const loaded = await loadCashfreeScript();
    const CashfreeFn = (window as any).Cashfree;
    if (!loaded || typeof CashfreeFn !== 'function') {
      throw new Error('Failed to load Cashfree SDK');
    }

    // Initialize with mode (must match backend: sandbox or production)
    const cashfree = CashfreeFn({
      mode: orderData.mode || (import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox'),
    });

    // Open Cashfree checkout
    cashfree.checkout({
      paymentSessionId: orderData.payment_session_id,
      redirectTarget: '_modal', // Opens in modal popup
    }).then((result: any) => {
      // Check if payment was successful
      if (result && result.payment) {
        // Payment completed - verify on backend
        const paymentId = result.payment.paymentId || result.payment.payment_id;
        verifyPayment(orderData.order_id, paymentId)
          .then((verified) => {
            if (verified) {
              options.onSuccess(paymentId, orderData.order_id);
            } else {
              options.onFailure({
                code: 'VERIFICATION_FAILED',
                message: 'Payment verification failed'
              });
            }
          })
          .catch((error) => {
            options.onFailure({
              code: 'VERIFICATION_ERROR',
              message: error.message || 'Failed to verify payment'
            });
          });
      } else if (result && result.error) {
        // Payment error
        options.onFailure({
          code: 'PAYMENT_ERROR',
          message: result.error.message || 'Payment failed'
        });
      } else {
        // Payment cancelled or closed
        options.onFailure({
          code: 'PAYMENT_CANCELLED',
          message: 'Payment cancelled by user'
        });
      }
    }).catch((error: any) => {
      // Handle checkout initialization errors
      options.onFailure({
        code: 'CHECKOUT_ERROR',
        message: error.message || 'Failed to open payment checkout'
      });
    });

  } catch (error: any) {
    options.onFailure({
      code: 'INITIATION_ERROR',
      message: error.message || 'Failed to initiate payment'
    });
  }
};

const verifyPayment = async (orderId: string, paymentId: string): Promise<boolean> => {
  try {
    const verifyResponse = await fetch('/api/cashfree-verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        payment_id: paymentId,
      }),
    });

    const verifyData = await verifyResponse.json();
    return verifyData.success === true;
  } catch (error) {
    return false;
  }
};

