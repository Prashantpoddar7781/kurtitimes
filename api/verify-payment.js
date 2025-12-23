// Vercel Serverless Function - Verify Razorpay Payment
const crypto = require('crypto');

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: 'Missing payment verification parameters' 
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      console.error('Missing RAZORPAY_KEY_SECRET in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Payment verification not configured properly.'
      });
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    const isSignatureValid = generated_signature === razorpay_signature;

    if (isSignatureValid) {
      // Payment verified successfully
      // Here you would typically:
      // 1. Save order to database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Send notification to admin

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed - Invalid signature',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
};

