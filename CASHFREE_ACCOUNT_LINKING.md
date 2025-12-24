# Cashfree Account Linking Guide - How Split Payments Work

## ✅ Yes, Business Needs Separate Account

**Answer:** Yes, the business owner should create a **separate Cashfree account** with:
- **Different email address** (not the same as yours)
- **Business PAN** (not your personal PAN)
- **Business bank account details**

---

## 🔗 How Accounts Are Linked

The accounts are **NOT directly linked in Cashfree**. Instead, they are linked through **our code configuration** using Account IDs. Here's how it works:

### Step-by-Step Linking Process:

#### 1. Business Owner Creates Account
- Go to https://www.cashfree.com/
- Sign up with **business email** (different from yours)
- Use **business PAN**
- Complete KYC and get verified
- **Get Account ID:** Settings → Account Details → Copy Account ID

#### 2. You Already Have Your Account ✅
- You've created with your individual PAN
- **Get Your Account ID:** Settings → Account Details → Copy Account ID

#### 3. Get API Keys (From Business Account)
- Business owner logs into their Cashfree dashboard
- Go to **Settings → Developer → API Keys**
- Copy:
  - **App ID** (Client ID)
  - **Secret Key** (Client Secret)

#### 4. Link Accounts in Vercel Environment Variables

In your Vercel project, add these environment variables:

```
CASHFREE_APP_ID=from_business_account
CASHFREE_SECRET_KEY=from_business_account
CASHFREE_ENV=sandbox
CASHFREE_MERCHANT_ACCOUNT_ID=business_account_id_here
CASHFREE_DEVELOPER_ACCOUNT_ID=your_account_id_here
```

**That's it!** The accounts are now "linked" through the code configuration.

---

## 💰 How 99:1 Split Works Automatically

### The Magic Happens in the Code:

When a customer makes a payment:

1. **Payment comes in** → Goes to Cashfree
2. **Our API code** (`api/cashfree-create-order.js`) automatically:
   - Calculates 99% for business
   - Calculates 1% for you
   - Tells Cashfree to split the payment
3. **Cashfree automatically transfers:**
   - 99% → Business owner's Cashfree account → Their bank
   - 1% → Your Cashfree account → Your bank

### Code Configuration (Already Done):

```javascript
// In api/cashfree-create-order.js
const totalAmount = amount;
const commissionAmount = Math.round(totalAmount * 0.01); // 1% to you
const merchantAmount = totalAmount - commissionAmount; // 99% to business

orderData.order_splits = [
  {
    vendor: merchantAccountId,  // Business account ID
    amount: merchantAmount,    // 99%
    description: 'Merchant payment (99%)'
  },
  {
    vendor: developerAccountId, // Your account ID
    amount: commissionAmount,    // 1%
    description: 'Developer commission (1%)'
  }
];
```

**You don't need to do anything manually** - it's all automatic!

---

## 📋 Complete Setup Checklist

### ✅ You (Developer):
- [x] Created account with individual PAN
- [ ] Get your Account ID (Settings → Account Details)
- [ ] Note it down: `CASHFREE_DEVELOPER_ACCOUNT_ID`

### ⏳ Business Owner:
- [ ] Create separate account with business email
- [ ] Use business PAN
- [ ] Complete KYC verification
- [ ] Get Account ID (Settings → Account Details)
- [ ] Get API Keys (Settings → Developer → API Keys)
- [ ] Note them down:
  - `CASHFREE_APP_ID`
  - `CASHFREE_SECRET_KEY`
  - `CASHFREE_MERCHANT_ACCOUNT_ID`

### ⚙️ Configuration:
- [ ] Add all environment variables in Vercel
- [ ] Deploy the app
- [ ] Test with a small payment

---

## 🔍 Where to Find Account IDs

### In Business Account:
1. Login to business Cashfree dashboard
2. Go to **Settings** → **Account Details**
3. Find **"Account ID"** or **"Merchant ID"**
4. Copy it - this is `CASHFREE_MERCHANT_ACCOUNT_ID`

### In Your Account:
1. Login to your Cashfree dashboard
2. Go to **Settings** → **Account Details**
3. Find **"Account ID"** or **"Merchant ID"**
4. Copy it - this is `CASHFREE_DEVELOPER_ACCOUNT_ID`

---

## ❓ Common Questions

### Q: Do accounts need to be "linked" in Cashfree dashboard?
**A:** No! They're linked through environment variables in your code.

### Q: Can both accounts use the same email?
**A:** No, Cashfree requires different email addresses for each account.

### Q: What if business doesn't have a separate email?
**A:** They can create a new Gmail account just for Cashfree (e.g., businessname.cashfree@gmail.com)

### Q: Will I see the 1% commission in my Cashfree dashboard?
**A:** Yes! After each payment, you'll see:
- Payment received in your Cashfree account
- You can withdraw it to your bank account

### Q: Does the business see my 1% commission?
**A:** They'll see the full payment amount in their dashboard, but Cashfree automatically splits it. They'll receive 99% in their account.

---

## 🎯 Summary

1. **Business creates separate account** → Different email + Business PAN
2. **Get Account IDs from both accounts**
3. **Get API keys from business account**
4. **Add all to Vercel environment variables**
5. **That's it!** Split payments work automatically

**No manual linking needed** - the code handles everything! 🚀

