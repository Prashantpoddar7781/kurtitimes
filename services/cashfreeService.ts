// Cashfree Service for Frontend
// Handles payment initiation and verification

export interface CreateOrderRequest {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  paymentSessionId?: string;
  paymentUrl?: string;
  orderStatus?: string;
  splitDetails?: {
    merchantAmount: number;
    developerAmount: number;
    totalAmount: number;
  };
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  orderStatus?: string;
  paymentStatus?: string;
  orderAmount?: number;
  paymentAmount?: number;
  paymentMethod?: string;
  paymentTime?: string;
  error?: string;
}

// Initialize Cashfree payment
export const initiatePayment = async (
  request: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch('/api/cashfree-create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment order');
    }

    return {
      success: true,
      orderId: data.orderId,
      paymentSessionId: data.paymentSessionId,
      paymentUrl: data.paymentUrl,
      orderStatus: data.orderStatus,
      splitDetails: data.splitDetails,
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate payment',
    };
  }
};

// Verify payment status
export const verifyPayment = async (orderId: string): Promise<VerifyPaymentResponse> => {
  try {
    const response = await fetch('/api/cashfree-verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify payment');
    }

    return {
      success: true,
      orderStatus: data.orderStatus,
      paymentStatus: data.paymentStatus,
      orderAmount: data.orderAmount,
      paymentAmount: data.paymentAmount,
      paymentMethod: data.paymentMethod,
      paymentTime: data.paymentTime,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify payment',
    };
  }
};

// Load Cashfree Checkout SDK
export const loadCashfreeSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.head.appendChild(script);
  });
};

// Open Cashfree checkout
export const openCashfreeCheckout = async (
  paymentSessionId: string,
  onSuccess: (orderId: string) => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    await loadCashfreeSDK();

    if (!window.Cashfree) {
      throw new Error('Cashfree SDK not loaded');
    }

    const cashfree = new window.Cashfree({
      mode: process.env.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox',
    });

    cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_self',
    }).then((result: any) => {
      if (result.error) {
        onFailure(result.error.message || 'Payment failed');
      } else {
        onSuccess(result.orderId || '');
      }
    });
  } catch (error) {
    console.error('Error opening Cashfree checkout:', error);
    onFailure(error instanceof Error ? error.message : 'Failed to open payment gateway');
  }
};

// Extend Window interface for Cashfree
declare global {
  interface Window {
    Cashfree?: any;
  }
}

