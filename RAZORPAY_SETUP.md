# Razorpay Payment Gateway Setup

## Prerequisites

1. Create a Razorpay account at https://razorpay.com
2. Get your Razorpay Key ID and Key Secret from the dashboard

## Setup Instructions

### 1. Get Your Razorpay Keys

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com
2. Go to **Settings** → **API Keys**
3. Generate a new API key or use existing one
4. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Important:** For production, you should:
- Never expose your Key Secret in client-side code
- Create a backend API to securely create orders
- Use the Key Secret only on the server side

### 3. Update Razorpay Service

The current implementation uses a client-side approach. For production, you should:

1. Create a backend API endpoint to create Razorpay orders
2. Update `services/razorpayService.ts` to call your backend API
3. Keep the Key Secret on the server only

### 4. Test Mode

Razorpay provides test keys for development:
- Test Key ID: Available in Razorpay Dashboard → Settings → API Keys → Test Mode
- Use test cards: https://razorpay.com/docs/payments/test-cards/

## Payment Flow

1. User adds items to cart
2. User proceeds to checkout
3. User enters name, phone, and email
4. Razorpay payment modal opens
5. User completes payment
6. On success, order confirmation is sent via WhatsApp

## Security Notes

⚠️ **Current Implementation:** This is a client-side only implementation suitable for testing.

✅ **For Production:**
- Create a backend API to handle order creation
- Store Key Secret on server only
- Verify payment signatures on server
- Implement proper order management system

## Support

For Razorpay integration help, visit: https://razorpay.com/docs/

