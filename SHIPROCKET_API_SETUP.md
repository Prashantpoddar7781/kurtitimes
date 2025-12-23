# 🔑 Shiprocket API Credentials - Step by Step Guide

## 📍 Where to Find API Credentials in Shiprocket

### Step 1: Log in to Shiprocket

1. Go to **https://www.shiprocket.in**
2. Click **Login** (top right)
3. Enter your email and password
4. Click **Login**

### Step 2: Navigate to API Settings

Once logged in:

1. **Click on your profile/account icon** (usually top right corner)
2. From the dropdown menu, select **"Settings"** or **"My Account"**
3. In the left sidebar, look for **"API Settings"** or **"Developer Settings"**
4. Click on **"API Settings"**

**Alternative Path:**
- Go directly to: **https://app.shiprocket.in/settings/api-settings**
- Or: Dashboard → Settings → API Settings

### Step 3: Generate API Credentials

In the API Settings page:

1. **You'll see two options:**
   - **Email & Password** (for authentication)
   - **API Token** (recommended for server-side)

2. **For API Token (Recommended):**
   - Click on **"Generate Token"** or **"Create Token"**
   - Give it a name (e.g., "Kurti Times Website")
   - Click **"Generate"** or **"Create"**
   - **IMPORTANT:** Copy the token immediately - it's shown only once!
   - Save it securely

3. **You'll need:**
   - **Email:** Your Shiprocket login email
   - **Password:** Your Shiprocket login password
   - **API Token:** The generated token (if using token auth)

### Step 4: What You'll Get

You'll receive:
- ✅ **Email** (your Shiprocket account email)
- ✅ **Password** (your Shiprocket account password)
- ✅ **API Token** (if generated - recommended)

## 🔐 Two Authentication Methods

### Method 1: Email & Password (Basic)
- Use your Shiprocket login credentials
- Simpler but less secure
- Good for testing

### Method 2: API Token (Recommended)
- More secure
- Can be revoked independently
- Better for production

## 📝 Where to Add Credentials

Once you have the credentials, add them to **Vercel Environment Variables**:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables:

   **Variable 1:**
   - Name: `SHIPROCKET_EMAIL`
   - Value: `your-shiprocket-email@example.com`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `SHIPROCKET_PASSWORD`
   - Value: `your-shiprocket-password`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 3 (If using Token):**
   - Name: `SHIPROCKET_API_TOKEN`
   - Value: `your-generated-api-token`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **Redeploy** after adding variables

## 🔍 Visual Guide

### API Settings Page Location:

```
Shiprocket Dashboard
  └── Settings (Top Right → Profile → Settings)
      └── API Settings (Left Sidebar)
          ├── Email & Password
          └── API Token (Generate New Token)
```

### What the Page Looks Like:

```
┌─────────────────────────────────────┐
│  API Settings                       │
├─────────────────────────────────────┤
│                                      │
│  Email & Password Authentication    │
│  ┌──────────────────────────────┐  │
│  │ Email: your@email.com         │  │
│  │ Password: ********            │  │
│  └──────────────────────────────┘  │
│                                      │
│  API Token                          │
│  ┌──────────────────────────────┐  │
│  │ [Generate Token] Button      │  │
│  │ Token Name: [________]        │  │
│  └──────────────────────────────┘  │
│                                      │
│  Generated Tokens:                  │
│  • Kurti Times Website (Active)    │
│  • Token: sr_xxxxxxxxxxxxx          │
│                                      │
└─────────────────────────────────────┘
```

## ⚠️ Important Notes

1. **API Token Security:**
   - Tokens are shown only once when generated
   - Copy and save immediately
   - Store securely (use environment variables, not code)

2. **Token Management:**
   - You can generate multiple tokens
   - Each token can be revoked independently
   - Useful for different environments (dev, staging, prod)

3. **Rate Limits:**
   - Shiprocket has API rate limits
   - Check your plan for limits
   - Usually 100-1000 requests per hour

4. **Testing:**
   - Use test mode first
   - Verify credentials work
   - Then switch to production

## 🧪 Test Your Credentials

After getting credentials, test them:

```bash
# Test API connection
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

## 📚 Shiprocket API Documentation

- **API Docs:** https://apidocs.shiprocket.in/
- **Authentication:** https://apidocs.shiprocket.in/authentication
- **Shipping Rates:** https://apidocs.shiprocket.in/shipping-rates
- **Create Order:** https://apidocs.shiprocket.in/create-order

## 🆘 Can't Find API Settings?

If you can't find API Settings:

1. **Check Account Type:**
   - Some account types may not have API access
   - Contact Shiprocket support to enable API access

2. **Contact Support:**
   - Email: support@shiprocket.in
   - Phone: 1800-123-1234
   - Live Chat: Available on website

3. **Verify Account:**
   - Complete KYC verification
   - Some features unlock after verification

## ✅ Quick Checklist

- [ ] Logged into Shiprocket dashboard
- [ ] Navigated to Settings → API Settings
- [ ] Generated API Token (or noted Email/Password)
- [ ] Copied credentials securely
- [ ] Added to Vercel environment variables
- [ ] Tested API connection
- [ ] Ready to integrate!

---

**Location:** Dashboard → Settings → API Settings  
**Direct Link:** https://app.shiprocket.in/settings/api-settings

