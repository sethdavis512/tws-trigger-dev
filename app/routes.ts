import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route
} from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('sign-in', 'routes/sign-in.tsx'),
    route('sign-out', 'routes/sign-out.tsx'),
    route('sign-up', 'routes/sign-up.tsx'),
    layout('routes/authenticated.tsx', [
        route(':imageId/full', 'routes/fullscreen.tsx'),
        route('billing', 'routes/authenticated/billing.tsx', [
            route('checkout', 'routes/billing/checkout.tsx'),
            route('portal', 'routes/billing/portal.tsx'),
            route('success', 'routes/billing/success.tsx')
        ])
    ]),
    ...prefix('api', [
        route('dalle', 'routes/api/dalle.ts'),
        route('completion', 'routes/api/completion.ts'),
        route('cloudinary', 'routes/api/cloudinary.ts'),
        route('auth/*', 'routes/api/auth.ts')
    ])
] satisfies RouteConfig;
