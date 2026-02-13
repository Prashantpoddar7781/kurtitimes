import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createPaymentOrder, handlePaymentWebhook } from '../services/cashfree.js';
import { createShiprocketOrder } from '../services/shiprocket.js';
const router = express.Router();
const prisma = new PrismaClient();
// POST /api/payments/create - Create payment intent
router.post('/create', async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        const order = await prisma.order.findUnique({
            where: { id: orderId },
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
        if (order.status !== 'PENDING') {
            return res.status(400).json({ error: 'Order is not in pending status' });
        }
        // Create payment order with Cashfree
        const paymentData = await createPaymentOrder(order);
        // Update order with Cashfree order ID
        await prisma.order.update({
            where: { id: orderId },
            data: {
                cashfreeOrderId: paymentData.orderId,
                paymentStatus: 'PENDING'
            }
        });
        res.json({
            paymentSessionId: paymentData.paymentSessionId,
            orderId: paymentData.orderId,
            orderAmount: order.total
        });
    }
    catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment' });
    }
});
// POST /api/payments/webhook - Handle payment webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-cashfree-signature'];
        if (!signature) {
            return res.status(400).json({ error: 'Missing signature' });
        }
        const body = JSON.parse(req.body.toString());
        const result = await handlePaymentWebhook(body, signature);
        if (result.success) {
            // Update order status
            const order = await prisma.order.update({
                where: { id: result.orderId },
                data: {
                    status: 'PAID',
                    paymentStatus: 'SUCCESS',
                    paymentId: result.paymentId
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Trigger Shiprocket order creation
            try {
                if (order.shippingAddress) {
                    const shiprocketOrder = await createShiprocketOrder({
                        order_id: order.id,
                        order_date: order.createdAt.toISOString().split('T')[0],
                        pickup_location: 'Default_Pickup_Location', // Configure this
                        billing_customer_name: order.customerName,
                        billing_last_name: '',
                        billing_address: order.shippingAddress,
                        billing_address_2: '',
                        billing_city: '', // Extract from address or add to order
                        billing_pincode: '', // Extract from address or add to order
                        billing_state: '',
                        billing_country: 'India',
                        billing_email: order.customerEmail || `${order.customerPhone}@kurtitimes.com`,
                        billing_phone: order.customerPhone,
                        shipping_is_billing: true,
                        order_items: order.items.map(item => ({
                            name: item.product.name,
                            sku: item.product.id,
                            units: item.quantity,
                            selling_price: item.price
                        })),
                        payment_method: 'Prepaid',
                        sub_total: order.total,
                        length: 10,
                        breadth: 10,
                        height: 5,
                        weight: 0.5
                    });
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { shiprocketOrderId: shiprocketOrder.order_id?.toString() }
                    });
                }
            }
            catch (shiprocketError) {
                console.error('Shiprocket order creation failed:', shiprocketError);
                // Don't fail the webhook if Shiprocket fails
            }
            res.status(200).json({ received: true });
        }
        else {
            res.status(400).json({ error: result.error });
        }
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/payments/status/:orderId - Get payment status
router.get('/status/:orderId', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.orderId }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({
            orderId: order.id,
            status: order.status,
            paymentStatus: order.paymentStatus,
            cashfreeOrderId: order.cashfreeOrderId
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=payments.js.map