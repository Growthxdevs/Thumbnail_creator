# Razorpay Integration Setup

This document explains how to set up Razorpay payment integration for your Text with Image app.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
```

## Getting Razorpay Credentials

1. **Sign up for Razorpay**: Go to [https://razorpay.com](https://razorpay.com) and create an account
2. **Get API Keys**:

   - Go to your Razorpay Dashboard
   - Navigate to Settings > API Keys
   - Generate API Keys for your environment (Test/Live)
   - Copy the Key ID and Key Secret

3. **Set up Webhooks**:
   - Go to Settings > Webhooks
   - Add a new webhook with URL: `https://yourdomain.com/api/razorpay/webhook`
   - Select events: `payment.captured`, `payment.failed`
   - Copy the webhook secret

## Features Implemented

### 1. Payment Flow

- **Order Creation**: Creates Razorpay orders for plan purchases
- **Payment Processing**: Handles payment through Razorpay checkout
- **Payment Verification**: Verifies payment signatures for security
- **Database Tracking**: Stores payment records in the database

### 2. API Endpoints

- `POST /api/razorpay/create-order` - Creates a new payment order
- `POST /api/razorpay/verify-payment` - Verifies payment completion
- `POST /api/razorpay/webhook` - Handles Razorpay webhooks

### 3. Database Schema

- Added `Payment` model to track all payment transactions
- Links payments to users and stores Razorpay-specific data

### 4. UI Components

- `RazorpayPayment` component for payment processing
- Updated `PlanModal` to include Razorpay as payment option
- Payment success/error handling

## Plan Configuration

The current setup includes:

- **Professional Plan**: ₹3/month
- **Currency**: INR (Indian Rupees)
- **Payment Methods**: Razorpay + PayPal

## Testing

### Test Mode

1. Use Razorpay test API keys
2. Use test card numbers provided by Razorpay
3. Test webhook locally using ngrok or similar tools

### Test Card Numbers

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Production Deployment

1. **Switch to Live Keys**: Update environment variables with live API keys
2. **Update Webhook URL**: Point webhook to your production domain
3. **Test Thoroughly**: Verify all payment flows work correctly
4. **Monitor**: Set up monitoring for failed payments and webhooks

## Security Considerations

- Payment signatures are verified on both frontend and backend
- Webhook signatures are verified to ensure authenticity
- Sensitive data is stored securely in the database
- API keys are kept in environment variables

## Troubleshooting

### Common Issues

1. **Payment Not Captured**: Check webhook configuration and signature verification
2. **Order Creation Failed**: Verify API keys and network connectivity
3. **Signature Verification Failed**: Ensure webhook secret is correct

### Debug Mode

Enable debug logging by adding console.log statements in the API routes for troubleshooting.

## Support

For Razorpay-specific issues, refer to:

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
