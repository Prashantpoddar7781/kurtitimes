// Vercel Serverless Function - Shiprocket Authentication
// Supports both API Key (direct token) and Email/Password authentication
module.exports = async (req, res) => {
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
    // Check if API key is provided (new method)
    const apiKey = process.env.SHIPROCKET_API_KEY;
    
    if (apiKey) {
      // Use API key directly as token
      return res.status(200).json({
        token: apiKey,
        expires_in: 86400 // API keys typically don't expire
      });
    }

    // Fallback to email/password authentication (old method)
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      return res.status(500).json({
        error: 'Shiprocket credentials not configured',
        message: 'Please set either SHIPROCKET_API_KEY (recommended) or SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in Vercel Dashboard'
      });
    }

    // Authenticate with Shiprocket using email/password
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: 'Shiprocket authentication failed',
        message: error.message || 'Invalid credentials'
      });
    }

    const data = await response.json();

    return res.status(200).json({
      token: data.token,
      expires_in: data.expires_in || 86400
    });
  } catch (error) {
    console.error('Shiprocket auth error:', error);
    return res.status(500).json({
      error: 'Failed to authenticate with Shiprocket',
      message: error.message
    });
  }
};

