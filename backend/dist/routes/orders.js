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