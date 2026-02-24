import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();
// POST /api/orders - Create order
router.post('/', async (req, res) => {
    try {
        const { customerName, customerPhone, customerEmail, shippingAddress, items } = req.body;
        if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Calculate total and validate products
        let total = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });
            if (!product) {
                return res.status(400).json({ error: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }
        // Create order with items
        const order = await prisma.order.create({
            data: {
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                shippingAddress: shippingAddress || null,
                total,
                status: 'PENDING',
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders/confirm - Create confirmed order (from payment success, no stock check)
router.post('/confirm', async (req, res) => {
    try {
        const { customerName, customerPhone, customerEmail, shippingAddress, total, items, cashfreeOrderId, paymentId, shiprocketOrderId, awbCode, paymentMethod: paymentMethodBody, payment_method: paymentMethodSnake } = req.body;
        const paymentMethod = paymentMethodBody || paymentMethodSnake;
        if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (cashfreeOrderId) {
            const existing = await prisma.order.findFirst({
                where: { cashfreeOrderId: String(cashfreeOrderId) }
            });
            if (existing) return res.status(201).json(existing);
        }
        let fallbackProduct = null;
        const orderItems = [];
        let orderTotal = 0;
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: String(item.productId) }
            });
            const qty = item.quantity || 1;
            const price = product ? product.price : (item.price != null ? Number(item.price) : 0);
            if (price <= 0) continue;
            let productId = product ? product.id : null;
            if (!productId) {
                if (!fallbackProduct) {
                    fallbackProduct = await prisma.product.findFirst();
                }
                productId = fallbackProduct?.id;
            }
            if (!productId) continue;
            orderTotal += price * qty;
            const sizeVal = item.size ?? item.selectedSize;
            const size = sizeVal && String(sizeVal).trim() ? String(sizeVal).trim() : null;
            orderItems.push({
                productId,
                quantity: qty,
                price,
                size
            });
        }
        if (orderItems.length === 0) return res.status(400).json({ error: 'No valid items' });
        const isCOD = (paymentMethod || '').toUpperCase() === 'COD';
        const order = await prisma.order.create({
            data: {
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                shippingAddress: shippingAddress || null,
                total: total ?? orderTotal,
                status: isCOD ? 'COD_PENDING' : 'PAID',
                paymentMethod: isCOD ? 'COD' : 'PREPAID',
                paymentId: paymentId || null,
                paymentStatus: isCOD ? null : 'success',
                cashfreeOrderId: cashfreeOrderId || null,
                shiprocketOrderId: shiprocketOrderId ? String(shiprocketOrderId) : null,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            const orderDetailsStr = (order.items || []).map((i) => `• ${i.product?.name || 'Product'}${i.size ? ` (Size: ${i.size})` : ''} (x${i.quantity}) - ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
            const adminEmail = process.env.ADMIN_EMAIL || 'kurtitimes@gmail.com';
            const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
            const customerEmail = order.customerEmail && !String(order.customerEmail).includes('@temp.com') ? order.customerEmail : null;
            const paymentMsg = isCOD ? 'Pay the amount when your order is delivered.' : "We've received your payment successfully.";
            const totalLabel = isCOD ? 'Total (pay on delivery)' : 'Total paid';
            const trackingUrl = awbCode ? `https://shiprocket.in/shipment-tracking?awb=${encodeURIComponent(awbCode)}` : 'https://shiprocket.in/shipment-tracking';
            const orderIdStr = order.cashfreeOrderId || order.id;
            const awbBlock = awbCode ? `<p style="background:#f0fdf4;padding:12px;border-radius:8px;border-left:4px solid #7c3aed;"><strong>Tracking Number (AWB):</strong> ${awbCode}<br><a href="${trackingUrl}" style="color:#7c3aed;font-weight:bold">Track your shipment</a></p>` : '';
            const html = `<!DOCTYPE html><html><body style="font-family:Arial;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#7c3aed">Order Confirmed - Kurti Times</h2><p>Dear ${order.customerName || 'Customer'},</p><p>Thank you for your order! ${paymentMsg}</p><p><strong>Order ID:</strong> ${orderIdStr}</p>${awbBlock}${orderDetailsStr ? `<div style="margin:16px 0;padding:12px;background:#f5f5f5;border-radius:8px"><strong>Order details:</strong><pre style="margin:0;white-space:pre-wrap">${orderDetailsStr}</pre></div>` : ''}<p><strong>${totalLabel}:</strong> ₹${Number(order.total).toLocaleString('en-IN')}</p><p>— Kurti Times</p></body></html>`;
            const sendOne = async (to, subj) => {
                const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ from: `Kurti Times <${fromEmail}>`, to: [to], subject: subj, html }) });
                if (!r.ok) throw new Error(await r.text());
            };
            try {
                if (customerEmail) await sendOne(customerEmail, `Order Confirmed - Kurti Times (${orderIdStr})`);
                await sendOne(adminEmail, `[Admin] Order Confirmed - Kurti Times (${orderIdStr})`);
            } catch (e) {
                console.error('Resend email failed:', e.message);
            }
        }
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/orders/by-cashfree-id - Check if order exists (for webhook idempotency - no auth)
router.get('/by-cashfree-id', async (req, res) => {
    try {
        const { order_id } = req.query;
        if (!order_id) return res.status(400).json({ error: 'order_id required' });
        const existing = await prisma.order.findFirst({
            where: { cashfreeOrderId: String(order_id) }
        });
        res.json({ exists: !!existing });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/orders/by-phone - Get orders by customer phone (for My Orders - no auth required)
router.get('/by-phone', async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ error: 'Phone number required' });
        }
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        if (normalizedPhone.length !== 10) {
            return res.status(400).json({ error: 'Valid 10-digit phone required' });
        }
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { customerPhone: { equals: normalizedPhone } },
                    { customerPhone: { endsWith: normalizedPhone } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        res.json({ orders });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/orders - List orders (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status, page = '1', limit = '50' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (status) {
            where.status = status;
        }
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            }),
            prisma.order.count({ where })
        ]);
        res.json({
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/orders/:id - Get single order
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(order);
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=orders.js.map