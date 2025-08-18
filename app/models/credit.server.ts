import { prisma } from '../db.server';
import { auth } from '~/lib/auth.server';

async function ensureUser(userId: string): Promise<void> {
    const existing = await prisma.user.findUnique({ where: { id: userId } });

    if (!existing) {
        await prisma.user.create({
            data: {
                id: userId,
                name: `User ${userId}`,
                email: `${userId}@example.com`,
                credits: 10 // Start new users with 10 credits
            }
        });
    }
}

export function getCredits(userId: string): Promise<number> {
    return ensureUser(userId).then(() =>
        prisma.user
            .findUnique({ where: { id: userId } })
            .then((user) => user?.credits ?? 0)
    );
}

export function setCredits(userId: string, amount: number): Promise<number> {
    const value = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    return ensureUser(userId).then(() =>
        prisma.user
            .update({
                where: { id: userId },
                data: { credits: value }
            })
            .then((updated) => updated.credits)
    );
}

export function addCredits(userId: string, delta: number): Promise<number> {
    const inc = Number.isFinite(delta) ? Math.floor(delta) : 0;
    if (inc <= 0) return getCredits(userId);

    return ensureUser(userId).then(() =>
        prisma.user
            .update({
                where: { id: userId },
                data: { credits: { increment: inc } }
            })
            .then((updated) => updated.credits)
    );
}

export function deductCredits(userId: string, delta: number): Promise<number> {
    const dec = Number.isFinite(delta) ? Math.floor(delta) : 0;
    if (dec <= 0) return getCredits(userId);

    return ensureUser(userId).then(() =>
        prisma.user.findUnique({ where: { id: userId } }).then((current) => {
            const newAmount = Math.max(0, (current?.credits ?? 0) - dec);
            return prisma.user
                .update({
                    where: { id: userId },
                    data: { credits: newAmount }
                })
                .then((updated) => updated.credits);
        })
    );
}

export function resetCredits(userId: string): Promise<number> {
    return setCredits(userId, 0);
}

// Enhanced functions for Polar integration
export async function trackUsage(
    userId: string,
    feature: string,
    credits: number,
    metadata?: any
): Promise<void> {
    // Record usage event for analytics/billing
    await prisma.usageEvent.create({
        data: { userId, feature, credits, metadata }
    });
    
    // Send to Polar for usage-based billing if available
    try {
        // Note: This will be available once we have proper auth.$polar setup
        // await auth.$polar?.usage.ingest({
        //     customerId: userId,
        //     events: [{
        //         name: feature,
        //         value: credits,
        //         timestamp: new Date()
        //     }]
        // });
    } catch (error) {
        console.warn('Could not send usage data to Polar:', error);
    }
}

export async function deductCreditsWithTracking(
    userId: string,
    credits: number,
    feature: string,
    metadata?: any
): Promise<number> {
    // Deduct credits
    const newBalance = await deductCredits(userId, credits);
    
    // Track usage
    await trackUsage(userId, feature, credits, metadata);
    
    return newBalance;
}

export function getSubscriptionCredits(userId: string) {
    return prisma.user
        .findUnique({
            where: { id: userId },
            select: {
                credits: true
                // TODO: Add these fields after running migration:
                // subscriptionTier: true,
                // subscriptionStatus: true,
                // billingPeriodEnd: true,
                // monthlyCreditsUsed: true,
            }
        })
        .then(user => {
            // Temporary implementation until migration is run
            return {
                subscription: false,
                tier: 'free',
                monthlyAllowance: 10,
                used: 0,
                remaining: 0,
                purchasedCredits: user?.credits || 0,
                billingPeriodEnd: null
            };
        });
}

export async function grantCreditsFromPurchase(
    userId: string,
    polarOrderId: string, 
    credits: number,
    amountCents: number
): Promise<void> {
    await prisma.$transaction([
        // Grant credits
        prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: credits } }
        }),
        // Record transaction
        prisma.transaction.create({
            data: {
                userId,
                polarOrderId,
                type: 'CREDIT_PURCHASE',
                credits,
                amountCents,
                status: 'COMPLETED'
            }
        })
    ]);
}
