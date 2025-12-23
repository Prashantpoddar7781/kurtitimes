# 🔍 Debug Checklist - 500 Error Fix

## Step 1: Check Vercel Function Logs

1. Go to https://vercel.com/dashboard
2. Select your `kurtitimes` project
3. Go to **Deployments** tab
4. Click on the **latest deployment**
5. Click on **Functions** tab
6. Click on `/api/create-order`
7. Check the **Logs** section

**Look for:**
- Error messages
- "Environment check" logs (shows if keys are found)
- Any stack traces

## Step 2: Verify Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Verify both variables exist:
   - `RAZORPAY_KEY_ID` = `rzp_test_Rv4c4iUwni06DQ`
   - `RAZORPAY_KEY_SECRET` = `2xrHIReHqhLfWAH035dZM0vy`
3. **IMPORTANT:** Make sure they're set for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

## Step 3: Test API Directly

Open browser console and run:

```javascript
fetch('https://kurtitimes.vercel.app/api/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 10000,
    currency: 'INR'
  })
})
.then(r => r.text())
.then(text => {
  console.log('Response:', text);
  try {
    console.log('Parsed:', JSON.parse(text));
  } catch(e) {
    console.log('Not JSON:', text.substring(0, 200));
  }
})
.catch(e => console.error('Error:', e));
```

**Expected:** JSON response with `orderId`
**If HTML:** Function is failing, check logs

## Step 4: Check Function Deployment

1. In Vercel Dashboard → **Deployments**
2. Check if functions are listed:
   - Should see `/api/create-order`
   - Should see `/api/verify-payment`
3. If functions are missing, the `api/` folder might not be deployed

## Step 5: Verify Package Dependencies

Check that `razorpay` is in `package.json`:
```json
"dependencies": {
  "razorpay": "^2.9.6"
}
```

## Step 6: Force Redeploy

1. Go to **Deployments**
2. Click **3 dots** (⋯) on latest deployment
3. Click **Redeploy**
4. **OR** make a small change and push to GitHub

## Common Issues & Solutions

### Issue: "Cannot find module 'razorpay'"
**Solution:** 
- Make sure `razorpay` is in `package.json` dependencies
- Redeploy after adding it

### Issue: Environment variables not found
**Solution:**
- Double-check they're set for ALL environments (Production, Preview, Development)
- Redeploy after setting them

### Issue: Function returns HTML error page
**Solution:**
- Check Vercel function logs for the actual error
- The function is crashing before it can return JSON

### Issue: "500 Internal Server Error"
**Solution:**
- Check Vercel logs (most important!)
- Look for the actual error message
- Common causes: missing env vars, module errors, Razorpay API errors

## What the Updated Code Does

The new code:
1. ✅ Better error logging (shows in Vercel logs)
2. ✅ Validates environment variables with debug info
3. ✅ Handles request body parsing correctly
4. ✅ Returns proper JSON even on errors
5. ✅ Logs each step for debugging

## Next Steps

1. **Check Vercel logs first** - this will show the exact error
2. Share the error message from logs if still not working
3. The logs will show if environment variables are found or not

---

**The logs will tell us exactly what's wrong!** Check them first. 🔍

