// Cashfree Webhook API
// This function handles Cashfree payment webhooks

module.exports = async (req, res) => {
  // Set CORS headers
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
    const webhookData = req.body;

    // Verify webhook signature (optional but recommended)
    const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;
    
    // Log webhook for debugging
    console.log('Cashfree webhook received:', JSON.stringify(webhookData, null, 2));

    // Process webhook based on event type
    const eventType = webhookData.type || webhookData.event;
    const orderId = webhookData.data?.order?.order_id || webhookData.orderId;

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || webhookData.type === 'PAYMENT_SUCCESS') {
      // Payment successful
      // Here you can:
      // 1. Update order status in your database
      // 2. Send confirmation email to customer
      // 3. Create shipment in Shiprocket
      // 4. Send notification to admin

      console.log(`Payment successful for order: ${orderId}`);
      
      // Return success response
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully',
        orderId: orderId
      });
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || webhookData.type === 'PAYMENT_FAILED') {
      // Payment failed
      console.log(`Payment failed for order: ${orderId}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully',
        orderId: orderId
      });
    } else {
      // Other webhook events
      console.log(`Webhook event received: ${eventType} for order: ${orderId}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully',
        eventType: eventType
      });
    }
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

