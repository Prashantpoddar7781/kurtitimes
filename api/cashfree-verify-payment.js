// Vercel Serverless Function - Cashfree Payment Verification

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

    const { order_id, payment_id } = body;

    if (!order_id || !payment_id) {
      return res.status(400).json({ error: 'Order ID and Payment ID are required' });
    }

    // Verify payment with Cashfree
    const cashfreeUrl = process.env.CASHFREE_ENV === 'production'
      ? `https://api.cashfree.com/pg/orders/${order_id}/payments/${payment_id}`
      : `https://sandbox.cashfree.com/pg/orders/${order_id}/payments/${payment_id}`;

    const response = await fetch(cashfreeUrl, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        success: false,
        error: 'Payment verification failed',
        message: error.message || error.error || 'Unknown error'
      });
    }

    const paymentData = await response.json();

    // Check payment status
    if (paymentData.payment_status === 'SUCCESS' || paymentData.payment_status === 'PAID') {
      return res.status(200).json({
        success: true,
        payment_id: payment_id,
        order_id: order_id,
        amount: paymentData.payment_amount,
        status: paymentData.payment_status,
        payment_method: paymentData.payment_method,
        payment_message: paymentData.payment_message
      });
    } else {
      return res.status(200).json({
        success: false,
        error: 'Payment not successful',
        status: paymentData.payment_status,
        message: paymentData.payment_message || 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Cashfree payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
      message: error.message
    });
  }
};

