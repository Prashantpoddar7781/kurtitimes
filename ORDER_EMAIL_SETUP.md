# Order & Webhook Setup

## Webhook (Required for orders)

The Cashfree webhook creates Shiprocket shipments and saves orders. Set in **Vercel**:
- `BACKEND_URL` – your Railway backend URL (e.g. `https://kurtitimes-production.up.railway.app`)

Without `BACKEND_URL`, orders won't be saved and shipments won't be created.

## Order Confirmation Email

Order confirmation emails are sent to customers when they place an order (via webhook). They include:
- Order ID
- Shipment ID / AWB
- Courier name
- Link to track on Shiprocket
- Order details and total

## Resend Setup (required for emails)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use Resend's test domain during setup)
3. Create an API key
4. Add to **Vercel** environment variables:
   - `RESEND_API_KEY` – your Resend API key
   - `FROM_EMAIL` – e.g. `orders@kurtitimes.com` or `onboarding@resend.dev` – **must be from a verified domain**
   - `ADMIN_EMAIL` (optional) – admin copy; defaults to `kurtitimes@gmail.com`
   - `SEND_EMAIL_BASE_URL` (optional) – your production URL – used by webhook to call send-order-confirmation

Without `RESEND_API_KEY`, order placement still works; emails are skipped. Both client and admin receive order confirmation with Shiprocket tracking number.

## Troubleshooting

- **Emails not received**: Ensure `FROM_EMAIL` is from a domain you've verified in Resend. On Resend's free tier, you must verify your domain. Use `onboarding@resend.dev` only for testing.
- **No email sent**: Admin always receives a copy. Customer receives when they provide a real email at checkout. If they skip the email field, only admin gets the email.
- **Webhook emails fail**: Set `SEND_EMAIL_BASE_URL` in Vercel to your production URL (e.g. `https://kurtitimes.vercel.app`). Emails are also sent from the client as backup when the customer returns from payment.
- **Orders not in Admin**: Orders are saved even when Shiprocket fails. Redeploy after changes. Ensure `VITE_API_URL` points to your Railway backend and CORS allows your Vercel domain.
