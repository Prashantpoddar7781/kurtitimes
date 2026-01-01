export interface CashfreeOrderResponse {
  order_token: string;
  payment_session_id: string;
  order_id: string;
}

export interface CreateOrderRequest {
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url: string;
  };
  order_splits?: Array<{
    vendor_id: string;
    amount: number;
  }>;
}

export const createCashfreeOrder = async (
  amount: number,
  customerName: string,
  customerPhone: string,
  customerEmail: string
): Promise<CashfreeOrderResponse> => {
  const response = await fetch('/api/cashfree-create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_amount: amount,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create order: ${error}`);
  }

  return response.json();
};

export const verifyPayment = async (orderId: string, orderToken: string): Promise<boolean> => {
  const response = await fetch('/api/cashfree-verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: orderId,
      order_token: orderToken,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.success === true;
};

