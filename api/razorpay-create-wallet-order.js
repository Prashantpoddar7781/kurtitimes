// Vercel Serverless - Create Razorpay order for wallet recharge
// Uses REST API directly (Basic auth) - no SDK dependency issues

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  // GET: Diagnostic - check if env vars are loaded (no secrets exposed)
  if (req.method === 'GET') {
    return res.status(200).json({
      razorpayConfigured: !!(keyId && keySecret),
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
      keyIdLength: keyId ? keyId.length : 0,
      envCheck: {
        RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
        RAZORPAY_KEYID: !!process.env.RAZORPAY_KEYID,
        RAZORPAY_SECRET: !!process.env.RAZORPAY_SECRET,
      },
      hint: !!(keyId && keySecret)
        ? 'Razorpay is configured. Recharge should work.'
        : 'Use exact names: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET. Add in Vercel → Settings → Environment Variables for Production, then redeploy.',
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
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

    const amountPaise = Math.round(Number(amount) * 100); // ₹200 = 20000 paise
    if (amountPaise < 100) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Use Razorpay REST API directly with Basic auth (avoids SDK auth issues)
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `wr_${Date.now()}_${adminId.slice(-6)}`,
        notes: {
          type: 'wallet_recharge',
          adminId: String(adminId),
          amount: String(amount),
        },
      }),
    });

    let data;
    try {
      data = await resp.json();
    } catch {
      data = {};
    }

    if (!resp.ok) {
      const msg = data?.error?.description || data?.error?.reason || JSON.stringify(data) || 'Razorpay API error';
      console.error('Razorpay API error:', resp.status, data);
      return res.status(500).json({
        error: msg,
        code: data?.error?.code,
        razorpayStatus: resp.status,
        razorpayError: data?.error,
        hint:
          resp.status === 401
            ? 'Keys invalid or revoked. In Razorpay Dashboard: use Live keys (not Test), check domain whitelist (kurtitimes.vercel.app), regenerate keys and paste again with no extra spaces.'
            : resp.status >= 400
              ? 'Check Razorpay Dashboard for account status and API key validity.'
              : undefined,
      });
    }

    return res.status(200).json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency || 'INR',
      keyId,
    });
  } catch (error) {
    console.error('Razorpay wallet order error:', error);
    const msg = error?.message || 'Failed to create order';
    return res.status(500).json({ error: msg });
  }
};
