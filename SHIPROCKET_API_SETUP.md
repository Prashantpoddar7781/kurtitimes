# 🔑 Shiprocket API Credentials - Step by Step Guide

## 📍 How to Get API Credentials in Shiprocket

Shiprocket uses **API Users** (not tokens). You need to create a dedicated API user account.

### Step 1: Navigate to API Users

1. **Log in to Shiprocket:**
   - Go to **https://app.shiprocket.in**
   - Log in with your account

2. **Go to Settings:**
   - Click on **Settings** (gear icon in left sidebar)
   - Click on **"Additional Settings"** in the left menu
   - Click on **"API Users"**

   **Direct Link:** https://app.shiprocket.in/sellers/settings/additional-settings/api-users

### Step 2: Create New API User

1. **Click "+ Add New API User" button**
   - You'll see this button at the top right or bottom center

2. **Fill in the "Add New User" form:**

   **Email ID:**
   - Enter a unique email address (can be different from your main account)
   - Example: `api@kurtitimes.com` or `shiprocket-api@yourdomain.com`
   - ⚠️ **Required field** - must be filled

   **Allowed IPs for PII Access (Optional):**
   - Add comma-separated IP addresses if you want to restrict access
   - Leave empty for now (can add later)
   - Example: `192.168.1.1, 203.0.113.0`

   **Select Modules to Access:**
   - Check the modules you need:
     - ✅ **Orders (create, update)** - Required for creating shipments
     - ✅ **Shipments** - Required for shipping management
     - ✅ **Courier** - Required for getting shipping rates
     - ⚠️ **Settings** - Optional (for account settings)
     - ⚠️ **Listings** - Optional (for product listings)

3. **Click "Apply" button**
   - The API user will be created
   - You'll receive an email with the password (or set it manually)

### Step 3: Get Your Credentials

After creating the API user:

1. **Email:** The email you entered in the form
2. **Password:** 
   - Check your email (Shiprocket sends password via email)
   - OR reset password if needed
   - OR set a custom password

3. **Note the credentials:**
   - Email: `your-api-user@example.com`
   - Password: `password-from-email`

### Step 4: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your `kurtitimes` project

2. **Add Environment Variables:**
   - Go to **Settings** → **Environment Variables**

   **Add these variables:**

   **Variable 1:**
   - Name: `SHIPROCKET_EMAIL`
   - Value: `your-api-user-email@example.com` (the email you created)
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `SHIPROCKET_PASSWORD`
   - Value: `password-from-email` (the password for API user)
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **Redeploy** after adding variables

## 📋 Recommended Modules to Select

For shipping integration, select these modules:

- ✅ **Orders (create, update)** - Essential
- ✅ **Shipments** - Essential  
- ✅ **Courier** - Essential for shipping rates
- ⚠️ **Settings** - Optional
- ⚠️ **Listings** - Optional

## 🔐 Security Best Practices

1. **Use a Dedicated Email:**
   - Don't use your main Shiprocket account email
   - Create a separate email for API access
   - Example: `api@yourdomain.com`

2. **IP Restrictions (Optional):**
   - Add your server IPs for extra security
   - Leave empty if your server IP changes

3. **Password Security:**
   - Use a strong, unique password
   - Store in environment variables only
   - Never commit to code

## 🧪 Test Your API Credentials

After creating the API user, test the credentials:

```bash
# Test API login
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-api-user-email@example.com",
    "password": "your-api-password"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

If you get a token, your credentials are working! ✅

## 📝 What You'll See

### API Users Page:
- Shows list of all API users
- Status (Active/Inactive)
- Action buttons (Edit, Reset Password, etc.)

### Add New User Modal:
- Email ID field (required)
- Allowed IPs field (optional)
- Module checkboxes:
  - Orders (create, update)
  - Settings
  - Shipments
  - Listings
  - Courier

## ⚠️ Important Notes

1. **Email Must Be Unique:**
   - Cannot use an email already registered in Shiprocket
   - Use a different email than your main account

2. **Password:**
   - Shiprocket sends password via email
   - You can reset it later if needed
   - Keep it secure

3. **Module Access:**
   - Select only what you need
   - Can be updated later
   - More modules = more access

4. **Status:**
   - Users can be Active or Inactive
   - Inactive users cannot access API

## 🔄 Managing API Users

After creating an API user, you can:

1. **Edit User:**
   - Click on user → Edit
   - Change modules, IPs, etc.

2. **Reset Password:**
   - Click "Reset Password"
   - New password sent via email

3. **Activate/Deactivate:**
   - Toggle status
   - Inactive users cannot use API

## 🆘 Troubleshooting

### Can't Create API User?
- Check if email is already used
- Verify you have permission to create API users
- Contact Shiprocket support if needed

### Password Not Received?
- Check spam folder
- Try resetting password
- Contact Shiprocket support

### API Not Working?
- Verify modules are selected correctly
- Check if user is Active
- Test credentials with curl command above

## 📚 Shiprocket API Documentation

- **API Docs:** https://apidocs.shiprocket.in/
- **Authentication:** https://apidocs.shiprocket.in/authentication
- **Shipping Rates:** https://apidocs.shiprocket.in/shipping-rates
- **Create Order:** https://apidocs.shiprocket.in/create-order

## ✅ Quick Checklist

- [ ] Logged into Shiprocket dashboard
- [ ] Navigated to Settings → Additional Settings → API Users
- [ ] Clicked "+ Add New API User"
- [ ] Entered unique email address
- [ ] Selected required modules (Orders, Shipments, Courier)
- [ ] Clicked "Apply"
- [ ] Received password via email
- [ ] Added credentials to Vercel environment variables
- [ ] Tested API connection
- [ ] Ready to integrate!

---

**Location:** Settings → Additional Settings → API Users  
**Direct Link:** https://app.shiprocket.in/sellers/settings/additional-settings/api-users
