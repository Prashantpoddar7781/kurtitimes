// Vercel Serverless Function - Generate Shipping Label
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

    const { shipment_id } = req.body;

    if (!shipment_id) {
      return res.status(400).json({
        error: 'shipment_id is required'
      });
    }

    // Generate label from Shiprocket
    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/generate/label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [shipment_id]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to generate label',
        message: data.message || 'Unknown error'
      });
    }

    return res.status(200).json({
      label_url: data.label_url || '',
      message: 'Label generated successfully'
    });
  } catch (error) {
    console.error('Shiprocket generate label error:', error);
    return res.status(500).json({
      error: 'Failed to generate label',
      message: error.message
    });
  }
};

