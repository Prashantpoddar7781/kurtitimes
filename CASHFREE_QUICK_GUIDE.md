# Cashfree Setup - Quick Answer Guide

## ❓ Your Questions Answered

### Q1: Where is the "Marketplace" account option?

**Answer:** Cashfree doesn't ask for "marketplace" during signup. Here's what to do:

1. **Just sign up as a regular merchant account** (not marketplace)
2. **After account creation and verification**, marketplace features become available
3. Go to **Settings → Marketplace** (or **Settings → Vendors**) to enable split payments
4. If you don't see marketplace option, contact Cashfree support to enable it

**Note:** You can still use split payments even without marketplace features - our code handles it via API.

---

### Q2: Which PAN should I use - Business PAN or My Individual PAN?

**Answer:** You need **TWO separate Cashfree accounts** with **different PANs**:

#### Account 1: Merchant Account (Business Owner)
- **Use:** **Business PAN** (the business's PAN number)
- **Who creates it:** The business owner (person you're making the app for)
- **Receives:** 99% of payments
- **Purpose:** Main payment recipient

#### Account 2: Developer Account (You)
- **Use:** **Your Individual PAN** (your personal PAN number)
- **Who creates it:** You (the developer)
- **Receives:** 1% commission automatically
- **Purpose:** Commission recipient

---

## 📋 Step-by-Step Setup

### Step 1: Business Owner Creates Account
1. Go to https://www.cashfree.com/
2. Sign up with **business email**
3. Enter **business PAN** when asked
4. Complete business details and KYC
5. Get verified

### Step 2: You Create Your Account
1. Go to https://www.cashfree.com/
2. Sign up with **your email**
3. Enter **your personal PAN** when asked
4. Complete your details and KYC
5. Get verified

### Step 3: Get Account IDs
**From Merchant Account:**
- Login → Settings → Account Details → Copy **Account ID**

**From Your Account:**
- Login → Settings → Account Details → Copy **Account ID**

### Step 4: Get API Keys (From Merchant Account)
- Login to merchant's Cashfree dashboard
- Settings → Developer → API Keys
- Copy **App ID** and **Secret Key**

### Step 5: Configure in Vercel
Add these environment variables:

```
CASHFREE_APP_ID=from_merchant_account
CASHFREE_SECRET_KEY=from_merchant_account
CASHFREE_ENV=sandbox
CASHFREE_MERCHANT_ACCOUNT_ID=merchant_account_id
CASHFREE_DEVELOPER_ACCOUNT_ID=your_account_id
```

---

## ✅ Summary

- **Two accounts needed:** One for business (business PAN), one for you (your PAN)
- **Marketplace option:** Not during signup, enable after account creation
- **Split payments:** Automatically configured in code (1% to you, 99% to business)
- **Both accounts must be verified** before split payments work

---

## 🆘 Need Help?

- **Cashfree Support:** support@cashfree.com
- **Cashfree Docs:** https://docs.cashfree.com/
- **Live Chat:** Available in Cashfree Dashboard

