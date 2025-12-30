// Shiprocket Request Pickup API
// This function requests a pickup for a shipment

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
    const { shipmentId } = req.body;

    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }

    // Authenticate with Shiprocket
    const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
    const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Shiprocket credentials' 
      });
    }

    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return res.status(authResponse.status).json({ 
        error: 'Authentication failed',
        details: authData 
      });
    }

    const token = authData.token;

    // Request pickup
    const pickupResponse = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/pickup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shipment_id: [shipmentId]
      }),
    });

    const pickupData = await pickupResponse.json();

    if (!pickupResponse.ok) {
      return res.status(pickupResponse.status).json({ 
        error: 'Failed to request pickup',
        details: pickupData 
      });
    }

    return res.status(200).json({
      success: true,
      pickupData: pickupData
    });
  } catch (error) {
    console.error('Shiprocket request pickup error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

