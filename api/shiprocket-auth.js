// Shiprocket Authentication API
// This function authenticates with Shiprocket and returns a token

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
    const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
    const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      console.error('Missing Shiprocket credentials');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Shiprocket credentials' 
      });
    }

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Shiprocket auth error:', data);
      return res.status(response.status).json({ 
        error: data.message || 'Authentication failed',
        details: data 
      });
    }

    return res.status(200).json({ token: data.token });
  } catch (error) {
    console.error('Shiprocket auth error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

