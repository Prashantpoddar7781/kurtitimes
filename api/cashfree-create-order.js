// Vercel Serverless Function - Cashfree Order Creation
// 100% to admin/merchant account (no split)

module.exports = async (req, res) => {
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
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return res.status(500).json({
        error: 'Cashfree credentials not configured',
        message: 'Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in Vercel Dashboard'
      });
    }

    // Parse request body
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { amount, currency = 'INR', customer_details, order_meta, order_note } = body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount. Minimum ₹1.00 required' });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Cashfree requires customer_id - ensure it exists
    const custDetails = customer_details || {};
    if (!custDetails.customer_id) {
      custDetails.customer_id = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!custDetails.customer_email) {
      custDetails.customer_email = custDetails.customer_phone ? `${custDetails.customer_phone}@kurtitimes.com` : 'customer@kurtitimes.com';
    }

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: custDetails,
      order_meta: order_meta || {},
      order_note: order_note || 'Order from Kurti Times',
    };

    // Create payment session with Cashfree (100% to merchant)
    const cashfreeUrl = process.env.CASHFREE_ENV === 'production' 
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';

    const response = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: 'Failed to create Cashfree order',
        message: error.message || error.error || 'Unknown error',
        details: error
      });
    }

    const data = await response.json();

    const isProd = process.env.CASHFREE_ENV === 'production';

    return res.status(200).json({
      success: true,
      order_id: orderId,
      payment_session_id: data.payment_session_id,
      api_key: appId,
      amount: amount,
      currency: currency,
      mode: isProd ? 'production' : 'sandbox',
    });

  } catch (error) {
    console.error('Cashfree order creation error:', error);
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
};

