// Vercel Serverless Function - Create Razorpay Order
const Razorpay = require('razorpay');

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
    // Vercel automatically parses JSON body, but handle both cases
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

    // If body is still undefined or null, try to read from stream
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ 
        error: 'Request body is required',
        received: typeof body
      });
    }

    // Get credentials from environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Log for debugging (will show in Vercel logs)
    console.log('Environment check:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
      keyIdPrefix: keyId ? keyId.substring(0, 10) : 'missing'
    });

    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Dashboard.',
        debug: {
          hasKeyId: !!keyId,
          hasKeySecret: !!keySecret
        }
      });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Extract request data
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount
    if (!amount || isNaN(amount) || amount < 100) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Minimum amount is ₹1.00 (100 paise)',
        received: amount
      });
    }

    // Create order options
    const options = {
      amount: Math.round(Number(amount)),
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    console.log('Creating Razorpay order:', {
      amount: options.amount,
      currency: options.currency
    });

    // Create order with Razorpay
    const order = await razorpay.orders.create(options);

    console.log('Order created successfully:', order.id);

    // Return success response
    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    // Log full error for debugging
    console.error('Error creating order:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Return error response
    return res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message || 'Unknown error occurred',
      type: error.name || 'Error'
    });
  }
};
