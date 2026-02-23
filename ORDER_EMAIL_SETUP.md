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
