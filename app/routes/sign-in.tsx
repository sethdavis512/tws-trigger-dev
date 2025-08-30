import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { authClient } from '~/lib/auth.client';
import { BRAND } from '~/constants';
import { signInSchema, type SignInInput } from '~/validations/auth';
import { requireAnonymous } from '~/models/session.server';
import type { Route } from './+types/sign-in';

export async function loader({ request }: Route.LoaderArgs) {
    await requireAnonymous(request);
    return null;
}

export default function SignIn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState<SignInInput>({ email: '', password: '' });
    const [errors, setErrors] = useState<
        Partial<Record<keyof SignInInput, string>>
    >({});
    const [isLoading, setIsLoading] = useState(false);

    // Handle error messages from URL params
    const errorParam = searchParams.get('error');
    const getErrorMessage = () => {
        switch (errorParam) {
            case 'session-unavailable':
                return 'Authentication service is temporarily unavailable. Please try again.';
            case 'unexpected':
                return 'An unexpected error occurred. Please try signing in again.';
            default:
                return null;
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        const parsed = signInSchema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: Partial<Record<keyof SignInInput, string>> = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof SignInInput;
                fieldErrors[key] ||= issue.message;
            }
            setErrors(fieldErrors);
            return;
        }

        setIsLoading(true);
        try {
            await authClient.signIn.email(
                { email: form.email, password: form.password },
                {
                    onError: (ctx) => {
                        const msg =
                            (ctx as any)?.error?.message ?? 'Sign in failed';
                        setErrors({ password: String(msg) });
                    }
                }
            );
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    const errorMessage = getErrorMessage();

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {BRAND.NAME}
                    </h1>
                    <h2 className="text-lg text-emerald-400">
                        Sign in to your account
                    </h2>
                </div>

                {errorMessage && (
                    <div className="rounded-md bg-red-900/20 border border-red-800 p-4 mb-6">
                        <div className="text-sm text-red-200">
                            {errorMessage}
                        </div>
                    </div>
                )}

                <form className="space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-emerald-400 mb-2"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        email: e.target.value
                                    }))
                                }
                                disabled={isLoading}
                            />
                            {errors.email ? (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.email}
                                </p>
                            ) : null}
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-emerald-400 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        password: e.target.value
                                    }))
                                }
                                disabled={isLoading}
                            />
                            {errors.password ? (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.password}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="text-center pt-4">
                        <span className="text-gray-400">Don't have an account? </span>
                        <Link
                            to="/sign-up"
                            className="font-medium text-emerald-400 hover:text-emerald-300"
                        >
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
