# 🔧 Troubleshooting Payment Errors

## Current Error: 500 Internal Server Error / Invalid JSON

The error "Unexpected token 'A', "A server e"... is not valid JSON" means:
- The API endpoint is returning HTML (error page) instead of JSON
- This happens when the serverless function fails to load or execute

## ✅ Fixes Applied

1. ✅ Fixed module system conflict (ES modules vs CommonJS)
2. ✅ Added `api/package.json` to force CommonJS for serverless functions
3. ✅ Improved error handling and JSON parsing
4. ✅ Better error messages

## 🔍 Step-by-Step Fix

### 1. **Set Environment Variables in Vercel Dashboard** (CRITICAL!)

The 500 error is likely because environment variables are missing:

1. Go to https://vercel.com/dashboard
2. Select your `kurtitimes` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   **Variable 1:**
   - Name: `RAZORPAY_KEY_ID`
   - Value: `rzp_test_Rv4c4iUwni06DQ`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `RAZORPAY_KEY_SECRET`
   - Value: `2xrHIReHqhLfWAH035dZM0vy`
   - Environments: ✅ Production ✅ Preview ✅ Development

### 2. **Redeploy After Setting Variables**

After adding environment variables:
1. Go to **Deployments** tab
2. Click **3 dots** (⋯) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### 3. **Check Function Logs**

If still not working:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click on **Functions** tab
4. Check logs for `/api/create-order`
5. Look for error messages

## 🧪 Test the API Directly

You can test the API endpoint directly:

```bash
curl -X POST https://kurtitimes.vercel.app/api/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "currency": "INR"}'
```

Expected response:
```json
{
  "success": true,
  "orderId": "order_...",
  "amount": 10000,
  "currency": "INR"
}
```

If you get HTML or 500 error, environment variables are not set correctly.

## 🔍 Common Issues

### Issue 1: "Module not found" or "Cannot find module"
- **Fix:** Make sure `razorpay` is in `package.json` dependencies
- **Check:** Run `npm install` and commit `package-lock.json`

### Issue 2: "RAZORPAY_KEY_ID is not defined"
- **Fix:** Set environment variables in Vercel Dashboard (not in code!)

### Issue 3: "500 Internal Server Error"
- **Fix:** Check Vercel function logs for detailed error
- **Check:** Ensure environment variables are set for all environments

### Issue 4: "Invalid JSON" error
- **Fix:** This means the function is returning HTML error page
- **Check:** Environment variables and function deployment

## 📝 Verification Checklist

- [ ] Environment variables set in Vercel Dashboard
- [ ] Variables set for Production, Preview, AND Development
- [ ] Redeployed after setting variables
- [ ] `razorpay` package in `package.json` dependencies
- [ ] `api/package.json` exists (for CommonJS)
- [ ] No errors in Vercel function logs

## 🆘 Still Not Working?

1. **Check Vercel Function Logs:**
   - Go to Deployments → Latest → Functions → View Logs
   - Look for specific error messages

2. **Test Locally:**
   ```bash
   npm install
   npm run server
   ```
   Then test at `http://localhost:3000/api/create-order`

3. **Verify Keys:**
   - Make sure keys are correct in Razorpay Dashboard
   - Test keys should start with `rzp_test_`

---

**After setting environment variables and redeploying, the payment should work!** 🚀

