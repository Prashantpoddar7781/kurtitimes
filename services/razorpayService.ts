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

    // For production, you should create an order on your backend first
    // and get the order_id from there. For now, we'll use a client-side approach
    // Get Razorpay Key ID from window variable or environment
    const razorpayKeyId = window.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID'; // Replace with your actual Key ID in index.html
    
    const razorpayOptions = {
      key: razorpayKeyId,
      amount: options.amount, // Amount in paise
      currency: options.currency || 'INR',
      name: 'Kurti Times',
      description: options.description,
      image: '/logo.jpg', // Your logo
      prefill: {
        name: options.name,
        contact: options.phone,
        email: options.email || '',
      },
      theme: {
        color: '#be185d', // Brand color
      },
      handler: function (response: any) {
        // Payment success
        options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id || '');
      },
      modal: {
        ondismiss: function () {
          // User closed the payment modal
          options.onFailure({ code: 'USER_CLOSED', message: 'Payment cancelled by user' });
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error) {
    options.onFailure(error);
  }
};

