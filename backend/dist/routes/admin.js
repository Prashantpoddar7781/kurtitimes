import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();
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