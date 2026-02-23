// Vercel Serverless - Send order confirmation via WhatsApp TO the customer FROM 9892794421
// Requires Twilio WhatsApp Business API
// Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g. whatsapp:+919892794421)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+919892794421';

  if (!accountSid || !authToken) {
    console.warn('Twilio not configured - skipping WhatsApp');
    return res.status(200).json({ sent: false, reason: 'WhatsApp not configured' });
  }

  try {
    const { to, name, orderId, awbCode, courierName, orderDetails, total } = req.body;
    if (!to) return res.status(400).json({ error: 'Customer phone required' });

    const customerPhone = String(to).replace(/\D/g, '').slice(-10);
    if (customerPhone.length !== 10) return res.status(400).json({ error: 'Valid 10-digit phone required' });

    let body = `*Order Confirmed - Kurti Times* ✅\n\nDear ${name || 'Customer'},\n\nThank you for your order!\n\n*Order ID:* ${orderId || 'N/A'}`;
    if (awbCode) body += `\n*Shipment AWB:* ${awbCode}`;
    if (courierName) body += `\n*Courier:* ${courierName}`;
    if (awbCode || courierName) body += `\n\nTrack: https://www.shiprocket.in/shipment-tracking`;
    if (orderDetails) body += `\n\n*Order:*\n${orderDetails}`;
    if (total != null) body += `\n\n*Total paid:* ₹${Number(total).toLocaleString('en-IN')}\n\nWe'll process your order shortly. For any queries, message us on WhatsApp.`;
    body += `\n\n— Kurti Times`;

    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: `whatsapp:+91${customerPhone}`,
          Body: body,
        }),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Twilio WhatsApp error:', data);
      return res.status(500).json({ error: 'Failed to send WhatsApp', details: data });
    }
    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error('Send WhatsApp error:', error);
    return res.status(500).json({ error: error.message });
  }
};
