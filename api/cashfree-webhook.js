// Vercel Serverless Function - Cashfree Webhook Handler
// Handles payment status updates from Cashfree

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secretKey = process.env.CASHFREE_WEBHOOK_SECRET;

    // Verify webhook signature (if configured)
    // In production, you should verify the signature for security

    // Parse webhook payload
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { type, data } = body;

    // Handle different webhook events
    switch (type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        // Payment successful
        console.log('Payment successful:', data);
        // Here you can:
        // - Update order status in database
        // - Send confirmation emails
        // - Trigger fulfillment processes
        break;

      case 'PAYMENT_FAILED_WEBHOOK':
        // Payment failed
        console.log('Payment failed:', data);
        break;

      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        // User cancelled payment
        console.log('Payment cancelled:', data);
        break;

      default:
        console.log('Unknown webhook type:', type);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

