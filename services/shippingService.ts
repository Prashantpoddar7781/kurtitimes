// Shipping Service - Calculate shipping costs
// Can be extended to integrate with Shiprocket API later

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ShippingCost {
  amount: number;
  estimatedDays: number;
  method: string;
}

// Calculate shipping cost based on pincode and order value
export const calculateShipping = (
  pincode: string,
  orderValue: number
): ShippingCost => {
  // Basic shipping calculation
  // Can be replaced with Shiprocket API integration later
  
  // Free shipping for orders above ₹2000
  if (orderValue >= 2000) {
    return {
      amount: 0,
      estimatedDays: 3,
      method: 'Free Shipping'
    };
  }

  // Standard shipping rates based on order value
  if (orderValue >= 1500) {
    return {
      amount: 50,
      estimatedDays: 3,
      method: 'Standard Shipping'
    };
  }

  // Default shipping
  return {
    amount: 99,
    estimatedDays: 4,
    method: 'Standard Shipping'
  };
};

// Validate pincode format (Indian pincodes are 6 digits)
export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Get state suggestions based on pincode (simplified - can use API later)
export const getStateFromPincode = (pincode: string): string => {
  // This is a simplified version
  // In production, you'd use a pincode API or database
  const firstDigit = pincode.charAt(0);
  
  const stateMap: { [key: string]: string } = {
    '1': 'Delhi',
    '2': 'Uttar Pradesh',
    '3': 'Rajasthan',
    '4': 'Gujarat',
    '5': 'Karnataka',
    '6': 'Tamil Nadu',
    '7': 'West Bengal',
    '8': 'Maharashtra',
  };

  return stateMap[firstDigit] || '';
};

