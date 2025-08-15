import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration
} from 'react-router';

import type { Route } from './+types/root';
import { getUser } from '~/models/session.server';
import { UserMenu } from '~/components/UserMenu';
import './app.css';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous'
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
    }
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body className="h-full bg-emerald-50 dark:bg-zinc-900">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUser(request);

    return {
        user
    };
}

export default function App({ loaderData }: Route.ComponentProps) {
    return (
        <main className="min-h-screen px-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-100">
                        RapiDall•E
                    </h1>
                </div>
                <div>
                    <div className="py-4">
                        {loaderData.user && <UserMenu user={loaderData.user} />}

                        {!loaderData.user && (
                            <div className="flex flex-col space-y-2 mb-6">
                                <Link
                                    to="sign-in"
                                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-100"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="sign-up"
                                    className="bg-emerald-600 text-white px-3 py-2 rounded text-sm hover:bg-emerald-700 text-center"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Outlet />
        </main>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;
    let showSignIn = false;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;

        // If it's a 401/403, suggest signing in
        if (error.status === 401 || error.status === 403) {
            showSignIn = true;
            details = 'Authentication required. Please sign in to continue.';
        }
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;

        // Check if this is a session-related error
        if (
            error.message.includes('session') ||
            error.message.includes('auth')
        ) {
            showSignIn = true;
            details =
                'Authentication service encountered an error. Please try signing in again.';
        }
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <div className="max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">
                    {message}
                </h1>
                <p className="text-emerald-700 dark:text-emerald-300 mb-6">
                    {details}
                </p>

                {showSignIn && (
                    <div className="space-y-3">
                        <Link
                            to="/sign-in"
                            className="inline-block bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                        >
                            Sign In
                        </Link>
                        <br />
                        <Link
                            to="/"
                            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                )}

                {!showSignIn && (
                    <Link
                        to="/"
                        className="inline-block bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                    >
                        Go Home
                    </Link>
                )}

                {stack && (
                    <details className="mt-8 text-left">
                        <summary className="cursor-pointer text-sm text-emerald-600 dark:text-emerald-400">
                            Show technical details
                        </summary>
                        <pre className="mt-2 p-4 bg-zinc-100 dark:bg-zinc-800 rounded overflow-x-auto text-xs">
                            <code>{stack}</code>
                        </pre>
                    </details>
                )}
            </div>
        </main>
    );
}
