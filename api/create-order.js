// Vercel Serverless Function - Create Razorpay Order
const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  // Enable CORS
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
    // Get credentials from environment variables (set in Vercel Dashboard)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Dashboard.');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Razorpay credentials not configured. Please contact support.'
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ 
        error: 'Invalid amount. Minimum amount is ₹1.00 (100 paise)' 
      });
    }

    const options = {
      amount: Math.round(amount),
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
};

