// Razorpay Payment Service
// Note: For production, you'll need a backend API to securely create orders
// This is a client-side implementation for demonstration

declare global {
  interface Window {
    Razorpay: any;
    RAZORPAY_KEY_ID?: string;
  }
}

export interface PaymentOptions {
  amount: number; // Amount in paise (e.g., 1000 = ₹10.00)
  currency: string;
  name: string;
  phone: string;
  email?: string;
  description: string;
  orderId?: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure: (error: any) => void;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (options: PaymentOptions): Promise<void> => {
  try {
    // Load Razorpay script if not already loaded
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not available');
    }

    // Get Razorpay Key ID from window variable
    const razorpayKeyId = window.RAZORPAY_KEY_ID || 'rzp_test_Rv4c4iUwni06DQ';
    
    // Create order on backend first
    const orderResponse = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: options.description,
          customer_name: options.name,
          customer_phone: options.phone,
          customer_email: options.email || '',
        },
      }),
    });

    if (!orderResponse.ok) {
      let errorMessage = 'Failed to create order';
      try {
        const error = await orderResponse.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        // If response is not JSON, get text
        const text = await orderResponse.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const orderData = await orderResponse.json();

    // Initialize Razorpay with order details
    const razorpayOptions = {
      key: razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'Kurti Times',
      description: options.description,
      image: '/logo.jpg',
      prefill: {
        name: options.name,
        contact: options.phone,
        email: options.email || '',
      },
      theme: {
        color: '#be185d',
      },
      handler: async function (response: any) {
        // Verify payment on backend
        try {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Payment verified successfully
            options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          } else {
            // Payment verification failed
            options.onFailure({ 
              code: 'VERIFICATION_FAILED', 
              message: verifyData.error || 'Payment verification failed' 
            });
          }
        } catch (verifyError: any) {
          options.onFailure({ 
            code: 'VERIFICATION_ERROR', 
            message: verifyError.message || 'Failed to verify payment' 
          });
        }
      },
      modal: {
        ondismiss: function () {
          options.onFailure({ code: 'USER_CLOSED', message: 'Payment cancelled by user' });
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error: any) {
    options.onFailure(error);
  }
};

