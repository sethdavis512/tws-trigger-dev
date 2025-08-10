import { Form, Link } from 'react-router';
import { authClient } from '~/lib/auth.client';
import { requireAnonymous } from '~/lib/session.server';
import type { Route } from './+types/sign-in';

export async function loader({ request }: Route.LoaderArgs) {
    await requireAnonymous(request);
    return {};
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return {
            error: 'Email and password are required'
        };
    }

    try {
        await authClient.signIn.email({
            email,
            password
        });

        // BetterAuth will handle the redirect after successful sign-in
        return { success: true };
    } catch (error) {
        return {
            error: 'Invalid email or password'
        };
    }
}

export default function SignIn({ actionData }: Route.ComponentProps) {
    return (
        <div className="col-span-10 min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                        RapiDall•E
                    </h1>
                    <h2 className="text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Sign in to your account
                    </h2>
                </div>
                <Form method="post" className="mt-8 space-y-6">
                    {actionData?.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                            {actionData.error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                        >
                            Sign in
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/sign-up"
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Don't have an account? Sign up
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}
