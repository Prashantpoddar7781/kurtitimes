interface PaymentOrder {
    orderId: string;
    paymentSessionId: string;
}
interface Order {
    id: string;
    total: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
}
export declare function createPaymentOrder(order: Order): Promise<PaymentOrder>;
export declare function handlePaymentWebhook(body: any, signature: string): Promise<{
    success: boolean;
    orderId?: string;
    paymentId?: string;
    error?: string;
}>;
export declare function getPaymentStatus(orderId: string): Promise<any>;
export {};
//# sourceMappingURL=cashfree.d.ts.map