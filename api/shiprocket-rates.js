// Shiprocket Shipping Rates API
// This function gets shipping rates for a given pincode

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
    const { pincode, weight } = req.body;

    if (!pincode || !weight) {
      return res.status(400).json({ error: 'Pincode and weight are required' });
    }

    // First, get authentication token
    const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
    const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Shiprocket credentials' 
      });
    }

    // Authenticate
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

    // Get pickup location (warehouse address)
    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '395004'; // Default to Surat
    const pickupCity = process.env.SHIPROCKET_PICKUP_CITY || 'Surat';
    const pickupState = process.env.SHIPROCKET_PICKUP_STATE || 'Gujarat';

    // Get shipping rates
    const ratesResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Use the serviceability API with query parameters
    const serviceabilityUrl = new URL('https://apiv2.shiprocket.in/v1/external/courier/serviceability/');
    serviceabilityUrl.searchParams.append('pickup_postcode', pickupPincode);
    serviceabilityUrl.searchParams.append('delivery_postcode', pincode);
    serviceabilityUrl.searchParams.append('weight', weight.toString());
    serviceabilityUrl.searchParams.append('cod', '1'); // Cash on delivery enabled

    const serviceabilityResponse = await fetch(serviceabilityUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const serviceabilityData = await serviceabilityResponse.json();

    if (!serviceabilityResponse.ok) {
      return res.status(serviceabilityResponse.status).json({ 
        error: 'Failed to get shipping rates',
        details: serviceabilityData 
      });
    }

    // Extract available couriers and their rates
    const availableCouriers = serviceabilityData.data?.available_courier_companies || [];
    
    if (availableCouriers.length === 0) {
      return res.status(200).json({
        available: false,
        message: 'No courier service available for this pincode',
        estimatedDays: 0,
        cost: 0
      });
    }

    // Find the cheapest courier
    const cheapestCourier = availableCouriers.reduce((prev, curr) => {
      const prevRate = prev.rate || prev.estimated_delivery_days ? prev.rate : Infinity;
      const currRate = curr.rate || curr.estimated_delivery_days ? curr.rate : Infinity;
      return (currRate < prevRate) ? curr : prev;
    });

    return res.status(200).json({
      available: true,
      cost: cheapestCourier.rate || 0,
      estimatedDays: cheapestCourier.estimated_delivery_days || 5,
      courier: cheapestCourier.courier_name || 'Standard',
      allCouriers: availableCouriers
    });
  } catch (error) {
    console.error('Shiprocket rates error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

