# Cashfree Payment Gateway Setup - 2% Developer / 98% Admin Split

## Overview

This app uses **Cashfree** payment gateway with automatic split payment functionality:
- **98%** goes to the merchant/admin account (registered on Cashfree)
- **2%** automatically goes to your developer account as commission

## Quick Setup Steps

### Step 1: Create Two Cashfree Accounts

You need **TWO separate Cashfree accounts** with **different email addresses**:

#### Account 1: Admin/Merchant Account (98% recipient)
- **Who:** The business owner/admin
- **Email:** Use business email (different from developer email)
- **PAN:** Business PAN number
- **Purpose:** This account will receive 98% of all payments
- **Steps:**
  1. Go to https://www.cashfree.com/
  2. Click **"Sign Up"** or **"Get Started"**
  3. Sign up with business email and business PAN
  4. Complete KYC verification
  5. Get Account ID: **Settings → Account Details → Copy Account ID**
  6. Get API Keys: **Settings → Developer → API Keys**
     - Copy **App ID** (Client ID)
     - Copy **Secret Key** (Client Secret)

#### Account 2: Developer Account (2% commission recipient)
- **Who:** You (the developer)
- **Email:** Your personal email
- **PAN:** Your Individual PAN
- **Purpose:** This account will receive 2% commission automatically
- **Steps:**
  1. Go to https://www.cashfree.com/
  2. Sign up with your personal email and individual PAN
  3. Complete KYC verification
  4. Get Account ID: **Settings → Account Details → Copy Account ID**

### Step 2: Get Required Information

From **Admin/Merchant Account**:
- ✅ `CASHFREE_APP_ID` - From Settings → Developer → API Keys
- ✅ `CASHFREE_SECRET_KEY` - From Settings → Developer → API Keys
- ✅ `CASHFREE_MERCHANT_ACCOUNT_ID` - From Settings → Account Details

From **Developer Account**:
- ✅ `CASHFREE_DEVELOPER_ACCOUNT_ID` - From Settings → Account Details

### Step 3: Configure Vercel Environment Variables

1. Go to your **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **kurtitimes**
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
CASHFREE_APP_ID=your_app_id_from_merchant_account
CASHFREE_SECRET_KEY=your_secret_key_from_merchant_account
CASHFREE_ENV=sandbox
CASHFREE_MERCHANT_ACCOUNT_ID=merchant_account_id_here
CASHFREE_DEVELOPER_ACCOUNT_ID=your_developer_account_id_here
```

**Important Notes:**
- Use `CASHFREE_ENV=sandbox` for testing
- Use `CASHFREE_ENV=production` for live payments
- Make sure to add these to **Production**, **Preview**, and **Development** environments
- Click **Save** after adding all variables
- **Redeploy** your application after adding variables

### Step 4: Configure Webhook (Optional but Recommended)

1. In **Admin/Merchant Cashfree Dashboard**, go to **Settings** → **Webhooks**
2. Add webhook URL: `https://kurtitimes.vercel.app/api/cashfree-webhook`
3. Select events:
   - ✅ `PAYMENT_SUCCESS_WEBHOOK`
   - ✅ `PAYMENT_FAILED_WEBHOOK`
   - ✅ `PAYMENT_USER_DROPPED_WEBHOOK`

## How Split Payment Works

When a customer makes a payment of ₹1000:

1. **Payment comes in** → Goes to Cashfree
2. **Our code automatically calculates:**
   - 98% = ₹980 → Admin/Merchant account
   - 2% = ₹20 → Developer account
3. **Cashfree automatically splits and transfers:**
   - ₹980 → Admin's Cashfree account → Admin's bank
   - ₹20 → Developer's Cashfree account → Developer's bank

**No manual intervention needed!** The split happens automatically for every payment.

## Testing

### Test Mode (Sandbox)

1. Set `CASHFREE_ENV=sandbox` in Vercel
2. Use test credentials from Cashfree Dashboard
3. Test with these cards:

**Success Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**Failure Card:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Production Mode

1. Set `CASHFREE_ENV=production` in Vercel
2. Use production credentials from Cashfree Dashboard
3. Both accounts must be fully verified and active
4. Test with a small real payment first

## Troubleshooting

### Error: "Payment failed: Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY"

**Solution:**
- ✅ Check that all environment variables are set in Vercel
- ✅ Make sure variables are added to all environments (Production, Preview, Development)
- ✅ Redeploy the application after adding variables
- ✅ Verify variable names are exactly as shown (case-sensitive)

### Error: "Split payments not working"

**Solution:**
- ✅ Ensure both `CASHFREE_MERCHANT_ACCOUNT_ID` and `CASHFREE_DEVELOPER_ACCOUNT_ID` are set
- ✅ Verify both accounts are active and verified in Cashfree
- ✅ Check that both Account IDs are correct (no extra spaces)

### Payment goes through but split doesn't happen

**Solution:**
- ✅ Verify both Account IDs are correct
- ✅ Check Cashfree Dashboard → Settings → Account Details for correct Account IDs
- ✅ Ensure both accounts are in the same environment (both sandbox or both production)
- ✅ Contact Cashfree support if marketplace/split features need to be enabled

## Important Notes

1. **Two Separate Accounts Required:**
   - Admin account: Business email + Business PAN
   - Developer account: Personal email + Personal PAN
   - Accounts cannot share the same email address

2. **Account IDs are Different from API Keys:**
   - Account ID = Found in Settings → Account Details
   - API Keys = Found in Settings → Developer → API Keys
   - You need BOTH Account IDs and API Keys

3. **Environment Matching:**
   - If using sandbox, both accounts should be in sandbox mode
   - If using production, both accounts should be in production mode
   - Mixing environments will cause errors

4. **Fees:**
   - Cashfree charges transaction fees on the total amount
   - The split (98% + 2%) happens after fees are deducted
   - Example: ₹1000 payment → ~₹30 fee → ₹970 split → ₹950.60 (98%) + ₹19.40 (2%)

## Support

- **Cashfree Documentation:** https://docs.cashfree.com/
- **Cashfree Support:** support@cashfree.com
- **Cashfree Dashboard:** https://merchant.cashfree.com/

## Verification Checklist

Before going live, verify:

- [ ] Admin account created and verified
- [ ] Developer account created and verified
- [ ] All environment variables set in Vercel
- [ ] Webhook configured (optional)
- [ ] Tested with sandbox/test mode
- [ ] Both Account IDs are correct
- [ ] API Keys are from admin account
- [ ] Application redeployed after adding variables
- [ ] Test payment successful
- [ ] Split payment verified in both Cashfree dashboards
