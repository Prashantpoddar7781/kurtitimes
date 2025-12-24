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
    if (window.cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(true);
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
          customer_name: options.name,
          customer_phone: options.phone,
          customer_email: options.email || '',
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

    // Load Cashfree script
    const loaded = await loadCashfreeScript();
    if (!loaded) {
      throw new Error('Failed to load Cashfree SDK');
    }

    // Initialize Cashfree Checkout
    const cashfree = window.cashfree;
    
    // Get API key from backend response or use default
    const apiKey = orderData.api_key || '';

    cashfree.checkout({
      paymentSessionId: orderData.payment_session_id,
      redirectTarget: '_modal', // Opens in modal
    }).then((result: any) => {
      if (result.error) {
        options.onFailure({
          code: 'PAYMENT_ERROR',
          message: result.error.message || 'Payment failed'
        });
      } else {
        // Payment successful - verify on backend
        verifyPayment(orderData.order_id, result.payment_id || result.orderId)
          .then((verified) => {
            if (verified) {
              options.onSuccess(result.payment_id || result.orderId, orderData.order_id);
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
      }
    }).catch((error: any) => {
      options.onFailure({
        code: 'PAYMENT_CANCELLED',
        message: error.message || 'Payment cancelled by user'
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

