// Cashfree Verify Payment API
// This function verifies a payment status

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
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const CASHFREE_ENV = process.env.CASHFREE_ENV || 'PRODUCTION';

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Cashfree credentials' 
      });
    }

    const baseUrl = CASHFREE_ENV === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';

    // Get order details
    const orderResponse = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return res.status(orderResponse.status).json({ 
        error: 'Failed to verify payment',
        details: orderData 
      });
    }

    // Get payment details
    const paymentResponse = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
    });

    const paymentData = await paymentResponse.json();

    return res.status(200).json({
      success: true,
      orderStatus: orderData.order_status,
      paymentStatus: paymentData[0]?.payment_status || 'PENDING',
      orderAmount: orderData.order_amount,
      paymentAmount: paymentData[0]?.payment_amount || 0,
      paymentMethod: paymentData[0]?.payment_method || null,
      paymentTime: paymentData[0]?.payment_time || null,
      orderData: orderData,
      paymentData: paymentData
    });
  } catch (error) {
    console.error('Cashfree verify payment error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

