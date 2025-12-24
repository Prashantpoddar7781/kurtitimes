// Vercel Serverless Function - Cashfree Order Creation with Split Payment
// Split: 1% to developer account, 99% to merchant account

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
    const merchantAccountId = process.env.CASHFREE_MERCHANT_ACCOUNT_ID; // Merchant's Cashfree account ID
    const developerAccountId = process.env.CASHFREE_DEVELOPER_ACCOUNT_ID; // Your Cashfree account ID for 1% commission

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

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount. Minimum ₹1.00 required' });
    }

    // Calculate split amounts (1% commission to developer)
    const totalAmount = amount;
    const commissionAmount = Math.round(totalAmount * 0.01); // 1% commission
    const merchantAmount = totalAmount - commissionAmount; // 99% to merchant

    // Create order with split payment configuration
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderData = {
      order_id: orderId,
      order_amount: totalAmount,
      order_currency: currency,
      customer_details: customer_details || {},
      order_meta: order_meta || {},
      order_note: order_note || 'Order from Kurti Times',
    };

    // Add split payment configuration if both accounts are configured
    if (merchantAccountId && developerAccountId) {
      orderData.order_splits = [
        {
          vendor: merchantAccountId,
          amount: merchantAmount,
          description: 'Merchant payment (99%)'
        },
        {
          vendor: developerAccountId,
          amount: commissionAmount,
          description: 'Developer commission (1%)'
        }
      ];
    }

    // Create payment session with Cashfree
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

    // Return payment session ID and order details
    return res.status(200).json({
      success: true,
      order_id: orderId,
      payment_session_id: data.payment_session_id,
      api_key: appId,
      amount: totalAmount,
      currency: currency,
      split_info: merchantAccountId && developerAccountId ? {
        merchant_amount: merchantAmount,
        commission_amount: commissionAmount,
        merchant_percentage: 99,
        commission_percentage: 1
      } : null
    });

  } catch (error) {
    console.error('Cashfree order creation error:', error);
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
};

