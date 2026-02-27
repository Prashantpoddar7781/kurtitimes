// Vercel Serverless - Razorpay webhook for wallet recharge
// Configure in Razorpay Dashboard: Webhooks → Add URL → Select "payment.captured"
// Set RAZORPAY_WEBHOOK_SECRET (from webhook setup) in Vercel

const crypto = require('crypto');
const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (expectedSignature !== signature) {
      console.error('Razorpay webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const body = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
    if (body.event !== 'payment.captured') {
      return res.status(200).json({ received: true });
    }

    const payment = body.payload?.payment?.entity;
    if (!payment || !payment.order_id) {
      return res.status(200).json({ received: true });
    }

    // Fetch order to get notes (adminId, amount)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error('Razorpay keys not set');
      return res.status(500).json({ error: 'Not configured' });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.fetch(payment.order_id);
    const notes = order.notes || {};
    if (notes.type !== 'wallet_recharge' || !notes.adminId || !notes.amount) {
      return res.status(200).json({ received: true });
    }

    const adminId = notes.adminId;
    const amount = parseFloat(notes.amount) || Math.round(payment.amount / 100);
    const orderId = payment.order_id; // use for idempotency (backend stores as cashfreeOrderId)

    const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app';
    const secret = process.env.WALLET_WEBHOOK_SECRET;
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
    if (creditRes.ok) {
      console.log('Wallet credited via Razorpay:', adminId, amount);
    } else {
      console.error('Wallet credit failed:', await creditRes.text());
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
