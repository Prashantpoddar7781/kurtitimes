// Cashfree Payment Service - uses hosted redirect (no SDK required)
// Bypasses all SDK loading issues (CSP, ad-blockers, network failures)

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
  return Promise.resolve(true);
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
        errorMessage = (await orderResponse.text()) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const orderData = await orderResponse.json();

    if (!orderData.payment_session_id) {
      throw new Error('Failed to get payment session ID');
    }

    // Redirect to Cashfree hosted checkout - no SDK required, avoids all loading issues
    const paymentUrl = orderData.payment_url;
    if (paymentUrl) {
      // Persist order_id for return handling (payment-success page reads it)
      sessionStorage.setItem('cashfree_order_id', orderData.order_id);
      window.location.href = paymentUrl;
      return;
    }

    throw new Error('Payment URL not available');
  } catch (error: any) {
    options.onFailure({
      code: 'INITIATION_ERROR',
      message: error.message || 'Failed to initiate payment',
    });
  }
};
