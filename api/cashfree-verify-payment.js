const https = require('https');

module.exports = async (req, res) => {
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
    const { order_id, order_token } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const options = {
      hostname: 'api.cashfree.com',
      path: `/pg/orders/${order_id}`,
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    };

    const verifyRequest = https.request(options, (verifyRes) => {
      let data = '';

      verifyRes.on('data', (chunk) => {
        data += chunk;
      });

      verifyRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (verifyRes.statusCode === 200) {
            const paymentStatus = response.payment_status || 'UNPAID';
            res.status(200).json({
              success: paymentStatus === 'PAID',
              order_status: response.order_status,
              payment_status: paymentStatus,
            });
          } else {
            res.status(verifyRes.statusCode || 500).json({
              success: false,
              error: response.message || 'Payment verification failed',
            });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          res.status(500).json({ success: false, error: 'Invalid response from payment gateway' });
        }
      });
    });

    verifyRequest.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ success: false, error: 'Failed to verify payment' });
    });

    verifyRequest.end();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

