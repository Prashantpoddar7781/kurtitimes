import axios from 'axios';
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_API_URL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in';
let authToken = null;
let tokenExpiry = 0;
async function getAuthToken() {
    // Check if token is still valid (with 5 minute buffer)
    if (authToken && Date.now() < tokenExpiry - 300000) {
        return authToken;
    }
    try {
        const response = await axios.post(`${SHIPROCKET_API_URL}/v1/external/auth/login`, {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD
        });
        const token = response.data.token;
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid token received from Shiprocket');
        }
        authToken = token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        return authToken;
    }
    catch (error) {
        console.error('Shiprocket auth error:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Shiprocket');
    }
}
export async function createShiprocketOrder(orderData) {
    try {
        const token = await getAuthToken();
        const response = await axios.post(`${SHIPROCKET_API_URL}/v1/external/orders/create/adhoc`, orderData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('Shiprocket order creation error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create Shiprocket order');
    }
}
export async function getShiprocketOrderStatus(orderId) {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${SHIPROCKET_API_URL}/v1/external/orders/show/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('Shiprocket status check error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to get Shiprocket order status');
    }
}
//# sourceMappingURL=shiprocket.js.map