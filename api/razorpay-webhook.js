// Vercel Serverless - Razorpay webhook for wallet recharge
// Configure in Razorpay Dashboard: Webhooks → Add URL → Select "payment.captured"
// Set RAZORPAY_WEBHOOK_SECRET (from webhook setup) in Vercel

const crypto = require('crypto');


async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // GET: Diagnostic - verify env vars (no secrets)
  if (req.method === 'GET') {
    const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app';
    return res.status(200).json({
      webhookConfigured: true,
      hasRazorpayWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
      hasWalletWebhookSecret: !!process.env.WALLET_WEBHOOK_SECRET,
      hasRazorpayKeys: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      backendUrl,
      hint: 'Razorpay sends POST here. If wallet not crediting: 1) Check Razorpay Dashboard → Webhooks → click your webhook → look for delivery logs 2) Ensure payment.captured event is selected 3) WALLET_WEBHOOK_SECRET must match Railway exactly',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (e) {
    rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  }
  if (!rawBody || rawBody === '') {
    rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  if (expectedSignature !== signature) {
    console.error('Razorpay webhook signature mismatch');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const body = JSON.parse(rawBody);
    if (body.event !== 'payment.captured') {
      return res.status(200).json({ received: true });
    }

    const payment = body.payload?.payment?.entity;
    if (!payment || !payment.order_id) {
      return res.status(200).json({ received: true });
    }

    // Fetch order to get notes (adminId, amount) - use REST API directly
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keyId || !keySecret) {
      console.error('Razorpay keys not set');
      return res.status(500).json({ error: 'Not configured' });
    }

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${payment.order_id}`, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    const order = orderRes.ok ? await orderRes.json() : {};
    const notes = order.notes || {};
    if (notes.type !== 'wallet_recharge' || !notes.adminId || !notes.amount) {
      return res.status(200).json({ received: true });
    }

    const adminId = notes.adminId;
    const amount = parseFloat(notes.amount) || Math.round(payment.amount / 100);
    const orderId = payment.order_id; // use for idempotency (backend stores as cashfreeOrderId)

    const backendUrl = (process.env.BACKEND_URL || process.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app').trim();
    const secret = (process.env.WALLET_WEBHOOK_SECRET || '').trim();
    if (!secret) {
      console.error('WALLET_WEBHOOK_SECRET not set');
      return res.status(500).json({ error: 'Wallet webhook secret not set' });
    }

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
      console.error('Wallet credit failed:', creditRes.status, errText);
      return res.status(500).json({
        error: 'Backend wallet credit failed',
        backendStatus: creditRes.status,
        hint: 'Check WALLET_WEBHOOK_SECRET matches Railway exactly, and BACKEND_URL is correct.',
      });
    }
    console.log('Wallet credited via Razorpay:', adminId, amount);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Vercel/Next: use raw body for webhook signature verification
if (typeof module.exports !== 'undefined') module.exports.config = { api: { bodyParser: false } };
