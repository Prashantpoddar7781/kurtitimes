// Vercel Serverless Function - Create Shipment in Shiprocket
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const shipmentData = req.body;

    // Validate required fields
    const required = ['order_id', 'billing_customer_name', 'billing_address', 'billing_city', 
                     'billing_pincode', 'billing_state', 'billing_phone', 'order_items'];
    
    for (const field of required) {
      if (!shipmentData[field]) {
        return res.status(400).json({
          error: `Missing required field: ${field}`
        });
      }
    }

    // Create shipment in Shiprocket
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(shipmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to create shipment',
        message: data.message || data.error || 'Unknown error',
        details: data
      });
    }

    return res.status(200).json({
      status: data.status || 1,
      message: 'Shipment created successfully',
      shipment_id: data.shipment_id,
      awb_code: data.awb_code,
      courier_name: data.courier_name,
      order_id: data.order_id || shipmentData.order_id,
      label_url: data.label_url,
    });
  } catch (error) {
    console.error('Shiprocket create shipment error:', error);
    return res.status(500).json({
      error: 'Failed to create shipment',
      message: error.message
    });
  }
};

