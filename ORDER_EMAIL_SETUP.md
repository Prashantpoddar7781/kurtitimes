# Order & Webhook Setup

## Required URLs

**Vercel** (for frontend + webhook):
- `BACKEND_URL` – your Railway backend URL (e.g. `https://kurtitimes-production.up.railway.app`)

**Railway** (for backend to send order emails):
- `FRONTEND_URL` – your Vercel site URL (e.g. `https://kurtitimes.vercel.app`) – backend calls this to trigger order confirmation emails

## Order Confirmation Email

Order confirmation emails are sent to customers when they place an order (via webhook). They include:
- Order ID
- Shipment ID / AWB
- Courier name
- Link to track on Shiprocket
- Order details and total

## Resend Setup (required for emails)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key (Resend Dashboard > API Keys)
3. **Add to Vercel** (Project Settings > Environment Variables) – **RESEND_API_KEY is required**:
   - `RESEND_API_KEY` – your Resend API key (**required** – without this, no emails are sent)
   - `FROM_EMAIL` – e.g. `orders@kurtitimes.com` or `onboarding@resend.dev` – **must be from a verified domain**
   - `ADMIN_EMAIL` (optional) – admin copy; defaults to `kurtitimes@gmail.com`
   - `SEND_EMAIL_BASE_URL` – **set to `https://kurtitimes.vercel.app`** – required for webhook to send emails on prepaid orders

Without `RESEND_API_KEY`, order placement still works; emails are skipped. Both client and admin receive order confirmation with Shiprocket tracking number.

## Troubleshooting

- **No emails in Resend dashboard**: Check config: visit `https://YOUR-SITE.vercel.app/api/send-order-confirmation` (GET). If `configured: false`, add `RESEND_API_KEY` in Vercel and redeploy.
- **Emails not received**: Ensure `FROM_EMAIL` is from a verified domain. Use `onboarding@resend.dev` for testing (no domain verification needed).
- **No email sent**: Admin always receives a copy. Customer receives when they provide a real email at checkout. If they skip the email field, only admin gets the email.
- **COD/prepaid: no email**: Add `FRONTEND_URL` = `https://kurtitimes.vercel.app` in **Railway**. The backend sends emails by calling the Vercel API when an order is confirmed. Add `SEND_EMAIL_BASE_URL` in Vercel for webhook (prepaid).
- **Orders not in Admin**: Orders are saved even when Shiprocket fails. Redeploy after changes. Ensure `VITE_API_URL` points to your Railway backend and CORS allows your Vercel domain.
