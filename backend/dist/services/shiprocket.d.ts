interface ShiprocketOrder {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_address_2: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    order_items: Array<{
        name: string;
        sku: string;
        units: number;
        selling_price: number;
    }>;
    payment_method: string;
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}
export declare function createShiprocketOrder(orderData: ShiprocketOrder): Promise<any>;
export declare function getShiprocketOrderStatus(orderId: string): Promise<any>;
export {};
//# sourceMappingURL=shiprocket.d.ts.map