// Shiprocket Service for Frontend
// Handles shipping rate calculation and shipment creation

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ShippingRate {
  available: boolean;
  cost: number;
  estimatedDays: number;
  courier?: string;
  message?: string;
}

export interface ShipmentResponse {
  success: boolean;
  shipmentId?: string;
  awbCode?: string;
  channelOrderId?: string;
  error?: string;
}

// Get shipping rates for a pincode
export const getShippingRates = async (
  pincode: string,
  weight: number = 0.5
): Promise<ShippingRate> => {
  try {
    const response = await fetch('/api/shiprocket-rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pincode, weight }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get shipping rates');
    }

    return data;
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return {
      available: false,
      cost: 0,
      estimatedDays: 0,
      message: error instanceof Error ? error.message : 'Failed to calculate shipping',
    };
  }
};

// Create shipment in Shiprocket
export const createShipment = async (
  orderId: string,
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  shippingAddress: ShippingAddress,
  orderItems: Array<{ id: number; name: string; quantity: number; price: number }>,
  paymentMethod: string,
  orderAmount: number
): Promise<ShipmentResponse> => {
  try {
    const response = await fetch('/api/shiprocket-create-shipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        orderItems,
        paymentMethod,
        orderAmount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create shipment');
    }

    return {
      success: true,
      shipmentId: data.shipmentId,
      awbCode: data.awbCode,
      channelOrderId: data.channelOrderId,
    };
  } catch (error) {
    console.error('Error creating shipment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create shipment',
    };
  }
};

// Generate shipping label
export const generateLabel = async (shipmentId: string): Promise<{ success: boolean; labelUrl?: string; error?: string }> => {
  try {
    const response = await fetch('/api/shiprocket-generate-label', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shipmentId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate label');
    }

    return {
      success: true,
      labelUrl: data.labelUrl,
    };
  } catch (error) {
    console.error('Error generating label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate label',
    };
  }
};

// Request pickup
export const requestPickup = async (shipmentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/shiprocket-request-pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shipmentId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to request pickup');
    }

    return { success: true };
  } catch (error) {
    console.error('Error requesting pickup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request pickup',
    };
  }
};

