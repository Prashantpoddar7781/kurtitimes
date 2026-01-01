const https = require('https');

const getToken = () => {
  return new Promise((resolve, reject) => {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    const authData = JSON.stringify({ email, password });

    const options = {
      hostname: 'apiv2.shiprocket.in',
      path: '/v1/external/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(authData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.token) resolve(response.token);
          else reject(new Error('No token received'));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(authData);
    req.end();
  });
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shipment_id } = req.body;

    if (!shipment_id) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }

    const token = await getToken();

    const labelData = JSON.stringify({
      shipment_id: [shipment_id],
    });

    const options = {
      hostname: 'apiv2.shiprocket.in',
      path: '/v1/external/courier/generate/label',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(labelData),
        'Authorization': `Bearer ${token}`,
      },
    };

    const labelRequest = https.request(options, (labelRes) => {
      let data = '';

      labelRes.on('data', (chunk) => {
        data += chunk;
      });

      labelRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (labelRes.statusCode === 200 && response.label_url) {
            res.status(200).json({ label_url: response.label_url });
          } else {
            res.status(labelRes.statusCode || 500).json({
              error: response.message || 'Failed to generate label',
            });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          res.status(500).json({ error: 'Invalid response from Shiprocket' });
        }
      });
    });

    labelRequest.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Failed to generate label' });
    });

    labelRequest.write(labelData);
    labelRequest.end();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

