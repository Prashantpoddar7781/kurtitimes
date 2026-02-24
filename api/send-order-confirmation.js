// Vercel Serverless - Send order confirmation email via Resend
// Set RESEND_API_KEY in Vercel; optional: FROM_EMAIL (default noreply@yourdomain.com)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Diagnostic - check if email is configured (does not expose secrets)
  if (req.method === 'GET') {
    const hasKey = !!process.env.RESEND_API_KEY;
    return res.status(200).json({
      configured: hasKey,
      fromEmail: process.env.FROM_EMAIL ? 'set' : 'not set',
      adminEmail: process.env.ADMIN_EMAIL || 'kurtitimes@gmail.com (default)',
      message: hasKey ? 'Email is configured. Place an order to test.' : 'RESEND_API_KEY is not set in Vercel. Add it in Project Settings > Environment Variables.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set - add it in Vercel Environment Variables');
    return res.status(503).json({ sent: false, reason: 'RESEND_API_KEY not configured. Add it in Vercel: Project Settings > Environment Variables.' });
  }

  try {
    const { to, name, orderId, awbCode, courierName, orderDetails, total, isCOD, shippingAddress, test } = req.body;

    // Test mode: POST { "test": true } to send a test email to admin
    if (test === true) {
      const adminEmail = process.env.ADMIN_EMAIL || 'kurtitimes@gmail.com';
      const fromEmail = process.env.FROM_EMAIL || 'orders@kurtitimes.com';
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: `Kurti Times <${fromEmail}>`,
          to: [adminEmail],
          subject: 'Test – Order email is working',
          html: '<p>If you received this, order confirmation emails are configured correctly.</p>',
        }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        console.error('Resend test error:', err);
        return res.status(500).json({ error: 'Resend rejected', details: err });
      }
      return res.status(200).json({ sent: true, message: `Test email sent to ${adminEmail}. Check Resend dashboard and your inbox.` });
    }
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

    const customerPayload = {
      from: `Kurti Times <${fromEmail}>`,
      subject: `Order Confirmed - Kurti Times (${orderId || ''})`,
      html,
    };

    const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Received - Kurti Times</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626;">New Order Received – Kurti Times</h2>
  <p>A new order has been placed. Please process it.</p>
  <p><strong>Order ID:</strong> ${orderId || 'N/A'}</p>
  <p><strong>Customer:</strong> ${name || 'N/A'}</p>
  ${shippingAddress ? `<p><strong>Shipping Address:</strong><br>${String(shippingAddress).replace(/\n/g, '<br>')}</p>` : ''}
  <p><strong>Payment:</strong> ${isCOD ? 'COD (Collect on delivery)' : 'Prepaid'}</p>
  ${awbCode ? `
  <p style="background: #f0fdf4; padding: 12px; border-radius: 8px; border-left: 4px solid #7c3aed;">
    <strong>Tracking Number (AWB):</strong> ${awbCode}<br>
    ${courierName ? `<strong>Courier:</strong> ${courierName}<br>` : ''}
    <a href="${trackingUrl}" style="color: #7c3aed; font-weight: bold;">Track shipment →</a>
  </p>
  ` : ''}
  ${orderDetails ? `<div style="margin: 16px 0; padding: 12px; background: #f5f5f5; border-radius: 8px;"><strong>Order details:</strong><pre style="margin: 0; white-space: pre-wrap;">${orderDetails}</pre></div>` : ''}
  ${total != null ? `<p><strong>Total: ₹${Number(total).toLocaleString('en-IN')}</strong></p>` : ''}
  <p>— Kurti Times Admin</p>
</body>
</html>
`;

    // Admin first: Resend unverified domains only allow sending to account owner (admin).
    const respAdmin = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Kurti Times <${fromEmail}>`,
        to: [adminEmail],
        subject: `Order Received - Kurti Times (${orderId || ''})`,
        html: adminHtml,
      }),
    });
    if (!respAdmin.ok) {
      const err = await respAdmin.json();
      console.error('Resend admin email error:', err);
      return res.status(500).json({ error: 'Failed to send admin email', details: err });
    }

    // Try customer (may 403 if domain not verified)
    if (customerEmail) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...customerPayload, to: [customerEmail] }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        console.error('Resend customer email error:', err);
        // Admin already received; return success
      }
    }

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: error.message });
  }
};
