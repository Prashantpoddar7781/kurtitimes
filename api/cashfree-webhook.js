module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Cashfree webhook signature verification would go here
    // For now, we'll just log the webhook data
    console.log('Cashfree webhook received:', JSON.stringify(req.body, null, 2));
    
    // Process the webhook data
    const { orderId, orderAmount, paymentStatus } = req.body;
    
    if (paymentStatus === 'PAID') {
      // Handle successful payment
      // You can update your database, send confirmation emails, etc.
      console.log(`Order ${orderId} payment confirmed: ₹${orderAmount}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

