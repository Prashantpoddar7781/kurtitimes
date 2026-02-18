# How to Verify Shiprocket is Working

## 1. **Vercel Environment Variables**
Ensure these are set in Vercel Dashboard → Settings → Environment Variables:

- **SHIPROCKET_EMAIL** – Your Shiprocket login email  
- **SHIPROCKET_PASSWORD** – Your Shiprocket login password  

**OR** (recommended):

- **SHIPROCKET_API_KEY** – API key from Shiprocket Dashboard  

## 2. **Shiprocket Pickup Location**
- Log in at https://app.shiprocket.in  
- Go to **Settings → Pickup Locations**  
- Create a pickup location named **"warehouse"** (or update the code to use your actual pickup location name)  

## 3. **Test a Real Order**
1. Add items to cart and proceed to checkout  
2. Fill in shipping address and click Pay  
3. Complete payment on Cashfree  
4. You should return to the success page  

## 4. **Success = Shiprocket is Working**
If Shiprocket is set up correctly, you will see:

- **Success screen**: “Shipment created ✓ AWB: [code] · [Courier name]”  
- **WhatsApp message**: Contains Shipment ID, AWB code, and Courier name  

## 5. **Check Shiprocket Dashboard**
- Go to https://app.shiprocket.in  
- Open **Orders**  
- Your order should appear there shortly after payment  

## 6. **If It Fails**
- Open browser DevTools (F12) → **Console**  
- Look for “Shiprocket error:” messages  
- Check Vercel **Functions** logs for shiprocket-auth and shiprocket-create-shipment  

## 7. **Quick API Test**
Visit in browser (POST required, or use Postman):

```
https://kurtitimes.vercel.app/api/shiprocket-auth
```

Send a POST request. A 200 response with a `token` means Shiprocket auth is working.
