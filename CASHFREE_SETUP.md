# Cashfree Payment Gateway Setup with Split Payments

## Overview

This app uses **Cashfree** payment gateway with automatic split payment functionality:
- **99%** goes to the merchant account (registered on Cashfree)
- **1%** automatically goes to your developer account as commission

## Why Cashfree?

✅ **Fast Verification** - Quick account setup and verification  
✅ **Split Payments** - Built-in marketplace model with automatic commission split  
✅ **Multiple Payment Methods** - Cards, UPI, Wallets, Net Banking  
✅ **Competitive Fees** - Lower transaction fees  
✅ **Easy Integration** - Simple API and good documentation  

## Setup Instructions

### ⚠️ Important: Two Separate Accounts Required

You need **TWO separate Cashfree accounts** with **different email addresses**:
1. **Business Account** - Business email + Business PAN (receives 99%)
2. **Developer Account** - Your email + Your PAN (receives 1%)

**Accounts are linked through code configuration, NOT in Cashfree dashboard!**

### Step 1: Create Two Cashfree Accounts

**Important:** You need TWO separate Cashfree accounts for split payments:

#### Account 1: Merchant Account (Business Owner - 99% recipient)
- **Who:** The business owner (the person you're making this app for)
- **PAN to Use:** **Business PAN** (the business's PAN number)
- **Purpose:** This account will receive 99% of all payments
- **Steps:**
  1. Go to https://www.cashfree.com/
  2. Click **"Sign Up"** or **"Get Started"**
  3. **Sign up as a regular merchant account** (not marketplace - that comes later)
  4. When asked for PAN, enter the **business's PAN number**
  5. Complete all business details (business name, address, bank account, etc.)
  6. Complete KYC verification

#### Account 2: Developer Account (You - 1% commission recipient)
- **Who:** You (the developer)
- **PAN to Use:** **Your Individual PAN** (your personal PAN number)
- **Purpose:** This account will receive 1% commission automatically
- **Steps:**
  1. Go to https://www.cashfree.com/
  2. Click **"Sign Up"** or **"Get Started"**
  3. Sign up as a regular merchant account
  4. When asked for PAN, enter **your personal PAN number**
  5. Complete all your personal/business details
  6. Complete KYC verification

**Note:** Marketplace features are enabled AFTER account creation, not during signup. Just sign up as regular merchant accounts first.

### Step 2: Enable Marketplace Features (Merchant Account)

1. Log in to the **Merchant's Cashfree Dashboard** (the business owner's account)
2. Go to **Settings** → **Marketplace** (or **Vendors**)
3. If you don't see this option:
   - Contact Cashfree support to enable marketplace features
   - Or check **Settings** → **Account** → **Account Type**
   - You may need to request marketplace access
4. Once marketplace is enabled, note the **Merchant Account ID** (found in Settings → Account Details)

### Step 3: Get API Credentials (Use Merchant Account)

1. Log in to the **Merchant's Cashfree Dashboard**: https://merchant.cashfree.com/
2. Go to **Settings** → **Developer** → **API Keys**
3. Copy:
   - **App ID** (Client ID)
   - **Secret Key** (Client Secret)
4. Note the **Merchant Account ID** (from Settings → Account Details)

### Step 4: Set Up Split Payments

#### In Merchant's Cashfree Dashboard:

1. Go to **Settings** → **Marketplace** → **Vendors** (or **Sub-merchants**)
2. Click **"Add Vendor"** or **"Add Sub-merchant"**
3. Enter your **Developer Account ID** (from your Cashfree account)
4. Set commission percentage: **1%** (or configure as needed)
5. Save the vendor/sub-merchant

#### Get Your Developer Account ID:

1. Log in to **Your Cashfree Dashboard** (your developer account)
2. Go to **Settings** → **Account Details**
3. Copy your **Account ID** (this is `CASHFREE_DEVELOPER_ACCOUNT_ID`)

**Alternative Method (If Marketplace Not Available):**

If marketplace features aren't available, you can use Cashfree's **Split Payment API** directly in the code (which we've already implemented). You just need both Account IDs.

### Step 5: Configure Environment Variables in Vercel

Go to your Vercel project dashboard → **Settings** → **Environment Variables** and add:

#### Required Variables:
```
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENV=sandbox  (or 'production' for live)
```

#### For Split Payments (Required for 1% Commission):
```
CASHFREE_MERCHANT_ACCOUNT_ID=merchant_account_id_from_merchant_dashboard
CASHFREE_DEVELOPER_ACCOUNT_ID=your_account_id_from_your_dashboard
```

**Where to find Account IDs:**
- **Merchant Account ID:** Log in to merchant's Cashfree → Settings → Account Details → Account ID
- **Developer Account ID:** Log in to your Cashfree → Settings → Account Details → Account ID

**Note:** If split payment variables are not set, the full amount will go to the merchant account. Set them up to enable automatic 1% commission.

### Step 6: Test Mode vs Production

#### Test Mode (Sandbox):
- Use `CASHFREE_ENV=sandbox`
- Test credentials available in Cashfree Dashboard
- Use test cards for testing
- No real money transactions

#### Production Mode:
- Use `CASHFREE_ENV=production`
- Use live credentials
- Real money transactions
- Split payments will work automatically

## Split Payment Configuration

The split payment is configured in `api/cashfree-create-order.js`:

```javascript
// 1% commission to developer
const commissionAmount = Math.round(totalAmount * 0.01);

// 99% to merchant
const merchantAmount = totalAmount - commissionAmount;
```

### How It Works:

1. Customer makes a payment of ₹1000
2. Cashfree automatically splits:
   - ₹990 (99%) → Merchant's bank account
   - ₹10 (1%) → Your developer account
3. Both transfers happen automatically
4. No manual intervention needed

## Payment Flow

1. User adds items to cart
2. User clicks "Proceed to Checkout"
3. User enters shipping details
4. **Backend creates Cashfree order** with split payment configuration
5. Cashfree payment modal opens
6. User completes payment
7. **Backend verifies payment**
8. On success:
   - Payment is split automatically (99% + 1%)
   - Order confirmation sent via WhatsApp
   - Shipment created (if Shiprocket configured)

## Testing

### Test Cards (Sandbox Mode):

**Success Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**Failure Card:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI:
- Use any UPI ID in test mode
- Payment will be simulated

## API Endpoints

### 1. Create Order (with Split Payment)
- **Endpoint:** `POST /api/cashfree-create-order`
- **Purpose:** Creates payment order with split configuration
- **Returns:** Payment session ID

### 2. Verify Payment
- **Endpoint:** `POST /api/cashfree-verify-payment`
- **Purpose:** Verifies payment status
- **Returns:** Payment verification result

### 3. Webhook Handler
- **Endpoint:** `POST /api/cashfree-webhook`
- **Purpose:** Receives payment status updates from Cashfree
- **Note:** Configure webhook URL in Cashfree Dashboard

## Webhook Configuration

1. In Cashfree Dashboard, go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.vercel.app/api/cashfree-webhook`
3. Select events:
   - `PAYMENT_SUCCESS_WEBHOOK`
   - `PAYMENT_FAILED_WEBHOOK`
   - `PAYMENT_USER_DROPPED_WEBHOOK`

## Troubleshooting

### Issue: Split payments not working
- **Solution:** Ensure both `CASHFREE_MERCHANT_ACCOUNT_ID` and `CASHFREE_DEVELOPER_ACCOUNT_ID` are set
- Verify both accounts are active in Cashfree
- Check that marketplace model is enabled

### Issue: Payment verification fails
- **Solution:** Check API credentials are correct
- Verify environment variable `CASHFREE_ENV` matches your credentials (sandbox/production)
- Check Cashfree Dashboard for any account restrictions

### Issue: Webhook not receiving events
- **Solution:** Verify webhook URL is accessible
- Check webhook secret is configured (if using)
- Ensure webhook events are enabled in Cashfree Dashboard

## Support

- **Cashfree Documentation:** https://docs.cashfree.com/
- **Cashfree Support:** support@cashfree.com
- **API Reference:** https://docs.cashfree.com/docs/api-reference

## Migration from Razorpay

If you were using Razorpay before:
1. ✅ Service updated: `services/cashfreeService.ts` replaces `razorpayService.ts`
2. ✅ API endpoints updated: New Cashfree endpoints created
3. ✅ CartModal updated: Now uses Cashfree service
4. ⚠️ **Action Required:** Set up Cashfree account and configure environment variables

## Important Notes

⚠️ **Split Payments:** The 1% commission split only works if:
- Both merchant and developer accounts are configured
- Marketplace model is enabled in Cashfree
- Both accounts are verified and active

⚠️ **Settlement:** 
- Merchant receives 99% in their Cashfree account
- You receive 1% in your Cashfree account
- Both can withdraw to their respective bank accounts

⚠️ **Fees:** Cashfree charges transaction fees on the total amount. The split happens after fees are deducted.

