// Vercel Serverless - Upload images to Cloudinary (persistent storage)
const { v2: cloudinary } = require('cloudinary');
const formidable = require('formidable');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({
      error: 'Cloudinary not configured',
      message: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in Vercel Dashboard',
    });
  }

  try {
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 }); // 5MB
    const [fields, files] = await form.parse(req);

    const fileList = files.images || files.image || [];
    const uploads = Array.isArray(fileList) ? fileList : [fileList].filter(Boolean);
    const validFiles = uploads.filter((f) => f?.filepath);

    if (validFiles.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const results = [];
    for (const f of validFiles) {
      const result = await cloudinary.uploader.upload(f.filepath, {
        folder: 'kurti-times',
        resource_type: 'image',
      });
      results.push({ url: result.secure_url });
    }

    return res.status(200).json({ files: results });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({
      error: 'Upload failed',
      message: err.message || 'Failed to upload images',
    });
  }
};
