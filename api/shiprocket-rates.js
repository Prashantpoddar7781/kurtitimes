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
    const { pickup_pincode, delivery_pincode, weight, cod_amount } = req.body;

    if (!pickup_pincode || !delivery_pincode) {
      return res.status(400).json({ error: 'Pincodes are required' });
    }

    const token = await getToken();

    const rateData = JSON.stringify({
      pickup_pincode,
      delivery_pincode,
      weight: weight || 0.5,
      cod_amount: cod_amount || 0,
    });

    const options = {
      hostname: 'apiv2.shiprocket.in',
      path: '/v1/external/courier/serviceability/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const queryString = new URLSearchParams({
      pickup_pincode,
      delivery_pincode,
      weight: (weight || 0.5).toString(),
      cod: (cod_amount > 0 ? 1 : 0).toString(),
    }).toString();

    options.path += '?' + queryString;

    const rateRequest = https.request(options, (rateRes) => {
      let data = '';

      rateRes.on('data', (chunk) => {
        data += chunk;
      });

      rateRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (rateRes.statusCode === 200 && response.data) {
            const rates = response.data.available_courier_companies || [];
            res.status(200).json(rates.map(courier => ({
              courier_id: courier.courier_company_id,
              courier_name: courier.courier_name,
              rate: courier.rate,
              estimated_delivery_days: courier.estimated_delivery_days || '3-5',
            })));
          } else {
            res.status(rateRes.statusCode || 500).json({
              error: response.message || 'Failed to fetch rates',
            });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          res.status(500).json({ error: 'Invalid response from Shiprocket' });
        }
      });
    });

    rateRequest.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Failed to fetch shipping rates' });
    });

    rateRequest.end();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

