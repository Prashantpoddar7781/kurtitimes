// Vercel Serverless - Create Cashfree order for wallet recharge

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    return res.status(500).json({ error: 'Cashfree not configured' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { amount, adminId } = body;

    if (!amount || amount < 200) {
      return res.status(400).json({ error: 'Minimum recharge amount is ₹200' });
    }
    if (!adminId) {
      return res.status(400).json({ error: 'adminId required' });
    }

    const orderId = `wr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const wrPayload = { adminId, amount: Number(amount) };
    const encoded = Buffer.from(JSON.stringify(wrPayload)).toString('base64');
    const orderTags = {};
    for (let i = 0; i < encoded.length; i += 250) {
      const key = i === 0 ? 'wr' : `wr${Math.floor(i / 250)}`;
      orderTags[key] = encoded.slice(i, i + 250);
    }

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `admin_${adminId}`,
        customer_name: 'Admin',
        customer_phone: '0000000000',
        customer_email: 'admin@kurtitimes.com',
      },
      order_meta: {
        return_url: `${(req.headers.origin || 'https://kurtitimes.vercel.app').replace(/\/$/, '')}/?recharge=success`,
        notify_url: (() => { let u = process.env.SEND_EMAIL_BASE_URL || process.env.FRONTEND_URL || process.env.VERCEL_URL || 'kurtitimes.vercel.app'; u = String(u).replace(/\/$/, ''); if (!u.startsWith('http')) u = 'https://' + u; return `${u}/api/cashfree-webhook`; })(),
      },
      order_note: `Wallet recharge ₹${amount}`,
      order_tags: orderTags,
    };

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
      const err = await response.json();
      return res.status(response.status).json({
        error: err.message || err.error || 'Failed to create order',
        details: err,
      });
    }

    const data = await response.json();
    const isProd = process.env.CASHFREE_ENV === 'production';

    return res.status(200).json({
      success: true,
      order_id: orderId,
      payment_session_id: data.payment_session_id,
      api_key: appId,
      amount,
      mode: isProd ? 'production' : 'sandbox',
    });
  } catch (error) {
    console.error('Wallet order creation error:', error);
    return res.status(500).json({ error: error.message });
  }
};
