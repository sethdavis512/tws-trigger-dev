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
import { getUser } from '~/lib/session.server';
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
            <body className="h-full bg-white dark:bg-gray-900">
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
        <main className="flex flex-col items-center gap-10 pt-10 pb-10 min-h-screen">
            <section className="w-full px-4">
                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
                    <aside className="space-y-3 md:col-span-2 px-4">
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    RapiDall•E
                                </h1>
                                {loaderData.user && (
                                    <UserMenu user={loaderData.user} />
                                )}
                            </div>

                            {!loaderData.user && (
                                <div className="flex flex-col space-y-2 mb-6">
                                    <Link
                                        to="sign-in"
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        to="sign-up"
                                        className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 text-center"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {loaderData.user && (
                            <nav className="my-8">
                                <ul className="flex flex-col items-start gap-4 text-sm">
                                    <li>
                                        <NavLink
                                            to="/"
                                            className={({ isActive }) =>
                                                isActive
                                                    ? 'font-bold text-amber-500'
                                                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                            }
                                        >
                                            Home
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/library"
                                            className={({ isActive }) =>
                                                isActive
                                                    ? 'font-bold text-amber-500'
                                                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                            }
                                        >
                                            Library
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/runs"
                                            className={({ isActive }) =>
                                                isActive
                                                    ? 'font-bold text-amber-500'
                                                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                            }
                                        >
                                            Runs
                                        </NavLink>
                                    </li>
                                </ul>
                            </nav>
                        )}

                        {!loaderData.user && (
                            <div className="my-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Sign in to start generating AI images with
                                    DALL-E 3
                                </p>
                                <Link
                                    to="/auth/sign-up"
                                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </aside>
                    <Outlet />
                </div>
            </section>
        </main>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
