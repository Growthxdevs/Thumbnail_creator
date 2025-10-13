# Razorpay Payment Testing Guide

## 🧪 Test Scenarios

### 1. Successful Payment Test

- **Card**: `4111 1111 1111 1111`
- **Expected**: Payment success, user becomes Pro, success modal shows
- **Check**: Database should show `isPro: true` and payment record

### 2. Failed Payment Test

- **Card**: `4000 0000 0000 0002`
- **Expected**: Payment failure, user remains free tier
- **Check**: No changes to user subscription

### 3. Webhook Testing

- **Monitor**: Razorpay dashboard → Settings → Webhooks → Recent Deliveries
- **Check**: Your server logs for webhook events
- **Verify**: Payment status updates in database

## 🔍 What to Check

### Frontend Testing

- [ ] Razorpay modal opens correctly
- [ ] Payment form loads with correct amount (₹3)
- [ ] Success modal shows after successful payment
- [ ] Error handling works for failed payments
- [ ] Loading states work properly

### Backend Testing

- [ ] Order creation API works (`/api/razorpay/create-order`)
- [ ] Payment verification API works (`/api/razorpay/verify-payment`)
- [ ] Webhook endpoint receives events (`/api/razorpay/webhook`)
- [ ] Database records are created/updated correctly

### Database Verification

```sql
-- Check payment records
SELECT * FROM "Payment" ORDER BY "createdAt" DESC;

-- Check user subscription status
SELECT id, email, "isPro", "subscriptionId" FROM "User" WHERE "isPro" = true;
```

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to load Razorpay script"

**Solution**: Check internet connection, ensure Razorpay CDN is accessible

### Issue 2: "Invalid payment signature"

**Solution**: Verify `RAZORPAY_KEY_SECRET` is correct in environment variables

### Issue 3: Webhook not receiving events

**Solution**:

- Check ngrok is running
- Verify webhook URL in Razorpay dashboard
- Check webhook secret matches environment variable

### Issue 4: Payment success but user not upgraded

**Solution**: Check database connection and payment verification API

## 📊 Test Data

### Test Cards (Razorpay)

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

### Test UPI IDs

- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

## 🔧 Debug Commands

### Check Environment Variables

```bash
# In your terminal
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET
echo $RAZORPAY_WEBHOOK_SECRET
```

### Check Server Logs

```bash
# Look for these log messages
# "Payment successful: [payment_id]"
# "Payment verification error: [error]"
# "Webhook processed"
```

### Test API Endpoints Directly

```bash
# Test order creation
curl -X POST http://localhost:3000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"planType": "pro"}'
```

## ✅ Success Criteria

A successful test should show:

1. ✅ Razorpay modal opens
2. ✅ Payment processes successfully
3. ✅ Success modal appears
4. ✅ User subscription updated in database
5. ✅ Webhook events received
6. ✅ Payment record created in database

## 🚀 Production Testing

Before going live:

1. Switch to live Razorpay API keys
2. Test with real (small amount) transactions
3. Verify webhook URL points to production domain
4. Test all payment methods (cards, UPI, wallets)
5. Monitor error rates and webhook delivery
