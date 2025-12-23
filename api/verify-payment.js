// Vercel Serverless Function - Verify Razorpay Payment
const crypto = require('crypto');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel automatically parses JSON body
    let body = req.body;
    
    // If body is a string, parse it
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ 
          error: 'Invalid JSON in request body',
          details: e.message 
        });
      }
    }

    // Extract payment details
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: 'Missing payment verification parameters',
        received: {
          hasOrderId: !!razorpay_order_id,
          hasPaymentId: !!razorpay_payment_id,
          hasSignature: !!razorpay_signature
        }
      });
    }

    // Get key secret from environment
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      console.error('Missing RAZORPAY_KEY_SECRET in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Payment verification not configured properly.'
      });
    }

    // Generate signature for verification
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    // Verify signature
    const isSignatureValid = generated_signature === razorpay_signature;

    if (isSignatureValid) {
      // Payment verified successfully
      console.log('Payment verified successfully:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      console.error('Payment verification failed - Invalid signature');
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed - Invalid signature',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message || 'Unknown error occurred',
      type: error.name || 'Error'
    });
  }
};
