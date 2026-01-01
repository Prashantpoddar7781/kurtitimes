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
    const { order_id, items, shipping_address, payment_method } = req.body;

    if (!order_id || !items || !shipping_address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = await getToken();

    const shipmentData = {
      order_id: order_id,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      billing_customer_name: shipping_address.name,
      billing_last_name: '',
      billing_address: shipping_address.address_line1,
      billing_address_2: shipping_address.address_line2 || '',
      billing_city: shipping_address.city,
      billing_pincode: shipping_address.pincode,
      billing_state: shipping_address.state,
      billing_country: shipping_address.country || 'India',
      billing_email: shipping_address.email || 'customer@example.com',
      billing_phone: shipping_address.phone,
      shipping_is_billing: true,
      order_items: items.map(item => ({
        name: item.name,
        sku: item.sku,
        units: item.units,
        selling_price: item.selling_price,
      })),
      payment_method: payment_method || 'prepaid',
      sub_total: items.reduce((sum, item) => sum + (item.selling_price * item.units), 0),
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.5,
    };

    const postData = JSON.stringify(shipmentData);

    const options = {
      hostname: 'apiv2.shiprocket.in',
      path: '/v1/external/orders/create/adhoc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`,
      },
    };

    const shipmentRequest = https.request(options, (shipmentRes) => {
      let data = '';

      shipmentRes.on('data', (chunk) => {
        data += chunk;
      });

      shipmentRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (shipmentRes.statusCode === 200 && response.shipment_id) {
            res.status(200).json({
              shipment_id: response.shipment_id,
              status: response.status,
              awb_code: response.awb_code,
            });
          } else {
            console.error('Shiprocket error:', response);
            res.status(shipmentRes.statusCode || 500).json({
              error: response.message || 'Failed to create shipment',
              details: response,
            });
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          res.status(500).json({ error: 'Invalid response from Shiprocket' });
        }
      });
    });

    shipmentRequest.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Failed to create shipment' });
    });

    shipmentRequest.write(postData);
    shipmentRequest.end();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

