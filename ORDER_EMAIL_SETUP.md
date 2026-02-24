# Order & Webhook Setup

## Required URLs

**Vercel** (for frontend + webhook):
- `BACKEND_URL` – your Railway backend URL (e.g. `https://kurtitimes-production.up.railway.app`)

**Railway** (required for order confirmation emails – backend sends via Resend):
- `RESEND_API_KEY` – your Resend API key
- `FROM_EMAIL` – e.g. `onboarding@resend.dev` (testing) or `orders@yourdomain.com` (verified domain)
- `ADMIN_EMAIL` (optional) – defaults to `kurtitimes@gmail.com`

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
3. **Add to Railway** (Backend Variables – **required for COD & order emails**):
   - `RESEND_API_KEY` – your Resend API key
   - `FROM_EMAIL` – `onboarding@resend.dev` for testing, or verified domain for production
   - `ADMIN_EMAIL` (optional) – defaults to `kurtitimes@gmail.com`

4. **Add to Vercel** (for webhook prepaid emails + test endpoint):
   - Same variables for Vercel API routes
   - `SEND_EMAIL_BASE_URL` = `https://kurtitimes.vercel.app` for webhook

## Troubleshooting

- **No emails in Resend dashboard**: Check config: visit `https://YOUR-SITE.vercel.app/api/send-order-confirmation` (GET). If `configured: false`, add `RESEND_API_KEY` in Vercel and redeploy.
- **Emails not received**: Ensure `FROM_EMAIL` is from a verified domain. Use `onboarding@resend.dev` for testing (no domain verification needed).
- **No email sent**: Admin always receives a copy. Customer receives when they provide a real email at checkout. If they skip the email field, only admin gets the email.
- **COD: no email**: Add `RESEND_API_KEY` and `FROM_EMAIL` in **Railway** (backend variables). Backend sends directly to Resend when order is confirmed. Redeploy backend after adding.
- **Orders not in Admin**: Orders are saved even when Shiprocket fails. Redeploy after changes. Ensure `VITE_API_URL` points to your Railway backend and CORS allows your Vercel domain.
