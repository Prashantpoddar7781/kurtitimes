# Complete Setup Guide - Shiprocket & Cashfree Integration

This is a comprehensive guide to set up both Shiprocket (shipping) and Cashfree (payments) for your Kurti Times e-commerce application.

## Prerequisites

- Vercel account with project deployed
- Admin's business details (address, bank account, PAN)
- Your developer details (for 1% commission account)

---

## Part 1: Shiprocket Setup (Shipping)

### 1.1 Create Shiprocket Account

1. Go to [https://www.shiprocket.in](https://www.shiprocket.in)
2. Sign up with admin's email
3. Complete business verification
4. Add bank account for COD settlements

### 1.2 Get Shiprocket Credentials

1. Login to Shiprocket dashboard
2. Go to **Settings** → **API** (or **Developer** section)
3. Note down:
   - Email (your Shiprocket login email)
   - Password (your Shiprocket login password)

### 1.3 Set Up Pickup Location

1. Go to **Settings** → **Pickup Locations**
2. Click **Add New Location**
3. Enter admin's warehouse address:
   ```
   Name: Kurti Times
   Phone: 9892794421
   Address Line 1: G-11-12, RAJHANS IMPERIA
   Address Line 2: RING ROAD
   City: Surat
   State: Gujarat
   Pincode: 395004
   Country: India
   ```
4. Mark as **Primary** location
5. Save

### 1.4 Configure Courier Services

1. Go to **Courier Services** in dashboard
2. Enable courier services:
   - Standard: DTDC, Delhivery, Xpressbees
   - Express: BlueDart, FedEx (optional)
3. Configure COD settings if needed

---

## Part 2: Cashfree Setup (Payments with Split)

### 2.1 Create Merchant Account (Admin - 99%)

1. Go to [https://www.cashfree.com](https://www.cashfree.com)
2. Click **Sign Up** → **Business Account**
3. Use admin's details:
   - Email: admin's business email
   - Business Name: Kurti Times (or admin's business name)
   - PAN: Admin's business PAN
   - Bank Account: Admin's business bank account
4. Complete KYC verification
5. After verification, go to **Dashboard** → **Developer** → **API Keys**
6. Note down:
   - **App ID**
   - **Secret Key**
   - **Account ID** (from Settings → Account Details)

### 2.2 Create Developer Account (You - 1%)

1. Use a **different email address**
2. Sign up as a separate business account
3. Use your details:
   - Your email
   - Your business/individual name
   - Your PAN
   - Your bank account
4. Complete KYC verification
5. After verification, note down:
   - **Account ID** (from Settings → Account Details)

---

## Part 3: Configure Vercel Environment Variables

### 3.1 Access Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **kurti-times**
3. Go to **Settings** → **Environment Variables**

### 3.2 Add Shiprocket Variables

Add these variables (replace with actual values):

```
SHIPROCKET_EMAIL=admin-email@example.com
SHIPROCKET_PASSWORD=shiprocket-password
SHIPROCKET_PICKUP_NAME=Kurti Times
SHIPROCKET_PICKUP_PHONE=9892794421
SHIPROCKET_PICKUP_ADDRESS_LINE1=G-11-12, RAJHANS IMPERIA
SHIPROCKET_PICKUP_ADDRESS_LINE2=RING ROAD
SHIPROCKET_PICKUP_CITY=Surat
SHIPROCKET_PICKUP_STATE=Gujarat
SHIPROCKET_PICKUP_PINCODE=395004
```

### 3.3 Add Cashfree Variables

Add these variables (replace with actual values):

```
# Merchant Account (Admin - receives 99%)
CASHFREE_APP_ID=merchant-app-id-from-admin-account
CASHFREE_SECRET_KEY=merchant-secret-key-from-admin-account
CASHFREE_MERCHANT_ACCOUNT_ID=admin-account-id-for-99-percent

# Developer Account (You - receives 1%)
CASHFREE_DEVELOPER_ACCOUNT_ID=your-account-id-for-1-percent

# Environment
CASHFREE_ENV=PRODUCTION

# URLs (replace with your actual domain)
FRONTEND_URL=https://kurtitimes.vercel.app
BACKEND_URL=https://kurtitimes.vercel.app
```

### 3.4 Set Environment Scope

- Select **Production**, **Preview**, and **Development** for all variables
- Click **Save**

### 3.5 Redeploy

1. Go to **Deployments**
2. Click **Redeploy** on latest deployment
3. Wait for deployment to complete

---

## Part 4: Testing

### 4.1 Test Shipping

1. Open your website
2. Add items to cart
3. Go to checkout
4. Enter a delivery pincode
5. Verify shipping cost is calculated
6. Check estimated delivery days

### 4.2 Test Payment (Test Mode First)

1. Set `CASHFREE_ENV=TEST` in Vercel
2. Redeploy
3. Place a test order
4. Use test card: `4111 1111 1111 1111`
5. Complete payment
6. Verify order is created in Shiprocket

### 4.3 Test Split Payment

1. After successful test payment:
   - Check Merchant Account (Admin) → Should show 99%
   - Check Developer Account (You) → Should show 1%

### 4.4 Go Live

1. Set `CASHFREE_ENV=PRODUCTION` in Vercel
2. Redeploy
3. Test with a small real transaction
4. Verify split payment works
5. Verify shipment is created in Shiprocket

---

## Part 5: Webhook Configuration (Optional)

### 5.1 Cashfree Webhook

1. In Merchant Account Dashboard:
   - Go to **Settings** → **Webhooks**
   - Add URL: `https://your-domain.vercel.app/api/cashfree-webhook`
   - Select events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`
   - Save webhook secret
   - Add to Vercel: `CASHFREE_WEBHOOK_SECRET=your-webhook-secret`

---

## Part 6: Order Flow

### Complete Order Flow:

1. **Customer places order**
   - Adds items to cart
   - Enters shipping address
   - Shipping cost calculated automatically

2. **Payment Processing**
   - Customer clicks "Proceed to Payment"
   - Cashfree checkout opens
   - Customer completes payment
   - Payment split: 99% to admin, 1% to you (automatic)

3. **Order Confirmation**
   - Payment verified
   - Order created in Shiprocket
   - Shipment ID generated
   - WhatsApp notification sent to admin

4. **Shipping**
   - Admin can request pickup from Shiprocket dashboard
   - Courier picks up from warehouse
   - Customer receives tracking details
   - Order delivered

---

## Troubleshooting

### Shiprocket Issues

**"Authentication failed"**
- Check email and password are correct
- Verify credentials in Shiprocket dashboard

**"No courier available"**
- Enable more courier services
- Check pincode is serviceable
- Verify pickup location is set

### Cashfree Issues

**"Failed to create order"**
- Verify App ID and Secret Key
- Check accounts are verified
- Ensure environment is set correctly

**"Split payment not working"**
- Verify both Account IDs are correct
- Check both accounts are active
- Contact Cashfree support if needed

---

## Support Contacts

- **Shiprocket**: support@shiprocket.in
- **Cashfree**: support@cashfree.com
- **Vercel**: [https://vercel.com/support](https://vercel.com/support)

---

## Important Notes

1. **Security**: Never commit environment variables to Git
2. **Testing**: Always test in TEST mode before going live
3. **Verification**: Both Cashfree accounts must be fully verified
4. **Settlement**: Each account receives money in their own bank account
5. **Commissions**: 1% is automatically split, no manual intervention needed

---

## Next Steps

1. ✅ Complete Shiprocket setup
2. ✅ Complete Cashfree setup (both accounts)
3. ✅ Add all environment variables to Vercel
4. ✅ Test in TEST mode
5. ✅ Go live with PRODUCTION mode
6. ✅ Monitor first few orders
7. ✅ Set up webhooks for automation

Good luck with your e-commerce store! 🚀

