# 🚀 Go Live Guide - Start Receiving Real Payments

## ✅ Current Status: TEST MODE

Right now, your payment gateway is in **TEST MODE**:
- ✅ Payments work (simulated)
- ❌ No real money is transferred
- ✅ Perfect for testing

## 🎯 To Receive REAL Payments

You need to switch from **Test Keys** to **Live Keys**. Here's how:

### Step 1: Verify Your Razorpay Account

1. **Log in to Razorpay Dashboard:**
   - Go to https://dashboard.razorpay.com
   - Log in with your account

2. **Complete Account Verification:**
   - Go to **Settings** → **Account & Settings**
   - Complete all required verification:
     - Business details
     - Bank account details
     - KYC documents
     - Business verification
   - Wait for Razorpay to approve (usually 1-3 business days)

3. **Check Account Status:**
   - Your account should show as "Active" or "Verified"
   - You'll see "Live Mode" option available

### Step 2: Get Your Live API Keys

1. **Switch to Live Mode:**
   - In Razorpay Dashboard, toggle from "Test Mode" to "Live Mode"
   - You'll see a warning - confirm the switch

2. **Get Live Keys:**
   - Go to **Settings** → **API Keys**
   - Click **Generate New Key** (if you don't have live keys)
   - Copy your **Live Key ID** (starts with `rzp_live_...`)
   - Copy your **Live Key Secret** (starts with `...` - longer string)

3. **Important:**
   - Live keys are different from test keys
   - Keep them secure - never share publicly
   - Live Key Secret is shown only once - save it immediately!

### Step 3: Update Your Code

#### Option A: Update Vercel Environment Variables (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your `kurtitimes` project

2. **Update Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Find `RAZORPAY_KEY_ID`
   - Click **Edit**
   - Replace test key with your **Live Key ID** (`rzp_live_...`)
   - Save

   - Find `RAZORPAY_KEY_SECRET`
   - Click **Edit**
   - Replace test key with your **Live Key Secret**
   - Save

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click **3 dots** (⋯) on latest deployment
   - Click **Redeploy**

#### Option B: Update Code Files

1. **Update `index.html`:**
   ```html
   <script>
     // Replace test key with live key
     window.RAZORPAY_KEY_ID = 'rzp_live_YOUR_LIVE_KEY_ID';
   </script>
   ```

2. **Commit and Push:**
   ```bash
   git add index.html
   git commit -m "Switch to Razorpay live keys"
   git push origin main
   ```

### Step 4: Test with Small Real Payment

1. **Make a Test Purchase:**
   - Use a real card (small amount like ₹1 or ₹10)
   - Complete the payment
   - Check if money appears in your Razorpay account

2. **Verify in Dashboard:**
   - Go to Razorpay Dashboard → **Payments**
   - You should see the real payment
   - Check your bank account (after settlement period)

## 📋 Checklist Before Going Live

- [ ] Razorpay account is verified and active
- [ ] Business details are complete
- [ ] Bank account is added and verified
- [ ] KYC documents are approved
- [ ] Live API keys are generated
- [ ] Environment variables updated in Vercel
- [ ] `index.html` updated with live Key ID (if needed)
- [ ] Tested with small real payment
- [ ] Verified payment appears in Razorpay dashboard

## ⚠️ Important Notes

### Settlement Time
- Payments are settled to your bank account in **T+2 days** (2 business days after payment)
- First settlement may take longer (up to 7 days)

### Fees
- Razorpay charges a transaction fee (usually 2% + GST)
- Check your pricing plan in Razorpay dashboard

### Refunds
- You can process refunds from Razorpay Dashboard
- Refunds take 5-7 business days to process

### Security
- ✅ Never commit live keys to GitHub
- ✅ Use environment variables (already set up)
- ✅ Keep Key Secret secure
- ✅ Use HTTPS (Vercel provides this automatically)

## 🔄 Switching Back to Test Mode

If you need to test again:
1. Update environment variables back to test keys
2. Redeploy
3. Or use Razorpay Dashboard to toggle modes

## 📞 Support

- **Razorpay Support:** https://razorpay.com/support/
- **Dashboard:** https://dashboard.razorpay.com
- **Documentation:** https://razorpay.com/docs/

---

## 🎉 You're Ready!

Once you:
1. ✅ Complete Razorpay verification
2. ✅ Get live keys
3. ✅ Update environment variables
4. ✅ Redeploy

**You'll start receiving REAL payments immediately!** 💰

---

**Current Status:** Test Mode (simulated payments)  
**Next Step:** Complete Razorpay account verification to get live keys

