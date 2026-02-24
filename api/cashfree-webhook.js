// Vercel Serverless Function - Cashfree Webhook Handler
// Handles payment status updates from Cashfree + creates Shiprocket shipment

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { type, data } = body;

    switch (type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        console.log('Payment successful:', JSON.stringify(data).slice(0, 500));
        await createShiprocketFromWebhook(data);
        break;

      case 'PAYMENT_FAILED_WEBHOOK':
        console.log('Payment failed:', data);
        break;

      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        console.log('Payment cancelled:', data);
        break;

      default:
        console.log('Unknown webhook type:', type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

async function createShiprocketFromWebhook(data) {
  if (!data || !data.order) return;

  const orderId = data.order?.order_id;
  if (!orderId) return;

  // Skip if order already saved (idempotency - prevents duplicate shipments/orders)
  const backendUrl = process.env.VITE_API_URL || process.env.BACKEND_URL || 'https://kurtitimes-production.up.railway.app';
  try {
    const checkRes = await fetch(`${backendUrl}/api/orders/by-cashfree-id?order_id=${encodeURIComponent(orderId)}`, { method: 'GET' });
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.exists) {
        console.log('Order already exists for', orderId, '- skipping');
        return;
      }
    }
  } catch (e) {
    // Ignore - proceed with creation
  }

  const orderTags = data.order?.order_tags;
  if (!orderTags || typeof orderTags !== 'object') {
    console.log('No order_tags - cannot create shipment from webhook');
    return;
  }

  // Reassemble base64 chunks (sh, sh1, sh2, ...) in order
  const keys = Object.keys(orderTags).filter((k) => k.startsWith('sh'));
  keys.sort((a, b) => {
    const na = a === 'sh' ? 0 : parseInt(String(a).replace('sh', ''), 10) || 0;
    const nb = b === 'sh' ? 0 : parseInt(String(b).replace('sh', ''), 10) || 0;
    return na - nb;
  });
  const encoded = keys.map((k) => orderTags[k]).join('');
  if (!encoded) return;

  let shipping;
  try {
    shipping = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch (e) {
    console.error('Failed to parse shipping data:', e);
    return;
  }

  const token = await getShiprocketToken();
  if (!token) {
    console.error('Shiprocket auth failed - cannot create shipment');
    return;
  }

  const shipmentPayload = {
    order_id: `KT-${orderId.replace(/^order_/, '')}`,
    order_date: new Date().toISOString(),
    pickup_location: 'warehouse',
    billing_customer_name: (shipping.name || '').split(' ')[0] || 'Customer',
    billing_last_name: (shipping.name || '').split(' ').slice(1).join(' ') || '',
    billing_address: shipping.addressLine1 || 'Address',
    billing_address_2: shipping.addressLine2 || '',
    billing_city: shipping.city || 'City',
    billing_pincode: shipping.pincode || '000000',
    billing_state: shipping.state || 'State',
    billing_country: 'India',
    billing_email: shipping.email || (shipping.phone || '') + '@temp.com',
    billing_phone: shipping.phone || '0000000000',
    shipping_is_billing: true,
    shipping_customer_name: (shipping.name || '').split(' ')[0] || 'Customer',
    shipping_last_name: (shipping.name || '').split(' ').slice(1).join(' ') || '',
    shipping_address: shipping.addressLine1 || 'Address',
    shipping_address_2: shipping.addressLine2 || '',
    shipping_city: shipping.city || 'City',
    shipping_pincode: shipping.pincode || '000000',
    shipping_state: shipping.state || 'State',
    shipping_country: 'India',
    shipping_email: shipping.email || (shipping.phone || '') + '@temp.com',
    shipping_phone: shipping.phone || '0000000000',
    order_items: (shipping.cartItems || []).map((it) => ({
      name: it.name || 'Product',
      sku: `SKU-${it.id || 0}-${it.selectedSize || 'M'}`,
      units: it.quantity || 1,
      selling_price: it.price || 0,
    })),
    payment_method: 'Prepaid',
    sub_total: shipping.subtotal || 0,
    length: 20,
    breadth: 15,
    height: 5,
    weight: Math.max(0.5, (shipping.cartItems || []).length * 0.3),
  };

  if (shipmentPayload.order_items.length === 0) {
    shipmentPayload.order_items = [{ name: 'Order', sku: 'SKU-0', units: 1, selling_price: shipmentPayload.sub_total }];
  }

  try {
    const resp = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(shipmentPayload),
    });
    const result = await resp.json();
    if (resp.ok) {
      console.log('Shiprocket shipment created:', result.shipment_id, result.awb_code);
      await saveOrderAndSendEmail(data, shipping, result, orderId);
    } else {
      console.error('Shiprocket create failed:', result);
    }
  } catch (e) {
    console.error('Shiprocket API error:', e);
  }
}

async function saveOrderAndSendEmail(data, shipping, shipmentResult, cashfreeOrderId) {
  const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL || 'https://kurtitimes-production.up.railway.app';

  const shippingAddress = [
    shipping.addressLine1,
    shipping.addressLine2,
    shipping.city,
    shipping.state,
    shipping.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  try {
    await fetch(`${backendUrl}/api/orders/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: shipping.name,
        customerPhone: shipping.phone,
        customerEmail: shipping.email || null,
        shippingAddress,
        total: shipping.total,
        items: (shipping.cartItems || []).map((c) => ({ productId: c.id, quantity: c.quantity, price: c.price, size: c.selectedSize || null })),
        cashfreeOrderId,
        shiprocketOrderId: shipmentResult?.shipment_id,
        awbCode: shipmentResult?.awb_code,
      }),
    });
  } catch (e) {
    console.error('Failed to save order:', e);
  }

  // Send order confirmation email to customer
  const customerEmail = shipping.email || (shipping.phone ? `${shipping.phone}@temp.com` : null);
  if (customerEmail && !customerEmail.includes('@temp.com')) {
    const host = (process.env.VERCEL_URL || process.env.FRONTEND_URL || 'kurtitimes.vercel.app').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const baseUrl = host.startsWith('http') ? host : `https://${host}`;
    try {
      const orderDetails = (shipping.cartItems || [])
        .map((c) => `• ${c.name} (x${c.quantity}) - ₹${(c.price * c.quantity).toLocaleString('en-IN')}`)
        .join('\n');
      await fetch(`${baseUrl}/api/send-order-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          name: shipping.name,
          orderId: cashfreeOrderId,
          awbCode: shipmentResult?.awb_code,
          courierName: shipmentResult?.courier_name,
          orderDetails,
          total: shipping.total,
        }),
      });
    } catch (e) {
      console.error('Failed to send email:', e);
    }
  }
}

async function getShiprocketToken() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) return null;

  try {
    const resp = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    return resp.ok ? data.token : null;
  } catch {
    return null;
  }
}

