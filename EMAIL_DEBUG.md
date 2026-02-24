# Email Debug – Quick Checklist

## 1. Add variables in Railway (backend)

Railway dashboard → Your project → **Variables** tab.

Add these (exact names):

| Variable       | Value                |
|----------------|----------------------|
| RESEND_API_KEY | re_xxxxxxxx (from resend.com) |
| FROM_EMAIL     | onboarding@resend.dev |
| ADMIN_EMAIL    | kurtitimes@gmail.com  |

Click **Add** / **Save**, then **Redeploy** the service.

---

## 2. Test backend email (after redeploy)

Open in browser (replace with your Railway URL if different):

**Check config:**
```
https://kurtitimes-production.up.railway.app/api/email-test
```

**Expected:**
- `{"ok":true,"configured":true,...}` → RESEND_API_KEY is set
- `{"ok":false,"error":"RESEND_API_KEY not set..."}` → Add the variable and redeploy

**Send test email:**
```
https://kurtitimes-production.up.railway.app/api/email-test?send=1
```

**Expected:**
- `{"ok":true,"message":"Test email sent to kurtitimes@gmail.com"}` → Check inbox/Resend
- `{"ok":false,"error":"..."}` → See the error message

---

## 3. If test works but orders still no email

- Orders are created by the backend when `/api/orders/confirm` is called
- Cod: CartModal calls this after Shiprocket
- Prepaid: webhook or client backup calls this

If test works, the problem is likely that the confirm route is not being hit (e.g. wrong backend URL) or the order is being created elsewhere.

---

## 4. Railway URL

Your backend URL is in Railway under **Settings** → **Domains** (e.g. `xxx.up.railway.app`).
The frontend `VITE_API_URL` must point to this URL.
