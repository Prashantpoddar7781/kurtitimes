// Vercel Serverless Function - Get Shipping Rates
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

    const { pickup_pincode, delivery_pincode, weight, cod_amount } = req.body;

    if (!pickup_pincode || !delivery_pincode || !weight) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'pickup_pincode, delivery_pincode, and weight are required'
      });
    }

    // Get shipping rates from Shiprocket
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/courier/serviceability/rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickup_pincode: pickup_pincode,
        delivery_pincode: delivery_pincode,
        weight: weight,
        cod_amount: cod_amount || 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: 'Failed to get shipping rates',
        message: error.message || 'Invalid request'
      });
    }

    const data = await response.json();

    return res.status(200).json({
      rate: data.data?.available_courier_companies || [],
      pickup_pincode: pickup_pincode,
      delivery_pincode: delivery_pincode,
    });
  } catch (error) {
    console.error('Shiprocket rates error:', error);
    return res.status(500).json({
      error: 'Failed to get shipping rates',
      message: error.message
    });
  }
};

