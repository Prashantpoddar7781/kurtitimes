# 📦 Shipping Setup Guide

## ✅ Current Implementation

I've added **basic shipping functionality** with:

1. **Shipping Address Collection:**
   - Address Line 1 (required)
   - Address Line 2 (optional)
   - City (required)
   - State (required)
   - Pincode (required, 6 digits)

2. **Shipping Cost Calculation:**
   - **Free shipping** for orders ₹3000 and above
   - **₹60 delivery charges** for orders below ₹3000
   - Estimated delivery: 3-4 days

3. **Features:**
   - Real-time shipping cost calculation
   - Pincode validation
   - Shipping address included in order confirmation
   - Shipping cost added to total payment

## 🚀 Upgrade to Shiprocket (Recommended)

For production, you should integrate with **Shiprocket** for:
- ✅ Real-time shipping rates
- ✅ Multiple courier options
- ✅ Automatic label generation
- ✅ Order tracking
- ✅ Better delivery estimates

### Why Shiprocket?

- **Better API:** More developer-friendly than Delhivery
- **Multiple Couriers:** Access to 17+ courier partners
- **Real-time Rates:** Accurate shipping costs
- **Easy Integration:** Well-documented API
- **Order Management:** Built-in dashboard

### Shiprocket Integration Steps:

1. **Sign up for Shiprocket:**
   - Go to https://www.shiprocket.in
   - Create an account
   - Complete KYC verification

2. **Get API Credentials:**
   - Go to Settings → API Settings
   - Generate API Key and Secret
   - Add to Vercel environment variables

3. **Update Shipping Service:**
   - Replace `calculateShipping()` function
   - Call Shiprocket API for real rates
   - Handle multiple courier options

4. **Add Order Creation:**
   - After payment, create shipment in Shiprocket
   - Get tracking number
   - Send tracking info to customer

## 📋 Current Shipping Rates

| Order Value | Shipping Cost | Delivery Time |
|------------|---------------|---------------|
| ₹3000+ | FREE | 3 days |
| Below ₹3000 | ₹60 | 4 days |

## 🔧 How to Update Shipping Rates

Edit `services/shippingService.ts`:

```typescript
export const calculateShipping = (
  pincode: string,
  orderValue: number
): ShippingCost => {
  // Update your rates here
  if (orderValue >= 3000) {
    return {
      amount: 0,
      estimatedDays: 3,
      method: 'Free Shipping'
    };
  }
  // ... add more conditions
};
```

## 📝 What's Included in Orders

When a customer completes payment, the WhatsApp message includes:
- ✅ Customer details (name, phone, email)
- ✅ Complete shipping address
- ✅ Order items with sizes
- ✅ Subtotal
- ✅ Shipping cost
- ✅ Total amount paid

## 🔄 Future Enhancements

1. **Shiprocket Integration:**
   - Real-time shipping rates
   - Multiple courier selection
   - Automatic tracking

2. **Address Autocomplete:**
   - Use Google Places API
   - Auto-fill city/state from pincode

3. **Multiple Shipping Options:**
   - Standard (3-4 days)
   - Express (1-2 days)
   - Same-day delivery (select cities)

4. **Order Tracking:**
   - Send tracking link after shipment
   - SMS/Email notifications

## 📞 Support

- **Shiprocket:** https://www.shiprocket.in/support
- **Delhivery:** https://www.delhivery.com/support

---

**Current Status:** Basic shipping with flat rates  
**Next Step:** Integrate Shiprocket for production-ready shipping

