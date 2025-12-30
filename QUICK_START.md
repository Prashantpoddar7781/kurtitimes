# Quick Start Guide - Environment Variables Setup

This is a quick reference for setting up environment variables in Vercel.

## Step 1: Access Vercel Environment Variables

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **kurti-times**
3. Click **Settings** → **Environment Variables**

## Step 2: Add Shiprocket Variables

Copy and paste these, replacing with your actual values:

```
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
SHIPROCKET_PICKUP_NAME=Kurti Times
SHIPROCKET_PICKUP_PHONE=9892794421
SHIPROCKET_PICKUP_ADDRESS_LINE1=G-11-12, RAJHANS IMPERIA
SHIPROCKET_PICKUP_ADDRESS_LINE2=RING ROAD
SHIPROCKET_PICKUP_CITY=Surat
SHIPROCKET_PICKUP_STATE=Gujarat
SHIPROCKET_PICKUP_PINCODE=395004
```

## Step 3: Add Cashfree Variables

Copy and paste these, replacing with your actual values:

```
CASHFREE_APP_ID=merchant-app-id
CASHFREE_SECRET_KEY=merchant-secret-key
CASHFREE_MERCHANT_ACCOUNT_ID=admin-account-id-99-percent
CASHFREE_DEVELOPER_ACCOUNT_ID=your-account-id-1-percent
CASHFREE_ENV=PRODUCTION
FRONTEND_URL=https://kurtitimes.vercel.app
BACKEND_URL=https://kurtitimes.vercel.app
```

## Step 4: Set Environment Scope

- Select **Production**, **Preview**, and **Development** for all variables
- Click **Save**

## Step 5: Redeploy

1. Go to **Deployments**
2. Click **Redeploy** on latest deployment

## Where to Get Values

### Shiprocket:
- Email/Password: Your Shiprocket login credentials
- Address: Admin's warehouse address

### Cashfree:
- App ID/Secret Key: From Merchant Account → Developer → API Keys
- Merchant Account ID: From Merchant Account → Settings → Account Details
- Developer Account ID: From Your Account → Settings → Account Details

## Testing

1. Set `CASHFREE_ENV=TEST` for testing
2. Test with card: `4111 1111 1111 1111`
3. Set `CASHFREE_ENV=PRODUCTION` for live

For detailed setup, see `COMPLETE_SETUP_GUIDE.md`

