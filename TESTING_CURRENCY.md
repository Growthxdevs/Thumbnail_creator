# Currency Detection Testing Guide

## How to Test Currency Detection

### Method 1: Using Browser Console (Easiest)

1. **Open your app** in the browser
2. **Open Developer Console** (F12 or Right-click → Inspect → Console)
3. **Test INR (India)**:

   ```javascript
   localStorage.setItem("currency_test_override", "INR");
   location.reload();
   ```

   - You should see ₹99/month and ₹999/year

4. **Test USD (International)**:

   ```javascript
   localStorage.setItem("currency_test_override", "USD");
   location.reload();
   ```

   - You should see $1.20/month and $12.00/year

5. **Remove test override**:
   ```javascript
   localStorage.removeItem("currency_test_override");
   location.reload();
   ```

### Method 2: Using VPN (Real-world Testing)

1. **Test INR (India)**:

   - Use a VPN connected to India
   - Visit your app
   - Should automatically show ₹99/month and ₹999/year

2. **Test USD (International)**:
   - Use a VPN connected to US/UK/any non-India country
   - Visit your app
   - Should automatically show $1.20/month and $12.00/year

### Method 3: Change Browser Timezone/Locale

1. **For INR testing**:

   - Change your computer's timezone to "Asia/Kolkata" (India Standard Time)
   - Or change browser language to `en-IN` or `hi-IN`
   - Refresh the app

2. **For USD testing**:
   - Change timezone to any non-India timezone (e.g., "America/New_York")
   - Refresh the app

### Method 4: Network Tab Override (Advanced)

1. Open Developer Tools → Network tab
2. Find the request to `https://ipapi.co/json/`
3. Right-click → Override content
4. Create a mock response:
   ```json
   {
     "country_code": "IN",
     "country_name": "India"
   }
   ```
   - For testing USD, change `country_code` to "US"

## What to Check

### Visual Checks:

- [ ] Price displays with correct currency symbol (₹ or $)
- [ ] Monthly plan shows ₹99 or $1.20
- [ ] Yearly plan shows ₹999 or $12.00
- [ ] "Regular" price shows correct currency
- [ ] "Save" amount shows correct currency

### Functional Checks:

- [ ] Payment flow works with correct currency
- [ ] Razorpay checkout shows correct amount
- [ ] Order creation uses correct currency
- [ ] Currency persists across page refreshes (if using test override)

## Testing Payment Flow

### For INR (India):

1. Use test override: `localStorage.setItem('currency_test_override', 'INR')`
2. Reload page
3. Click "Pay with Razorpay"
4. Verify Razorpay shows ₹99 or ₹999
5. Use test card: `4111 1111 1111 1111`

### For USD (International):

1. Use test override: `localStorage.setItem('currency_test_override', 'USD')`
2. Reload page
3. Click "Pay with Razorpay"
4. Verify Razorpay shows $1.20 or $12.00
5. **Note**: Razorpay may not support USD payments well - consider using PayPal for international users

## Troubleshooting

### Currency not changing?

- Clear localStorage and reload: `localStorage.clear(); location.reload()`
- Check browser console for errors
- Verify the hook is being called (check React DevTools)

### Wrong currency detected?

- Check your actual location (IP geolocation)
- Check browser timezone settings
- Use test override to force specific currency

### Payment not working?

- Verify API routes are receiving correct currency
- Check server logs for order creation
- Ensure Razorpay account supports the currency
