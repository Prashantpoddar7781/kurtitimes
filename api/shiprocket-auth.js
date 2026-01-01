const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      return res.status(500).json({ error: 'Shiprocket credentials not configured' });
    }

    const authData = JSON.stringify({
      email: email,
      password: password,
    });

    const options = {
      hostname: 'apiv2.shiprocket.in',
      path: '/v1/external/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(authData),
      },
    };

    const authRequest = https.request(options, (authRes) => {
      let data = '';

      authRes.on('data', (chunk) => {
        data += chunk;
      });

      authRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (authRes.statusCode === 200 && response.token) {
            res.status(200).json({ token: response.token });
          } else {
            console.error('Shiprocket auth error:', response);
            res.status(authRes.statusCode || 401).json({
              error: response.message || 'Authentication failed',
            });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          res.status(500).json({ error: 'Invalid response from Shiprocket' });
        }
      });
    });

    authRequest.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Failed to connect to Shiprocket' });
    });

    authRequest.write(authData);
    authRequest.end();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

