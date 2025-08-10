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
    route('sign-up', 'routes/sign-up.tsx'),
    layout('routes/authenticated.tsx', [
        route('library', 'routes/library.tsx'),
        route(':imageId/full', 'routes/fullscreen.tsx'),
        route('runs', 'routes/runs.tsx')
    ]),
    ...prefix('api', [
        route('dalle', 'routes/api/dalle.ts'),
        route('completion', 'routes/api/completion.ts'),
        route('auth/*', 'routes/api/auth.ts')
    ])
] satisfies RouteConfig;
