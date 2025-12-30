# Cashfree Payment Gateway Setup Guide

This guide will help you configure Cashfree with split payment (99% to merchant, 1% to developer).

## Step 1: Create Cashfree Accounts

You need **TWO separate Cashfree accounts**:

### Account 1: Merchant Account (Admin - 99% of payments)
- This is the main business account
- Will receive 99% of all payments
- Use the admin's business details (PAN, bank account, etc.)

### Account 2: Developer Account (You - 1% of payments)
- This is your developer account
- Will receive 1% commission automatically
- Use your individual/business details

## Step 2: Sign Up for Cashfree

1. **Merchant Account (Admin)**
   - Go to [https://www.cashfree.com](https://www.cashfree.com)
   - Click **Sign Up** → **Business Account**
   - Use admin's email, business PAN, bank details
   - Complete KYC verification
   - Note down: **App ID** and **Secret Key** (from Dashboard → Developer → API Keys)

2. **Developer Account (You)**
   - Use a different email address
   - Sign up as a separate business account
   - Use your PAN and bank details
   - Complete KYC verification
   - Note down: **App ID** and **Secret Key**

## Step 3: Get Account IDs for Split Payment

1. **For Merchant Account (Admin):**
   - Login to Cashfree Dashboard
   - Go to **Settings** → **Account Details**
   - Find your **Account ID** (also called Vendor ID)
   - This is the ID that will receive 99% of payments

2. **For Developer Account (You):**
   - Login to your Cashfree Dashboard
   - Go to **Settings** → **Account Details**
   - Find your **Account ID** (Vendor ID)
   - This is the ID that will receive 1% of payments

## Step 4: Configure Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Select **Settings** → **Environment Variables**

2. **Add the following variables:**

   ```
   # Cashfree Merchant Account (Admin - 99%)
   CASHFREE_APP_ID=your-merchant-app-id
   CASHFREE_SECRET_KEY=your-merchant-secret-key
   CASHFREE_MERCHANT_ACCOUNT_ID=merchant-account-id-for-99-percent
   
   # Cashfree Developer Account (You - 1%)
   CASHFREE_DEVELOPER_ACCOUNT_ID=developer-account-id-for-1-percent
   
   # Environment (PRODUCTION or TEST)
   CASHFREE_ENV=PRODUCTION
   
   # Webhook Secret (Optional but recommended)
   CASHFREE_WEBHOOK_SECRET=your-webhook-secret
   
   # Frontend URL (for return URL)
   FRONTEND_URL=https://kurtitimes.vercel.app
   
   # Backend URL (for webhook)
   BACKEND_URL=https://kurtitimes.vercel.app
   ```

3. **Important Notes:**
   - `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` should be from the **Merchant Account** (admin's account)
   - `CASHFREE_MERCHANT_ACCOUNT_ID` = Admin's Account ID (receives 99%)
   - `CASHFREE_DEVELOPER_ACCOUNT_ID` = Your Account ID (receives 1%)
   - Set `CASHFREE_ENV=TEST` for testing, `PRODUCTION` for live payments
   - Replace URLs with your actual domain

4. **Redeploy your application**
   - After adding environment variables, redeploy

## Step 5: Configure Webhook (Optional but Recommended)

1. **In Merchant Account Dashboard:**
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://your-domain.vercel.app/api/cashfree-webhook`
   - Select events:
     - `PAYMENT_SUCCESS_WEBHOOK`
     - `PAYMENT_FAILED_WEBHOOK`
   - Save the webhook secret and add it to `CASHFREE_WEBHOOK_SECRET`

## Step 6: Test the Integration

### Test Mode:
1. Set `CASHFREE_ENV=TEST` in environment variables
2. Use Cashfree test credentials (sandbox mode)
3. Test with test card numbers:
   - Success: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Production Mode:
1. Set `CASHFREE_ENV=PRODUCTION`
2. Ensure both accounts are fully verified
3. Test with a small real transaction first

## Step 7: Verify Split Payment

After a successful payment:
1. Check Merchant Account (Admin) → **Settlements**
   - Should show 99% of the order amount
2. Check Developer Account (You) → **Settlements**
   - Should show 1% of the order amount
3. Verify the split in **Transaction Details**

## How Split Payment Works

- **Order Amount**: ₹1,000
- **Merchant (Admin) receives**: ₹990 (99%)
- **Developer (You) receives**: ₹10 (1%)
- **Automatic**: Split happens automatically via Cashfree API
- **Settlement**: Each account receives their share separately

## Troubleshooting

### Issue: "Failed to create order"
- **Solution**: 
  - Check that all environment variables are set correctly
  - Verify App ID and Secret Key are from merchant account
  - Ensure accounts are verified

### Issue: "Split payment not working"
- **Solution**:
  - Verify both Account IDs are correct
  - Check that both accounts are active and verified
  - Ensure you're using the correct API version

### Issue: "Payment successful but split not reflected"
- **Solution**:
  - Check Cashfree dashboard for both accounts
  - Split may take a few minutes to reflect
  - Contact Cashfree support if issue persists

## Important Notes

1. **Account Linking**: The two accounts are linked via the split payment API, not through Cashfree dashboard
2. **Settlement**: Each account receives money in their own bank account
3. **Commissions**: The 1% is automatically deducted and sent to developer account
4. **Taxes**: Each account is responsible for their own tax compliance

## Support

For Cashfree-specific issues:
- Cashfree Support: support@cashfree.com
- Cashfree Documentation: [https://docs.cashfree.com](https://docs.cashfree.com)
- Cashfree API Reference: [https://docs.cashfree.com/reference](https://docs.cashfree.com/reference)

