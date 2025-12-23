const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available, use defaults
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Rv4c4iUwni06DQ',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '2xrHIReHqhLfWAH035dZM0vy',
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

    res.json({
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
});

// API Routes - Verify Payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: 'Missing payment verification parameters' 
      });
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '2xrHIReHqhLfWAH035dZM0vy')
      .update(text)
      .digest('hex');

    const isSignatureValid = generated_signature === razorpay_signature;

    if (isSignatureValid) {
      res.json({
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
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handle React routing, return all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID || 'rzp_test_Rv4c4iUwni06DQ'}`);
});
