// Vercel - Manually credit wallet from Razorpay order ID (when webhook fails)
// Admin must be logged in. Fetches order from Razorpay, verifies wallet_recharge, credits via backend.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ error: 'Authorization Bearer token required' });
  }

  const backendUrl = (process.env.BACKEND_URL || process.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app').trim();
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const secret = (process.env.WALLET_WEBHOOK_SECRET || '').trim();

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay keys not configured' });
  }
  if (!secret) {
    return res.status(500).json({ error: 'WALLET_WEBHOOK_SECRET not set' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    const orderId = body?.orderId?.trim();
    if (!orderId) {
      return res.status(400).json({ error: 'orderId required (Razorpay order ID, e.g. order_xxx)' });
    }

    // Verify admin token
    const meRes = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch order from Razorpay
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      return res.status(orderRes.status).json({
        error: err?.error?.description || 'Order not found or invalid',
        hint: 'Check the order ID from Razorpay dashboard or payment email.',
      });
    }
    const order = await orderRes.json();
    const notes = order.notes || {};

    if (notes.type !== 'wallet_recharge' || !notes.adminId || !notes.amount) {
      return res.status(400).json({
        error: 'Not a wallet recharge order',
        hint: 'This order was not created for wallet recharge.',
      });
    }

    const adminId = notes.adminId;
    const amount = parseFloat(notes.amount) || 0;

    // Credit via backend (same as webhook)
    const creditRes = await fetch(`${backendUrl}/api/admin/wallet/credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-webhook-secret': secret,
      },
      body: JSON.stringify({ orderId, adminId, amount }),
    });

    if (!creditRes.ok) {
      const errText = await creditRes.text();
      return res.status(creditRes.status).json({
        error: 'Backend credit failed',
        details: errText,
      });
    }

    const data = await creditRes.json().catch(() => ({}));
    return res.status(200).json({
      success: true,
      message: `₹${amount} credited to wallet. Refresh to see balance.`,
    });
  } catch (e) {
    console.error('Razorpay credit order error:', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};
