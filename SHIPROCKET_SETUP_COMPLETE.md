# 🚚 Complete Shiprocket Setup Guide

## Overview

Shiprocket is already integrated in your code! You just need to:
1. Create a Shiprocket account
2. Create an API user
3. Set up pickup location
4. Add credentials to Vercel

## Step 1: Create Shiprocket Account

1. **Go to Shiprocket:**
   - Visit https://www.shiprocket.in
   - Click **"Sign Up"** or **"Get Started"**

2. **Sign Up:**
   - Enter your business email
   - Create a password
   - Enter business details (name, phone, etc.)
   - Complete KYC verification (similar to Cashfree)

3. **Verify Your Account:**
   - Check your email for verification link
   - Complete KYC documents if required
   - Wait for account activation (usually quick)

## Step 2: Create API User (For API Access)

Shiprocket uses **API Users** instead of API keys. You need to create a dedicated API user.

### Step 2.1: Navigate to API Users

1. **Log in to Shiprocket Dashboard:**
   - Go to https://app.shiprocket.in
   - Log in with your account

2. **Go to API Users:**
   - Click **Settings** (gear icon in left sidebar)
   - Click **"Additional Settings"** in the left menu
   - Click **"API Users"**
   
   **Direct Link:** https://app.shiprocket.in/sellers/settings/additional-settings/api-users

### Step 2.2: Create New API User

1. **Click "+ Add New API User" button**

2. **Fill in the form:**
   
   **Email ID:** (Required)
   - Enter a unique email address
   - Can be different from your main account email
   - Example: `api@kurtitimes.com` or `shiprocket-api@yourdomain.com`
   - ⚠️ Must be unique (not already registered in Shiprocket)
   
   **Allowed IPs for PII Access:** (Optional)
   - Leave empty for now (can add later for security)
   - Or add your server IPs if you know them
   
   **Select Modules to Access:**
   - ✅ **Orders (create, update)** - Required
   - ✅ **Shipments** - Required
   - ✅ **Courier** - Required (for shipping rates)
   - ⚠️ **Settings** - Optional
   - ⚠️ **Listings** - Optional

3. **Click "Apply" button**
   - API user will be created
   - You'll receive an email with the password
   - **Save this email and password!**

### Step 2.3: Get Your Credentials

After creating the API user:

1. **Email:** The email you entered in the form
2. **Password:** 
   - Check your email inbox (Shiprocket sends password via email)
   - If not received, check spam folder
   - Or click "Reset Password" in the API Users list

**Note these credentials:**
- `SHIPROCKET_EMAIL` = The email you entered
- `SHIPROCKET_PASSWORD` = The password from email

## Step 3: Set Up Pickup Location

**This is CRITICAL!** Shiprocket needs to know where to pick up packages from.

### Step 3.1: Add Pickup Location

1. **In Shiprocket Dashboard:**
   - Go to **Settings** → **Pickup Locations**
   - Or direct link: https://app.shiprocket.in/sellers/settings/pickup-locations

2. **Click "+ Add New Pickup Location"**

3. **Fill in your warehouse/store details:**
   - **Name:** Your location name (e.g., "Kurti Times Warehouse" or "Main Store")
   - **Contact Person:** Your name
   - **Phone:** Your phone number
   - **Email:** Your email
   - **Address:** Complete address (Line 1)
   - **Address Line 2:** (Optional)
   - **Pincode:** Your pincode
   - **City:** Your city
   - **State:** Your state
   - **Country:** India

4. **Click "Save"**

5. **Note the Location Name:**
   - Remember the **exact name** you gave (e.g., "Kurti Times Warehouse")
   - This will be used in the code

## Step 4: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project: **kurtitimes**

2. **Go to Environment Variables:**
   - Click **Settings** → **Environment Variables**

3. **Add these 3 variables:**

   **Variable 1:**
   - Name: `SHIPROCKET_EMAIL`
   - Value: `your-api-user-email@example.com` (the email you created in Step 2)
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `SHIPROCKET_PASSWORD`
   - Value: `password-from-email` (the password for API user)
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 3:**
   - Name: `SHIPROCKET_PICKUP_LOCATION`
   - Value: `Your Location Name` (exact name from Step 3, e.g., "Kurti Times Warehouse")
   - Environments: ✅ Production ✅ Preview ✅ Development

4. **Click "Save"** after adding each variable

5. **Redeploy your application:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger auto-deploy

## Step 5: Update Pickup Location in Code (If Needed)

The code currently uses `'Default'` as pickup location. If your location name is different, update it:

1. **Open:** `components/CartModal.tsx`
2. **Find line ~109:** `pickup_location: 'Default',`
3. **Update to:** `pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Default',`

Or keep it as `'Default'` if that's what you named your pickup location in Shiprocket.

## Step 6: Test the Integration

After adding credentials and redeploying:

1. **Test with a real order:**
   - Add items to cart
   - Go to checkout
   - Fill shipping address
   - Complete payment (or test payment)
   - Check if shipment is created in Shiprocket dashboard

2. **Check Shiprocket Dashboard:**
   - Go to https://app.shiprocket.in
   - Navigate to **Orders** or **Shipments**
   - You should see the order created automatically

## How It Works - Complete Flow

### 1. Customer Places Order
- Customer adds items to cart
- Fills shipping address
- Completes payment

### 2. Payment Success
- Payment is verified
- Order details are prepared

### 3. Shiprocket Shipment Created
- Automatically creates shipment in Shiprocket
- Gets AWB (Airway Bill) number
- Generates shipping label

### 4. Courier Pickup
- Shiprocket assigns courier
- Courier picks up from your pickup location
- Package is shipped to customer

### 5. Tracking
- Customer receives tracking number
- Can track on Shiprocket website
- You can track in Shiprocket dashboard

## What Gets Created Automatically

When a customer completes payment, the code automatically:

1. ✅ Creates shipment in Shiprocket
2. ✅ Generates AWB (tracking number)
3. ✅ Creates shipping label
4. ✅ Requests pickup from courier
5. ✅ Sends tracking info to customer (via WhatsApp)

## Troubleshooting

### Error: "Shiprocket credentials not configured"

**Solution:**
- ✅ Check that `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` are set in Vercel
- ✅ Make sure variables are added to all environments
- ✅ Redeploy after adding variables

### Error: "Shiprocket authentication failed"

**Solution:**
- ✅ Verify API user email and password are correct
- ✅ Check if API user is Active in Shiprocket dashboard
- ✅ Verify required modules are selected (Orders, Shipments, Courier)
- ✅ Test credentials manually (see test section below)

### Error: "Pickup location not found"

**Solution:**
- ✅ Verify pickup location name matches exactly in Shiprocket
- ✅ Check `SHIPROCKET_PICKUP_LOCATION` environment variable
- ✅ Ensure pickup location is Active in Shiprocket dashboard

### Shipment Not Created

**Solution:**
- ✅ Check Shiprocket dashboard for errors
- ✅ Verify all required fields are filled (address, phone, etc.)
- ✅ Check browser console for errors
- ✅ Verify API user has "Orders (create, update)" module access

## Test API Credentials

After creating API user, test if credentials work:

```bash
# Test API login
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-api-user-email@example.com",
    "password": "your-api-password"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

If you get a token, your credentials are working! ✅

## Package Details (Default Values)

The code uses these default package dimensions:
- **Length:** 20 cm
- **Width:** 15 cm
- **Height:** 5 cm
- **Weight:** 0.5 kg (minimum) or calculated based on items

You can update these in `components/CartModal.tsx` if needed.

## Quick Checklist

- [ ] Shiprocket account created and verified
- [ ] API user created (Settings → Additional Settings → API Users)
- [ ] API user email and password saved
- [ ] Pickup location added (Settings → Pickup Locations)
- [ ] Pickup location name noted
- [ ] `SHIPROCKET_EMAIL` added to Vercel
- [ ] `SHIPROCKET_PASSWORD` added to Vercel
- [ ] `SHIPROCKET_PICKUP_LOCATION` added to Vercel
- [ ] Application redeployed
- [ ] Test order placed
- [ ] Shipment verified in Shiprocket dashboard

## Support

- **Shiprocket Support:** support@shiprocket.in
- **Shiprocket Dashboard:** https://app.shiprocket.in
- **API Documentation:** https://apidocs.shiprocket.in/
- **Help Center:** https://support.shiprocket.in/

## Important Notes

1. **API User vs Main Account:**
   - Use API user credentials for environment variables
   - Don't use your main Shiprocket account email/password
   - API user is specifically for API access

2. **Pickup Location:**
   - Must be set up before shipments can be created
   - Name must match exactly (case-sensitive)
   - Can have multiple pickup locations

3. **Module Access:**
   - Ensure "Orders (create, update)" is selected
   - Ensure "Shipments" is selected
   - Ensure "Courier" is selected

4. **Environment Variables:**
   - Add to all environments (Production, Preview, Development)
   - Redeploy after adding variables
   - Never commit credentials to code

---

**Once all steps are complete, Shiprocket will automatically handle all shipping!** 🚀
