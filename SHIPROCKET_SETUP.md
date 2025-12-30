# Shiprocket Setup Guide

This guide will help you configure Shiprocket for automated shipping and order fulfillment.

## Step 1: Get Shiprocket API Credentials

1. **Sign up/Login to Shiprocket**
   - Go to [https://www.shiprocket.in](https://www.shiprocket.in)
   - Create an account or login with your existing account

2. **Get API Credentials**
   - Go to **Settings** → **API** (or **Developer** section)
   - You'll find:
     - **Email**: Your Shiprocket account email
     - **Password**: Your Shiprocket account password (or API password if separate)

3. **Set Up Pickup Location (Warehouse Address)**
   - Go to **Settings** → **Pickup Locations**
   - Add your warehouse/pickup address:
     - Name: Kurti Times (or your business name)
     - Address Line 1: G-11-12, RAJHANS IMPERIA
     - Address Line 2: RING ROAD
     - City: Surat
     - State: Gujarat
     - Pincode: 395004
     - Phone: 9892794421
   - Mark this as your **Primary** pickup location

## Step 2: Configure Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project: [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project: **kurti-times**

2. **Go to Settings → Environment Variables**

3. **Add the following variables:**

   ```
   SHIPROCKET_EMAIL=your-shiprocket-email@example.com
   SHIPROCKET_PASSWORD=your-shiprocket-password
   SHIPROCKET_PICKUP_NAME=Kurti Times
   SHIPROCKET_PICKUP_PHONE=9892794421
   SHIPROCKET_PICKUP_ADDRESS_LINE1=G-11-12, RAJHANS IMPERIA
   SHIPROCKET_PICKUP_ADDRESS_LINE2=RING ROAD
   SHIPROCKET_PICKUP_CITY=Surat
   SHIPROCKET_PICKUP_STATE=Gujarat
   SHIPROCKET_PICKUP_PINCODE=395004
   ```

4. **Important Notes:**
   - Replace all placeholder values with your actual details
   - Make sure the pickup address matches exactly what you set in Shiprocket dashboard
   - Set these for **Production**, **Preview**, and **Development** environments

5. **Redeploy your application**
   - After adding environment variables, go to **Deployments**
   - Click **Redeploy** on your latest deployment

## Step 3: Test the Integration

1. **Test Shipping Rates**
   - Add items to cart
   - Go to checkout
   - Enter a delivery pincode
   - Shipping cost should be calculated automatically

2. **Test Order Creation**
   - Complete a test order
   - Check Shiprocket dashboard for the order
   - Verify pickup location is correct

## Step 4: Configure Courier Services (Optional)

1. **Go to Shiprocket Dashboard → Courier Services**
2. **Enable courier services** you want to use:
   - Standard couriers (DTDC, Delhivery, etc.)
   - Express couriers (BlueDart, FedEx, etc.)
3. **Set up COD (Cash on Delivery)** if needed
4. **Configure shipping zones** and rates

## Step 5: Automate Pickup Requests

After an order is placed:
1. Shiprocket will automatically create a shipment
2. You can manually request pickup from Shiprocket dashboard
3. Or set up automatic pickup requests in Shiprocket settings

## Troubleshooting

### Issue: "Authentication failed"
- **Solution**: Check that `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` are correct
- Make sure you're using the account password, not API password (unless Shiprocket provides separate API credentials)

### Issue: "No courier service available"
- **Solution**: 
  - Check that pickup location is set correctly
  - Verify pincode is serviceable
  - Enable more courier services in Shiprocket dashboard

### Issue: "Failed to create shipment"
- **Solution**:
  - Verify all pickup address environment variables are set
  - Check that pickup location exists in Shiprocket dashboard
  - Ensure order data is valid

## Support

For Shiprocket-specific issues:
- Shiprocket Support: support@shiprocket.in
- Shiprocket Documentation: [https://apidocs.shiprocket.in](https://apidocs.shiprocket.in)

