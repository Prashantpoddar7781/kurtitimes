# Wallet Recharge - Razorpay Setup

Wallet recharge uses **Razorpay** (separate from Cashfree product payments). Recharge amounts go to your Razorpay-linked bank account.

## Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `RAZORPAY_KEY_ID` | From Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | From Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay Dashboard → Settings → Webhooks (when you add a webhook) |
| `WALLET_WEBHOOK_SECRET` | Shared secret for backend wallet credit (same as in Railway) |

## Razorpay Webhook Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com) → **Settings** → **Webhooks**
2. Click **+ Add New Webhook**
3. **Webhook URL:** `https://your-domain.vercel.app/api/razorpay-webhook`
4. **Alert email:** Your email
5. **Select events:** Enable **`payment.captured`**
6. Save and copy the **Webhook Secret** → set as `RAZORPAY_WEBHOOK_SECRET` in Vercel

## Flow

1. Admin clicks Recharge in dashboard → enters amount (min ₹200)
2. Creates Razorpay order via `/api/razorpay-create-wallet-order`
3. Razorpay checkout modal opens
4. Payment goes to your Razorpay-linked bank
5. Razorpay webhook `payment.captured` → credits admin's in-app wallet
6. Admin sees updated balance

## Test Mode

Use Razorpay test keys and test cards: https://razorpay.com/docs/payments/payments/test-card-details/
