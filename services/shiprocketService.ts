export interface ShiprocketAuthResponse {
  token: string;
}

export interface ShiprocketRate {
  courier_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: string;
}

export interface ShiprocketShipmentResponse {
  shipment_id: number;
  status: string;
  awb_code?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export const getShiprocketToken = async (): Promise<string> => {
  const response = await fetch('/api/shiprocket-auth');
  if (!response.ok) {
    throw new Error('Failed to authenticate with Shiprocket');
  }
  const data: ShiprocketAuthResponse = await response.json();
  return data.token;
};

export const getShippingRates = async (
  pincode: string,
  weight: number = 0.5
): Promise<ShiprocketRate[]> => {
  const token = await getShiprocketToken();
  
  const response = await fetch('/api/shiprocket-rates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pickup_pincode: '395004',
      delivery_pincode: pincode,
      weight: weight,
      cod_amount: 0,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipping rates');
  }

  return response.json();
};

export const createShipment = async (
  orderId: string,
  items: Array<{ name: string; sku: string; units: number; selling_price: number }>,
  shippingAddress: ShippingAddress,
  paymentMethod: string = 'prepaid'
): Promise<ShiprocketShipmentResponse> => {
  const token = await getShiprocketToken();
  
  const response = await fetch('/api/shiprocket-create-shipment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: orderId,
      items,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create shipment: ${error}`);
  }

  return response.json();
};

export const generateLabel = async (shipmentId: number): Promise<{ label_url: string }> => {
  const response = await fetch('/api/shiprocket-generate-label', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate label');
  }

  return response.json();
};

export const requestPickup = async (shipmentId: number): Promise<{ success: boolean }> => {
  const response = await fetch('/api/shiprocket-request-pickup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  if (!response.ok) {
    throw new Error('Failed to request pickup');
  }

  return response.json();
};

