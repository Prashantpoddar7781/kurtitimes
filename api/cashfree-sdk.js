// Proxy Cashfree SDK to avoid CORS - serves script from our domain (same-origin)
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }
  try {
    const response = await fetch('https://sdk.cashfree.com/js/v3/cashfree.js');
    const script = await response.text();
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(script);
  } catch (err) {
    console.error('Cashfree SDK proxy error:', err);
    res.status(502).send('/* Failed to load Cashfree SDK */');
  }
};
