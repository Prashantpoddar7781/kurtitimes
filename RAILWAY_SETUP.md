# Railway Backend Setup

## Root Directory (Required)

In your Railway project, set **Root Directory** to `backend`:

1. Open your Railway project
2. Select the backend service
3. Go to **Settings** tab
4. Set **Root Directory** to `backend`

This ensures Railway builds and runs the backend (with `/health` and `/api/*`) instead of the frontend.

## Environment Variables

Set these in Railway for the backend service:

- `DATABASE_URL` – PostgreSQL connection string (from Railway database)
- `JWT_SECRET` – Secret for admin auth tokens
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` – Used by `init:admin` script
- `BACKEND_URL` – Public backend URL (e.g. `https://kurtitimes-production.up.railway.app`) for correct image URLs
- Optional: Cashfree, Shiprocket, etc.

## Admin Login

Admin login now uses the backend API. Use the **email and password** from your `init:admin` run (from `ADMIN_EMAIL` and `ADMIN_PASSWORD`).

## Product Images

Product images are uploaded via the `/api/upload/multiple` endpoint instead of base64 in the JSON body, so the "product entity too large" error is avoided.
