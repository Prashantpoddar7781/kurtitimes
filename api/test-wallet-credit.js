// Vercel - Test wallet credit (bypasses Razorpay) to verify backend works
// Remove or disable in production after testing

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const backendUrl = (process.env.BACKEND_URL || process.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app').trim();
  const secret = (process.env.WALLET_WEBHOOK_SECRET || '').trim();
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ error: 'Authorization Bearer token required' });
  }
  if (!secret) {
    return res.status(500).json({ error: 'WALLET_WEBHOOK_SECRET not set in Vercel' });
  }

  try {
    // Verify token and get adminId
    const meRes = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const me = await meRes.json();
    const adminId = me?.id;
    if (!adminId) {
      return res.status(400).json({ error: 'Could not get admin ID' });
    }

    // Call wallet credit (same as webhook does)
    const orderId = `test_${Date.now()}`;
    const amount = 1;
    const creditRes = await fetch(`${backendUrl}/api/admin/wallet/credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-webhook-secret': secret,
      },
      body: JSON.stringify({ orderId, adminId, amount }),
    });

    const text = await creditRes.text();
    if (!creditRes.ok) {
      return res.status(creditRes.status).json({
        error: 'Backend credit failed',
        details: text,
        hint: creditRes.status === 401 ? 'WALLET_WEBHOOK_SECRET in Vercel must match Railway exactly' : undefined,
      });
    }

    return res.status(200).json({ success: true, message: '₹1 credited. Refresh to see balance.' });
  } catch (e) {
    console.error('Test wallet credit error:', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};
