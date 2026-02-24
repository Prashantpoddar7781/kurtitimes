import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Import routes
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
// Load environment variables
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://kurtitimes.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
].filter(Boolean);
app.use(cors({
    origin: (origin, cb) => {
        const allow = !origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'));
        cb(null, allow ? (origin || true) : false);
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Email test - no auth (add RESEND_API_KEY in Railway)
app.get('/api/email-test', async (req, res) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
        const adminEmail = process.env.ADMIN_EMAIL || 'kurtitimes@gmail.com';
        if (!apiKey) {
            return res.json({ ok: false, error: 'RESEND_API_KEY not set in Railway. Add it in Project > Variables.' });
        }
        if (req.query.send === '1' || req.query.send === 'true') {
            const r = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                    from: `Kurti Times <${fromEmail}>`,
                    to: [adminEmail],
                    subject: 'Backend email test – Kurti Times',
                    html: '<p>If you got this, backend email is working.</p>',
                }),
            });
            if (!r.ok) {
                const err = await r.text();
                return res.json({ ok: false, error: 'Resend rejected: ' + err });
            }
            return res.json({ ok: true, message: `Test email sent to ${adminEmail}` });
        }
        return res.json({ ok: true, configured: true, fromEmail, adminEmail, message: 'Add ?send=1 to send test email' });
    } catch (e) {
        return res.json({ ok: false, error: e.message });
    }
});
// Root endpoint for testing
app.get('/', (req, res) => {
    console.log('Root endpoint requested');
    res.json({ message: 'Backend API is running', port: PORT });
});
// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=server.js.map