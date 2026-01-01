const https = require('https');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_amount, customer_name, customer_phone, customer_email } = req.body;

    if (!order_amount || !customer_name || !customer_phone || !customer_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const merchantId = process.env.CASHFREE_MERCHANT_ID;
    const developerId = process.env.CASHFREE_DEVELOPER_ID;

    if (!appId || !secretKey || !merchantId || !developerId) {
      console.error('Missing Cashfree environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Calculate split: 99% to merchant, 1% to developer
    const merchantAmount = Math.round(order_amount * 0.99);
    const developerAmount = order_amount - merchantAmount;

    const orderData = {
      order_amount: order_amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customer_name,
        customer_email: customer_email,
        customer_phone: customer_phone,
      },
      order_meta: {
        return_url: `${req.headers.origin || 'https://kurtitimes.vercel.app'}/payment-success?order_id={order_id}`,
        notify_url: `${req.headers.origin || 'https://kurtitimes.vercel.app'}/api/cashfree-webhook`,
      },
      order_splits: [
        {
          vendor_id: merchantId,
          amount: merchantAmount,
        },
        {
          vendor_id: developerId,
          amount: developerAmount,
        },
      ],
    };

    const postData = JSON.stringify(orderData);

    const options = {
      hostname: 'api.cashfree.com',
      path: '/pg/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    };

    const cashfreeRequest = https.request(options, (cashfreeRes) => {
      let data = '';

      cashfreeRes.on('data', (chunk) => {
        data += chunk;
      });

      cashfreeRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (cashfreeRes.statusCode === 200 && response.payment_session_id) {
            res.status(200).json({
              order_token: response.order_token,
              payment_session_id: response.payment_session_id,
              order_id: response.order_id,
            });
          } else {
            console.error('Cashfree API error:', response);
            res.status(cashfreeRes.statusCode || 500).json({
              error: response.message || 'Failed to create order',
              details: response,
            });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          res.status(500).json({ error: 'Invalid response from payment gateway' });
        }
      });
    });

    cashfreeRequest.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Failed to connect to payment gateway' });
    });

    cashfreeRequest.write(postData);
    cashfreeRequest.end();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

