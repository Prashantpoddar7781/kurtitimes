// Cashfree Create Order API with Split Payment
// This function creates a payment order with 99% to merchant and 1% to developer

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      orderId,
      orderAmount,
      customerName,
      customerPhone,
      customerEmail
    } = req.body;

    if (!orderId || !orderAmount || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const CASHFREE_MERCHANT_ACCOUNT_ID = process.env.CASHFREE_MERCHANT_ACCOUNT_ID; // Admin's account
    const CASHFREE_DEVELOPER_ACCOUNT_ID = process.env.CASHFREE_DEVELOPER_ACCOUNT_ID; // Your account (1%)
    const CASHFREE_ENV = process.env.CASHFREE_ENV || 'PRODUCTION'; // PRODUCTION or TEST

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY || !CASHFREE_MERCHANT_ACCOUNT_ID || !CASHFREE_DEVELOPER_ACCOUNT_ID) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Cashfree credentials' 
      });
    }

    const baseUrl = CASHFREE_ENV === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';

    // Calculate split amounts (99% to merchant, 1% to developer)
    const merchantAmount = Math.round(orderAmount * 0.99);
    const developerAmount = orderAmount - merchantAmount; // Remaining 1%

    // Prepare order data with split payment
    const orderData = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerPhone,
        customer_name: customerName,
        customer_email: customerEmail || '',
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'https://kurtitimes.vercel.app'}/payment-success?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL || 'https://kurtitimes.vercel.app'}/api/cashfree-webhook`
      },
      // Split payment configuration
      order_splits: [
        {
          vendor_id: CASHFREE_MERCHANT_ACCOUNT_ID,
          amount: merchantAmount,
          percentage: 99
        },
        {
          vendor_id: CASHFREE_DEVELOPER_ACCOUNT_ID,
          amount: developerAmount,
          percentage: 1
        }
      ]
    };

    // Create order in Cashfree
    const createOrderResponse = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const orderResult = await createOrderResponse.json();

    if (!createOrderResponse.ok) {
      console.error('Cashfree create order error:', orderResult);
      return res.status(createOrderResponse.status).json({ 
        error: 'Failed to create order',
        details: orderResult 
      });
    }

    // Get payment session
    const paymentSessionData = {
      order_id: orderId,
      payment_method: {
        net_banking: {},
        card: {},
        upi: {},
        wallet: {}
      }
    };

    const sessionResponse = await fetch(`${baseUrl}/orders/${orderId}/payment_sessions`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentSessionData),
    });

    const sessionResult = await sessionResponse.json();

    if (!sessionResponse.ok) {
      console.error('Cashfree payment session error:', sessionResult);
      return res.status(sessionResponse.status).json({ 
        error: 'Failed to create payment session',
        details: sessionResult 
      });
    }

    return res.status(200).json({
      success: true,
      orderId: orderResult.order_id,
      paymentSessionId: sessionResult.payment_session_id,
      paymentUrl: sessionResult.payment_url || null,
      orderStatus: orderResult.order_status,
      splitDetails: {
        merchantAmount,
        developerAmount,
        totalAmount: orderAmount
      }
    });
  } catch (error) {
    console.error('Cashfree create order error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

