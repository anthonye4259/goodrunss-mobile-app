# Stripe Setup Instructions for GoodRunss

## Getting Your Stripe Keys

### 1. Create/Login to Stripe Account
Go to: https://dashboard.stripe.com/register

### 2. Get Your API Keys

#### For Testing (Development):
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy these keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal test key")

#### For Production (Live Payments):
1. **Activate your account** first (Stripe will guide you through business verification)
2. Go to: https://dashboard.stripe.com/apikeys
3. Copy these keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...` (click "Reveal live key")

### 3. Add Keys to .env File

Open `/Users/anthonyedwards/Downloads/goodrunss-ai-mobile-app/.env` and update:

```bash
# For Production (Live Payments)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE

# OR for Testing
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 4. Restart the App
After adding keys, restart your development server:
```bash
npm start
```

## Trainer Pricing

Current default: **$50/hour**

To change pricing, edit the trainer data in:
- `lib/activity-content.ts` (sample trainers)
- Or set in Firestore `trainers` collection

## Testing Payments

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file to git (it's in `.gitignore`)
- Use test keys for development
- Only use live keys in production
- Keep secret keys secure

## Next Steps

1. Get your Stripe keys (test or live)
2. Add to `.env` file
3. Restart app
4. Test trainer booking flow
5. Verify payment processing works

Need help? Check Stripe docs: https://stripe.com/docs
