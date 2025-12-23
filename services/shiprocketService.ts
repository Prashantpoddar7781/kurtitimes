// Shiprocket Service - Handle shipping operations
// This service handles creating shipments, getting rates, and scheduling pickups

export interface ShiprocketAuthResponse {
  token: string;
  expires_in: number;
}

export interface ShippingRate {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: number;
  estimated_delivery_date: string;
}

export interface CreateShipmentRequest {
  order_id: string; // Your internal order ID
  order_date: string; // ISO date string
  pickup_location: string; // Your pickup location name in Shiprocket
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name: string;
  shipping_last_name: string;
  shipping_address: string;
  shipping_address_2?: string;
  shipping_city: string;
  shipping_pincode: string;
  shipping_state: string;
  shipping_country: string;
  shipping_email: string;
  shipping_phone: string;
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

export interface ShipmentResponse {
  status: number;
  message: string;
  shipment_id: number;
  awb_code: string;
  courier_name: string;
  order_id: string;
}

// Get authentication token from Shiprocket
export const getShiprocketToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/shiprocket/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Shiprocket');
    }

    const data: ShiprocketAuthResponse = await response.json();
    return data.token;
  } catch (error: any) {
    throw new Error(`Shiprocket authentication failed: ${error.message}`);
  }
};

// Get shipping rates
export const getShippingRates = async (
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  codAmount?: number
): Promise<ShippingRate[]> => {
  try {
    const token = await getShiprocketToken();

    const response = await fetch('/api/shiprocket/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickup_pincode: pickupPincode,
        delivery_pincode: deliveryPincode,
        weight: weight,
        cod_amount: codAmount || 0,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get shipping rates');
    }

    const data = await response.json();
    return data.rate || [];
  } catch (error: any) {
    throw new Error(`Failed to get shipping rates: ${error.message}`);
  }
};

// Create shipment in Shiprocket
export const createShipment = async (
  shipmentData: CreateShipmentRequest
): Promise<ShipmentResponse> => {
  try {
    const token = await getShiprocketToken();

    const response = await fetch('/api/shiprocket/create-shipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(shipmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create shipment');
    }

    const data: ShipmentResponse = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(`Failed to create shipment: ${error.message}`);
  }
};

// Generate shipping label (AWB)
export const generateLabel = async (shipmentId: number): Promise<string> => {
  try {
    const token = await getShiprocketToken();

    const response = await fetch('/api/shiprocket/generate-label', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: shipmentId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate label');
    }

    const data = await response.json();
    return data.label_url || '';
  } catch (error: any) {
    throw new Error(`Failed to generate label: ${error.message}`);
  }
};

// Request pickup
export const requestPickup = async (shipmentId: number): Promise<boolean> => {
  try {
    const token = await getShiprocketToken();

    const response = await fetch('/api/shiprocket/request-pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: shipmentId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to request pickup');
    }

    return true;
  } catch (error: any) {
    throw new Error(`Failed to request pickup: ${error.message}`);
  }
};

// Track shipment
export const trackShipment = async (awbCode: string): Promise<any> => {
  try {
    const token = await getShiprocketToken();

    const response = await fetch(`/api/shiprocket/track/${awbCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to track shipment');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to track shipment: ${error.message}`);
  }
};

