# Wallet Recharge - Razorpay Setup

Wallet recharge uses **Razorpay** (separate from Cashfree product payments). Recharge amounts go to your Razorpay-linked bank account.

## Two separate things

| What | When | Where |
|------|------|-------|
| **Bank settlement** | T+2 days (e.g. by 4th March) | Razorpay transfers to your linked bank |
| **In-app wallet** | Immediately after payment | Admin sees balance in dashboard (used for AI photoshoots) |

The in-app wallet is credited by the **webhook** when Razorpay sends `payment.captured`. If wallet is not updating, the webhook setup below is missing or incorrect.

## Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `RAZORPAY_KEY_ID` | From Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | From Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay Dashboard → Settings → Webhooks (when you add a webhook) |
| `WALLET_WEBHOOK_SECRET` | Shared secret for backend wallet credit (must match Railway) |
| `BACKEND_URL` | Your Railway backend URL (e.g. `https://kurtitimes-production.up.railway.app`) |

## Razorpay Webhook Setup (required for wallet to credit)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com) → **Settings** → **Webhooks**
2. Click **+ Add New Webhook**
3. **Webhook URL:** `https://kurtitimes.vercel.app/api/razorpay-webhook`
4. **Alert email:** Your email
5. **Select events:** Enable **`payment.captured`** (only this one for wallet)
6. Save and copy the **Webhook Secret** → set as `RAZORPAY_WEBHOOK_SECRET` in Vercel
7. Ensure `WALLET_WEBHOOK_SECRET` in Vercel **matches exactly** the value in Railway

## Flow

1. Admin clicks Recharge in dashboard → enters amount (min ₹200)
2. Creates Razorpay order via `/api/razorpay-create-wallet-order`
3. Razorpay checkout modal opens
4. Payment goes to your Razorpay-linked bank
5. Razorpay webhook `payment.captured` → credits admin's in-app wallet
6. Admin sees updated balance

## Test Mode

Use Razorpay test keys and test cards: https://razorpay.com/docs/payments/payments/test-card-details/
