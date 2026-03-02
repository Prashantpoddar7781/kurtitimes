import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, requireAdmin } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();

const AI_PHOTOSHOOT_COST = 50;
const BYPASS_ADMIN_ID = 'admin-7624029175';

async function ensureBypassAdminExists() {
    const existing = await prisma.adminUser.findUnique({ where: { id: BYPASS_ADMIN_ID } });
    if (existing) return;
    await prisma.adminUser.create({
        data: {
            id: BYPASS_ADMIN_ID,
            email: '7624029175@kurtitimes.com',
            password: await bcrypt.hash('7624029175', 10),
            role: 'admin',
        },
    });
}

// POST /api/admin/wallet/credit - Called by webhook (no auth, uses secret)
router.post('/wallet/credit', async (req, res) => {
    try {
        const secret = req.headers['x-wallet-webhook-secret'];
        const expected = process.env.WALLET_WEBHOOK_SECRET;
        if (!expected || secret !== expected) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { orderId, adminId, amount } = req.body;
        if (!orderId || !adminId || amount == null || amount < 1) {
            return res.status(400).json({ error: 'orderId, adminId, amount required' });
        }
        const existing = await prisma.walletRecharge.findUnique({ where: { cashfreeOrderId: orderId } });
        if (existing) {
            return res.status(200).json({ success: true, message: 'Already credited' });
        }
        await prisma.$transaction([
            prisma.walletRecharge.create({ data: { cashfreeOrderId: orderId, adminId, amountInRupees: Number(amount) } }),
            prisma.adminUser.update({
                where: { id: adminId },
                data: { walletBalance: { increment: Number(amount) } }
            })
        ]);
        res.json({ success: true });
    } catch (e) {
        console.error('Wallet credit error:', e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/wallet/test-credit - Test credit ₹1 (admin auth only, no webhook secret)
router.post('/wallet/test-credit', authenticate, requireAdmin, async (req, res) => {
    try {
        if (req.user.id === BYPASS_ADMIN_ID) {
            await ensureBypassAdminExists();
        }
        const orderId = `test_${Date.now()}`;
        const amount = 1;
        const existing = await prisma.walletRecharge.findUnique({ where: { cashfreeOrderId: orderId } });
        if (existing) {
            return res.json({ success: true, message: 'Already credited' });
        }
        await prisma.$transaction([
            prisma.walletRecharge.create({ data: { cashfreeOrderId: orderId, adminId: req.user.id, amountInRupees: amount } }),
            prisma.adminUser.update({
                where: { id: req.user.id },
                data: { walletBalance: { increment: amount } }
            })
        ]);
        res.json({ success: true, message: '₹1 credited. Refresh to see balance.' });
    } catch (e) {
        console.error('Test wallet credit error:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/admin/wallet - Get balance (auth)
router.get('/wallet', authenticate, requireAdmin, async (req, res) => {
    try {
        if (req.user.id === BYPASS_ADMIN_ID) {
            await ensureBypassAdminExists();
        }
        const admin = await prisma.adminUser.findUnique({
            where: { id: req.user.id },
            select: { walletBalance: true }
        });
        res.json({ balance: Number(admin?.walletBalance ?? 0) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/wallet/deduct - Deduct for AI photoshoot (auth)
router.post('/wallet/deduct', authenticate, requireAdmin, async (req, res) => {
    try {
        if (req.user.id === BYPASS_ADMIN_ID) {
            await ensureBypassAdminExists();
        }
        const { amount = AI_PHOTOSHOOT_COST } = req.body;
        if (amount !== AI_PHOTOSHOOT_COST) {
            return res.status(400).json({ error: `Amount must be ${AI_PHOTOSHOOT_COST}` });
        }
        const admin = await prisma.adminUser.findUnique({
            where: { id: req.user.id },
            select: { walletBalance: true }
        });
        const balance = Number(admin?.walletBalance ?? 0);
        if (balance < amount) {
            return res.status(402).json({ error: `Insufficient balance. Need ₹${amount}, have ₹${balance.toFixed(0)}. Recharge wallet.` });
        }
        await prisma.adminUser.update({
            where: { id: req.user.id },
            data: { walletBalance: { decrement: amount } }
        });
        res.json({ success: true, newBalance: balance - amount });
    } catch (e) {
        console.error('Wallet deduct error:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalRevenue, pendingOrders, paidOrders] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                where: { status: 'PAID' },
                _sum: { total: true }
            }),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'PAID' } })
        ]);
        res.json({
            products: {
                total: totalProducts
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                paid: paidOrders
            },
            revenue: {
                total: totalRevenue._sum.total || 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=admin.js.map