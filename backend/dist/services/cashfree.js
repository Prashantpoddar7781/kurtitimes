import axios from 'axios';
import crypto from 'crypto';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'sandbox';
const CASHFREE_DEVELOPER_ACCOUNT_ID = process.env.CASHFREE_DEVELOPER_ACCOUNT_ID;
const CASHFREE_ADMIN_ACCOUNT_ID = process.env.CASHFREE_ADMIN_ACCOUNT_ID;
const BASE_URL = CASHFREE_ENVIRONMENT === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';
export async function createPaymentOrder(order) {
    try {
        // Calculate split: 1% to developer, 99% to admin
        const developerAmount = Math.round(order.total * 0.01 * 100) / 100; // 1%
        const adminAmount = order.total - developerAmount; // 99%
        const orderId = `order_${order.id}_${Date.now()}`;
        const requestBody = {
            order_id: orderId,
            order_amount: order.total,
            order_currency: 'INR',
            customer_details: {
                customer_id: order.id,
                customer_name: order.customerName,
                customer_email: order.customerEmail || `${order.customerPhone}@kurtitimes.com`,
                customer_phone: order.customerPhone
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?order_id={order_id}`,
                notify_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payments/webhook`
            },
            // Split payment configuration
            order_splits: [
                {
                    vendor_id: CASHFREE_DEVELOPER_ACCOUNT_ID,
                    amount: developerAmount,
                    percentage: 1
                },
                {
                    vendor_id: CASHFREE_ADMIN_ACCOUNT_ID,
                    amount: adminAmount,
                    percentage: 99
                }
            ]
        };
        const response = await axios.post(`${BASE_URL}/pg/orders`, requestBody, {
            headers: {
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json'
            }
        });
        return {
            orderId: response.data.order_id,
            paymentSessionId: response.data.payment_session_id
        };
    }
    catch (error) {
        console.error('Cashfree API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
}
export async function handlePaymentWebhook(body, signature) {
    try {
        // Verify webhook signature
        const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        const expectedSignature = crypto
            .createHmac('sha256', CASHFREE_SECRET_KEY)
            .update(bodyString)
            .digest('hex');
        if (signature !== expectedSignature) {
            return { success: false, error: 'Invalid signature' };
        }
        const event = body.type || body.event;
        const data = body.data || body;
        if (event === 'PAYMENT_SUCCESS_WEBHOOK' || event === 'PAYMENT_SUCCESS') {
            const cashfreeOrderId = data.order?.order_id || data.order_id;
            // Extract our order ID from Cashfree order ID (format: order_<orderId>_<timestamp>)
            const orderIdMatch = cashfreeOrderId?.match(/order_([^_]+)_/);
            const orderId = orderIdMatch ? orderIdMatch[1] : null;
            return {
                success: true,
                orderId: orderId,
                paymentId: data.payment?.payment_id || data.payment_id
            };
        }
        return { success: false, error: 'Unhandled event type' };
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        return { success: false, error: error.message };
    }
}
export async function getPaymentStatus(orderId) {
    try {
        const response = await axios.get(`${BASE_URL}/pg/orders/${orderId}`, {
            headers: {
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
                'x-api-version': '2023-08-01'
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('Cashfree status check error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
}
//# sourceMappingURL=cashfree.js.map