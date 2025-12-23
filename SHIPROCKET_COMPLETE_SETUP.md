# 🚚 Complete Shiprocket Integration Guide

## ✅ What's Been Set Up

I've integrated Shiprocket to automatically:
1. ✅ Create shipments after payment
2. ✅ Generate shipping labels (AWB)
3. ✅ Request pickups from courier
4. ✅ Track shipments

## 🔧 Setup Required in Shiprocket Dashboard

### Step 1: Set Up Pickup Location

**This is CRITICAL - Shiprocket needs to know where to pick up from!**

1. **Log in to Shiprocket Dashboard:**
   - Go to https://app.shiprocket.in
   - Log in

2. **Add Pickup Location:**
   - Go to **Settings** → **Pickup Locations**
   - Click **"+ Add New Pickup Location"**
   - Fill in your warehouse/store details:
     - **Name:** Your location name (e.g., "Kurti Times Warehouse")
     - **Contact Person:** Your name
     - **Phone:** Your phone number
     - **Email:** Your email
     - **Address:** Complete address
     - **Pincode:** Your pincode
     - **City:** Your city
     - **State:** Your state
   - Click **"Save"**

3. **Note the Location Name:**
   - Remember the exact name you gave (e.g., "Kurti Times Warehouse")
   - This will be used in the code

### Step 2: Update Environment Variable

Add your pickup location name to Vercel:

1. **Go to Vercel Dashboard:**
   - Settings → Environment Variables

2. **Add Variable:**
   - Name: `SHIPROCKET_PICKUP_LOCATION`
   - Value: `Your Location Name` (exact name from Step 1)
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **Redeploy**

### Step 3: Configure Package Details

Update package dimensions in code (if needed):

Edit `components/CartModal.tsx` around line 120:

```typescript
length: 20,  // Package length in cm
breadth: 15, // Package width in cm
height: 5,   // Package height in cm
weight: Math.max(0.5, cartItems.length * 0.3), // Weight in kg
```

Adjust based on your actual package sizes.

## 🔄 How It Works - Complete Flow

### 1. Customer Places Order
- Customer adds items to cart
- Fills shipping address
- Completes payment via Razorpay

### 2. Payment Success
- Payment verified on backend
- Order details prepared

### 3. Shiprocket Shipment Created
- Automatically creates shipment in Shiprocket
- Gets AWB (Airway Bill) code
- Assigns courier

### 4. Shipping Label Generated
- Label (AWB) generated automatically
- Can be downloaded from Shiprocket dashboard
- Print and attach to package

### 5. Pickup Requested
- Pickup automatically requested from courier
- Courier will come to your pickup location
- You'll get notification

### 6. Order Tracking
- Customer gets tracking number
- Can track on Shiprocket website
- Updates sent automatically

## 📋 What Happens After Payment

When a customer completes payment:

1. **Shipment Created:**
   - Order created in Shiprocket
   - Shipment ID generated
   - AWB code assigned

2. **WhatsApp Message Sent:**
   - Includes shipment ID
   - Includes AWB code
   - Includes courier name
   - Includes tracking link

3. **You Get Notification:**
   - Check Shiprocket dashboard
   - See new order
   - Download label
   - Courier will pick up

## 🖨️ Printing Labels & Preparing Packages

### Option 1: From Shiprocket Dashboard

1. **Go to Shipments:**
   - Dashboard → Shipments
   - Find your order

2. **Download Label:**
   - Click on shipment
   - Click "Download Label"
   - Print on A4 paper

3. **Attach to Package:**
   - Stick label on package
   - Ensure barcode is clear

### Option 2: Automatic (After Integration)

The system can automatically:
- Generate label after shipment creation
- Send label URL to you via WhatsApp
- You download and print

## 🚚 Courier Pickup

### Automatic Pickup Request

After shipment is created:
- Pickup automatically requested
- Courier assigned
- Pickup scheduled (usually next day)

### Manual Pickup (If Needed)

1. **Go to Shipments:**
   - Find your shipment
   - Click "Request Pickup"
   - Courier will come

### What to Prepare

Before courier arrives:
- ✅ Package ready with items
- ✅ Label printed and attached
- ✅ Package sealed
- ✅ Invoice copy inside (optional)

## 📊 Tracking Orders

### For You (Admin):

1. **Shiprocket Dashboard:**
   - Go to Shipments
   - See all orders
   - Track status

2. **Status Updates:**
   - Pending Pickup
   - In Transit
   - Out for Delivery
   - Delivered

### For Customers:

1. **Tracking Link:**
   - Sent via WhatsApp
   - Can track on Shiprocket website
   - Real-time updates

## ⚙️ Configuration Checklist

- [ ] Shiprocket API user created
- [ ] API credentials in Vercel environment variables
- [ ] Pickup location added in Shiprocket
- [ ] Pickup location name in Vercel environment variable
- [ ] Package dimensions configured
- [ ] Test order placed
- [ ] Shipment created successfully
- [ ] Label downloaded
- [ ] Pickup requested

## 🧪 Testing

1. **Place Test Order:**
   - Add items to cart
   - Complete checkout
   - Use test payment

2. **Check Shiprocket:**
   - Go to Shipments
   - Verify order appears
   - Check AWB code

3. **Verify Details:**
   - Customer address correct
   - Items listed correctly
   - Weight/dimensions correct

## 🔧 Troubleshooting

### Shipment Not Created?

1. **Check API Credentials:**
   - Verify in Vercel environment variables
   - Test authentication

2. **Check Pickup Location:**
   - Must exist in Shiprocket
   - Name must match exactly

3. **Check Logs:**
   - Vercel function logs
   - Look for errors

### Courier Not Picking Up?

1. **Check Pickup Request:**
   - Go to Shipments
   - Verify pickup requested
   - Check status

2. **Contact Courier:**
   - Use Shiprocket support
   - They'll coordinate pickup

### Label Not Generated?

1. **Wait a Few Minutes:**
   - Label generation takes time
   - Refresh dashboard

2. **Manual Generation:**
   - Go to shipment
   - Click "Generate Label"

## 📞 Support

- **Shiprocket Support:** support@shiprocket.in
- **Dashboard:** https://app.shiprocket.in
- **API Docs:** https://apidocs.shiprocket.in/

## 🎯 Next Steps

1. ✅ Set up pickup location in Shiprocket
2. ✅ Add pickup location name to Vercel
3. ✅ Test with a real order
4. ✅ Verify shipment creation
5. ✅ Print label and prepare package
6. ✅ Courier will pick up automatically!

---

**Once pickup location is set, Shiprocket will automatically handle everything!** 🚀

