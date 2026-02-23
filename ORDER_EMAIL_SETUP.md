# Order Confirmation Email Setup

Order confirmation emails are sent to customers when they place an order. They include:
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
   - `FROM_EMAIL` (optional) – e.g. `orders@kurtitimes.com` – must be from a verified domain

Without `RESEND_API_KEY`, order placement still works; emails are skipped.

## Troubleshooting

- **Emails not received**: Ensure `FROM_EMAIL` is from a domain you've verified in Resend. On Resend's free tier, you must verify your domain before sending.
- **No email sent**: Emails are only sent when the customer provides a real email at checkout. If they skip the email field, we use `phone@temp.com` which is not sent.
- **Orders not in Admin**: Orders are saved even when Shiprocket fails. Redeploy after changes. Ensure `VITE_API_URL` points to your Railway backend and CORS allows your Vercel domain.
