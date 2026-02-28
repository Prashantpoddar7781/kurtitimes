// Vercel Serverless - Create Razorpay order for wallet recharge
// Wallet recharge uses Razorpay (money goes to your Razorpay-linked bank)
// Product payments continue to use Cashfree

const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

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

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountPaise = Math.round(Number(amount) * 100); // ₹200 = 20000 paise
    if (amountPaise < 100) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `wr_${Date.now()}_${adminId.slice(-6)}`,
      notes: {
        type: 'wallet_recharge',
        adminId: String(adminId),
        amount: String(amount),
      },
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      keyId,
    });
  } catch (error) {
    console.error('Razorpay wallet order error:', error);
    const msg = error?.error?.description || error?.message || 'Failed to create order';
    return res.status(500).json({
      error: msg,
      code: error?.statusCode || error?.code,
    });
  }
};
