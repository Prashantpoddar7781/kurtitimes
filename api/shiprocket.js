// Vercel Serverless - Unified Shiprocket API (saves 4 serverless functions for Hobby plan limit)
// Handles: auth, rates, create-shipment, generate-label, request-pickup via ?action= param

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const url = new URL(req.url || '', 'http://localhost');
  const action = url.searchParams.get('action') || (req.body && req.body.action);
  let token = req.headers.authorization?.replace('Bearer ', '');

  const send = (status, data) => res.status(status).json(data);

  const getToken = async () => {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    if (!email || !password) throw new Error('Shiprocket credentials not configured');
    const r = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Shiprocket auth failed');
    return data.token;
  };

  const apiCall = async (path, body, method = 'POST') => {
    const t = token || await getToken();
    const opts = { method, headers: { Authorization: `Bearer ${t}` } };
    if (method === 'POST' && body != null) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const r = await fetch(`https://apiv2.shiprocket.in/v1/external${path}`, opts);
    return { ok: r.ok, data: await r.json().catch(() => ({})) };
  };

  try {
    if (action === 'auth') {
      const t = await getToken();
      return send(200, { token: t, expires_in: 86400 });
    }

    if (!action) return send(400, { error: 'Missing action. Use ?action=auth|rates|create-shipment|generate-label|request-pickup' });

    if (action === 'rates') {
      const { pickup_pincode, delivery_pincode, weight, cod_amount } = req.body || {};
      if (!pickup_pincode || !delivery_pincode || !weight) {
        return send(400, { error: 'pickup_pincode, delivery_pincode, weight required' });
      }
      const { ok, data } = await apiCall('/courier/serviceability/rate', { pickup_pincode, delivery_pincode, weight, cod_amount: cod_amount || 0 });
      if (!ok) return send(500, { error: data.message || 'Rates failed' });
      return send(200, { rate: data.data?.available_courier_companies || [], pickup_pincode, delivery_pincode });
    }

    if (action === 'create-shipment') {
      const shipmentData = req.body;
      const required = ['order_id', 'billing_customer_name', 'billing_address', 'billing_city', 'billing_pincode', 'billing_state', 'billing_phone', 'order_items'];
      for (const f of required) {
        if (!shipmentData?.[f]) return send(400, { error: `Missing ${f}` });
      }
      const { ok, data } = await apiCall('/orders/create/adhoc', shipmentData);
      if (!ok) return send(500, { error: data.message || 'Create shipment failed' });
      return send(200, { status: data.status || 1, message: 'Shipment created', shipment_id: data.shipment_id, awb_code: data.awb_code, courier_name: data.courier_name, order_id: data.order_id || shipmentData.order_id, label_url: data.label_url });
    }

    if (action === 'generate-label') {
      const { shipment_id } = req.body || {};
      if (!shipment_id) return send(400, { error: 'shipment_id required' });
      const { ok, data } = await apiCall('/courier/generate/label', { shipment_id: [shipment_id] });
      if (!ok) return send(500, { error: data.message || 'Generate label failed' });
      return send(200, { label_url: data.label_url || '', message: 'Label generated' });
    }

    if (action === 'request-pickup') {
      const { shipment_id } = req.body || {};
      if (!shipment_id) return send(400, { error: 'shipment_id required' });
      const { ok, data } = await apiCall('/courier/generate/pickup', { shipment_id: [shipment_id] });
      if (!ok) return send(500, { error: data.message || 'Request pickup failed' });
      return send(200, { success: true, message: 'Pickup requested', pickup_scheduled_date: data.pickup_scheduled_date });
    }

    if (action === 'track') {
      const awb = url.searchParams.get('awb') || req.body?.awb;
      if (!awb) return send(400, { error: 'awb required' });
      const { ok, data } = await apiCall(`/courier/track/awb/${encodeURIComponent(awb)}`, null, 'GET');
      if (!ok) return send(500, { error: data.message || 'Track failed' });
      return send(200, data);
    }

    return send(400, { error: 'Invalid action. Use auth|rates|create-shipment|generate-label|request-pickup|track' });
  } catch (err) {
    console.error('Shiprocket error:', err);
    return send(500, { error: err.message || 'Shiprocket error' });
  }
};
