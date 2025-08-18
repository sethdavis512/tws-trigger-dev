import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { polar, checkout, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';

import { prisma } from '~/db.server';

// Initialize Polar client
const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox"
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day
    },
    user: {
        additionalFields: {
            credits: {
                type: 'number',
                fieldName: 'credits',
                returned: true,
                input: false,
                required: false
            },
            polarCustomerId: {
                type: 'string',
                fieldName: 'polarCustomerId',
                returned: true,
                input: false,
                required: false
            },
            subscriptionTier: {
                type: 'string',
                fieldName: 'subscriptionTier',
                returned: true,
                input: false,
                required: false
            }
        }
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true, // Auto-create Polar customers
            use: [
                checkout({
                    products: [
                        { productId: "prod_starter_50", slug: "starter" },
                        { productId: "prod_power_200", slug: "power" },
                        { productId: "prod_pro_500", slug: "pro" }
                    ],
                    successUrl: "/billing/success?checkout_id={CHECKOUT_ID}",
                    authenticatedUsersOnly: true
                }),
                portal(), // Customer portal management
                usage(), // Usage-based billing events
                webhooks() // Automatic webhook handling
            ]
        })
    ],
    onAPIError: {
        throw: false, // Don't throw errors automatically
        onError: (error, ctx) => {
            // Log errors but don't crash the application
            console.error('Better Auth API Error:', {
                error: error instanceof Error ? error.message : String(error),
                context: ctx
            });
        }
    }
});
