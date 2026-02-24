// Vercel Serverless - Send order confirmation email via Resend
// Set RESEND_API_KEY in Vercel; optional: FROM_EMAIL (default noreply@yourdomain.com)

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set - skipping email');
    return res.status(200).json({ sent: false, reason: 'Email not configured' });
  }

  try {
    const { to, name, orderId, awbCode, courierName, orderDetails, total, isCOD } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'kurtitimes@gmail.com';
    const customerEmail = to && !String(to).includes('@temp.com') ? to : null;
    if (!customerEmail && !adminEmail) {
      return res.status(400).json({ error: 'Recipient email required' });
    }

    const fromEmail = process.env.FROM_EMAIL || 'orders@kurtitimes.com';
    const trackingUrl = awbCode
      ? `https://shiprocket.in/shipment-tracking?awb=${encodeURIComponent(awbCode)}`
      : 'https://shiprocket.in/shipment-tracking';
    const paymentMsg = isCOD ? 'Pay the amount when your order is delivered.' : "We've received your payment successfully.";
    const totalLabel = isCOD ? 'Total (pay on delivery)' : 'Total paid';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmed - Kurti Times</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #7c3aed;">Order Confirmed - Kurti Times</h2>
  <p>Dear ${name || 'Customer'},</p>
  <p>Thank you for your order! ${paymentMsg}</p>
  
  <p><strong>Order ID:</strong> ${orderId || 'N/A'}</p>
  ${awbCode ? `
  <p style="background: #f0fdf4; padding: 12px; border-radius: 8px; border-left: 4px solid #7c3aed;">
    <strong>Tracking Number (AWB):</strong> ${awbCode}<br>
    ${courierName ? `<strong>Courier:</strong> ${courierName}<br>` : ''}
    <a href="${trackingUrl}" style="color: #7c3aed; font-weight: bold;">Track your shipment →</a>
  </p>
  ` : ''}
  ${!awbCode && courierName ? `<p><strong>Courier:</strong> ${courierName}</p>` : ''}
  
  ${orderDetails ? `<div style="margin: 16px 0; padding: 12px; background: #f5f5f5; border-radius: 8px;"><strong>Order details:</strong><pre style="margin: 0; white-space: pre-wrap;">${orderDetails}</pre></div>` : ''}
  ${total != null ? `<p><strong>${totalLabel}:</strong> ₹${Number(total).toLocaleString('en-IN')}</p>` : ''}
  
  <p>We'll process your order shortly. For any queries, contact us on WhatsApp.</p>
  <p>— Kurti Times</p>
</body>
</html>
`;

    const payload = {
      from: `Kurti Times <${fromEmail}>`,
      subject: `Order Confirmed - Kurti Times (${orderId || ''})`,
      html,
    };

    // Send to customer (if they have real email)
    if (customerEmail) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...payload, to: [customerEmail] }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        console.error('Resend customer email error:', err);
        return res.status(500).json({ error: 'Failed to send customer email', details: err });
      }
    }

    // Always send copy to admin
    const respAdmin = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...payload,
        to: [adminEmail],
        subject: `[Admin] Order Confirmed - Kurti Times (${orderId || ''})`,
      }),
    });
    if (!respAdmin.ok) {
      const err = await respAdmin.json();
      console.error('Resend admin email error:', err);
      return res.status(500).json({ error: 'Failed to send admin email', details: err });
    }

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: error.message });
  }
};
