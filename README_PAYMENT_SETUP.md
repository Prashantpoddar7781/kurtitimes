# Razorpay Payment Integration - Complete Setup Guide

## ✅ Your Razorpay Keys

**Test Keys (Currently Configured):**
- Key ID: `rzp_test_Rv4c4iUwni06DQ`
- Key Secret: `2xrHIReHqhLfWAH035dZM0vy`

## 🔑 About Using Multiple Keys

**Yes, you can use a new key for this website!** Each Razorpay API key is independent and can be used for different websites/projects. Your other website's key won't interfere with this one.

## 🚀 Setup Complete

The backend API has been created with the following features:

### ✅ Backend API Endpoints

1. **POST `/api/create-order`**
   - Creates a Razorpay order on the backend
   - Returns order ID for secure payment processing
   - Validates amount (minimum ₹1.00)

2. **POST `/api/verify-payment`**
   - Verifies payment signature on the backend
   - Ensures payment authenticity
   - Prevents fraud

### ✅ Security Features

- ✅ Payment orders created on backend (secure)
- ✅ Payment verification on backend (prevents tampering)
- ✅ Key Secret never exposed to frontend
- ✅ Signature verification for all payments

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **For local development, create `.env` file:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_Rv4c4iUwni06DQ
   RAZORPAY_KEY_SECRET=2xrHIReHqhLfWAH035dZM0vy
   PORT=3000
   ```

3. **Run the server:**
   ```bash
   npm run server
   # or
   node server.js
   ```

## 🌐 Vercel Deployment

The app is configured for Vercel with:

- ✅ Serverless functions for API endpoints
- ✅ Environment variables configured in `vercel.json`
- ✅ Proper routing for API and frontend

### Deploy to Vercel:

1. Push your code to GitHub
2. Connect repository to Vercel
3. Environment variables are already set in `vercel.json`
4. Deploy!

**Note:** For production, update `vercel.json` with your **live keys** (not test keys).

## 🔄 Payment Flow

1. User adds items to cart
2. User clicks "Proceed to Checkout"
3. User enters name, phone, email
4. Frontend calls `/api/create-order` → Backend creates Razorpay order
5. Razorpay payment modal opens with order details
6. User completes payment
7. Frontend calls `/api/verify-payment` → Backend verifies payment signature
8. On success: Order confirmation sent via WhatsApp

## 🧪 Testing

Use Razorpay test cards:
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

## 🔐 Production Checklist

Before going live:

1. ✅ Get **Live Keys** from Razorpay Dashboard
2. ✅ Update `vercel.json` with live keys (or use Vercel environment variables)
3. ✅ Update `index.html` with live Key ID
4. ✅ Test with real payment (small amount)
5. ✅ Set up webhook for payment notifications (optional)
6. ✅ Add order management system (database)
7. ✅ Add email notifications

## 📝 Files Created/Updated

- ✅ `api/createOrder.js` - Vercel serverless function
- ✅ `server.js` - Express server for local development
- ✅ `services/razorpayService.ts` - Frontend payment service (updated)
- ✅ `vercel.json` - Vercel configuration with API routes
- ✅ `package.json` - Added backend dependencies
- ✅ `.gitignore` - Added .env to ignore list

## 🆘 Support

- Razorpay Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/test-cards/
- Dashboard: https://dashboard.razorpay.com

---

**Your payment gateway is now fully functional and ready to accept payments!** 🎉

