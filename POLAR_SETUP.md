# Polar Integration Setup

## 1. Database Migration

After starting your PostgreSQL database, run:

```bash
npx prisma migrate dev --name add-polar-billing
```

## 2. Update Credit Function

After migration, update `app/models/credit.server.ts` - replace the `getSubscriptionCredits` function with:

```typescript
export function getSubscriptionCredits(userId: string) {
    return prisma.user
        .findUnique({
            where: { id: userId },
            select: {
                subscriptionTier: true,
                subscriptionStatus: true,
                billingPeriodEnd: true,
                monthlyCreditsUsed: true,
                credits: true
            }
        })
        .then(user => {
            const tierLimits = {
                free: 10,
                pro: 500,
                enterprise: 2000
            };
            
            const monthlyAllowance = tierLimits[user?.subscriptionTier as keyof typeof tierLimits] || 10;
            const isActive = user?.subscriptionStatus === 'ACTIVE';
            
            return {
                subscription: isActive,
                tier: user?.subscriptionTier || 'free',
                monthlyAllowance,
                used: user?.monthlyCreditsUsed || 0,
                remaining: isActive ? monthlyAllowance - (user?.monthlyCreditsUsed || 0) : 0,
                purchasedCredits: user?.credits || 0,
                billingPeriodEnd: user?.billingPeriodEnd
            };
        });
}
```

## 3. Environment Variables

Add to your `.env` file:

```env
# Polar Integration
POLAR_ACCESS_TOKEN="polar_at_your_token_here"
POLAR_WEBHOOK_SECRET="whsec_your_secret_here"
POLAR_SERVER="sandbox"

# BetterAuth
BETTER_AUTH_SECRET="your_32_char_secret_here"
BETTER_AUTH_URL="http://localhost:5173"
```

## 4. Polar Setup

1. Create a Polar organization at https://polar.sh
2. Create products with these IDs:
   - `prod_starter_50` (50 credits, $4.99)
   - `prod_power_200` (200 credits, $14.99)
   - `prod_pro_500` (500 credits/month, $24.99)
3. Set up webhooks pointing to your app
4. Copy access token and webhook secret to `.env`

## 5. Testing

Visit `/billing` while authenticated to test the integration.