# 🔧 Vercel Setup - Fix 401 Errors

## ❌ The Problem

The 401 Unauthorized errors are happening because:
1. **Environment variables are NOT set in Vercel Dashboard** (they can't be set in `vercel.json`)
2. Vercel serverless functions need environment variables configured in the dashboard

## ✅ Solution - Set Environment Variables in Vercel

**You do NOT need Railway!** Vercel serverless functions work perfectly. You just need to configure environment variables correctly.

### Step-by-Step Fix:

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your `kurtitimes` project

2. **Navigate to Settings:**
   - Click on your project
   - Go to **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Environment Variables:**
   Add these TWO variables:

   **Variable 1:**
   - **Name:** `RAZORPAY_KEY_ID`
   - **Value:** `rzp_test_Rv4c4iUwni06DQ`
   - **Environment:** Select all (Production, Preview, Development)

   **Variable 2:**
   - **Name:** `RAZORPAY_KEY_SECRET`
   - **Value:** `2xrHIReHqhLfWAH035dZM0vy`
   - **Environment:** Select all (Production, Preview, Development)

4. **Redeploy:**
   - After adding variables, go to **Deployments** tab
   - Click the **3 dots** (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger redeploy

## 🔍 Why This Happens

- ❌ `vercel.json` `env` field doesn't work for environment variables
- ✅ Environment variables MUST be set in Vercel Dashboard
- ✅ Test mode works fine - the 401 was just missing credentials

## ✅ After Setup

Once you've set the environment variables and redeployed:
- ✅ API routes will work (`/api/create-order`, `/api/verify-payment`)
- ✅ Razorpay orders will be created successfully
- ✅ Payments will process correctly

## 🧪 Test It

After redeploying:
1. Go to your site: `https://kurtitimes.vercel.app`
2. Add items to cart
3. Try checkout
4. Check browser console - no more 401 errors!

## 📝 For Production

When you get live keys from Razorpay:
1. Update the environment variables in Vercel Dashboard
2. Use your **live** Key ID and Key Secret
3. Redeploy

---

**No Railway needed! Vercel serverless functions are perfect for this!** 🚀

