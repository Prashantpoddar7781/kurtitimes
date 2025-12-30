// Shiprocket Create Shipment API
// This function creates a shipment order in Shiprocket

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
    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      orderItems,
      paymentMethod,
      orderAmount
    } = req.body;

    if (!orderId || !customerName || !customerPhone || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Authenticate with Shiprocket
    const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
    const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Shiprocket credentials' 
      });
    }

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

    // Get warehouse/pickup address from environment variables
    const pickupAddress = {
      name: process.env.SHIPROCKET_PICKUP_NAME || 'Kurti Times',
      phone: process.env.SHIPROCKET_PICKUP_PHONE || '9892794421',
      address_line1: process.env.SHIPROCKET_PICKUP_ADDRESS_LINE1 || 'G-11-12, RAJHANS IMPERIA',
      address_line2: process.env.SHIPROCKET_PICKUP_ADDRESS_LINE2 || 'RING ROAD',
      city: process.env.SHIPROCKET_PICKUP_CITY || 'Surat',
      state: process.env.SHIPROCKET_PICKUP_STATE || 'Gujarat',
      pincode: process.env.SHIPROCKET_PICKUP_PINCODE || '395004',
      country: 'India'
    };

    // Calculate total weight (assuming average 0.5kg per item)
    const totalWeight = (orderItems.length * 0.5).toFixed(2);

    // Prepare order data
    const orderData = {
      order_id: orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary', // You may need to set this up in Shiprocket dashboard
      billing_customer_name: customerName,
      billing_last_name: '',
      billing_address: shippingAddress.addressLine1,
      billing_address_2: shippingAddress.addressLine2 || '',
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.pincode,
      billing_state: shippingAddress.state,
      billing_country: 'India',
      billing_email: customerEmail || '',
      billing_phone: customerPhone,
      shipping_is_billing: true,
      shipping_customer_name: customerName,
      shipping_last_name: '',
      shipping_address: shippingAddress.addressLine1,
      shipping_address_2: shippingAddress.addressLine2 || '',
      shipping_city: shippingAddress.city,
      shipping_pincode: shippingAddress.pincode,
      shipping_state: shippingAddress.state,
      shipping_country: 'India',
      shipping_email: customerEmail || '',
      shipping_phone: customerPhone,
      order_items: orderItems.map((item, index) => ({
        name: item.name,
        sku: `KT-${item.id}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 6109 // HSN code for garments
      })),
      payment_method: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: orderAmount,
      length: 30,
      breadth: 25,
      height: 5,
      weight: totalWeight
    };

    // Create order in Shiprocket
    const createOrderResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const orderResult = await createOrderResponse.json();

    if (!createOrderResponse.ok) {
      console.error('Shiprocket create order error:', orderResult);
      return res.status(createOrderResponse.status).json({ 
        error: 'Failed to create shipment',
        details: orderResult 
      });
    }

    return res.status(200).json({
      success: true,
      shipmentId: orderResult.order_id,
      awbCode: orderResult.awb_code || null,
      channelOrderId: orderResult.channel_order_id,
      orderData: orderResult
    });
  } catch (error) {
    console.error('Shiprocket create shipment error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

