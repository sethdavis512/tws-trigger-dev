import { Form, Link, useNavigate } from 'react-router';
import { authClient } from '~/lib/auth.client';
import { useCallback, useState } from 'react';
import { signUpSchema, type SignUpInput } from '~/validations/auth';
import { requireAnonymous } from '~/models/session.server';
import type { Route } from './+types/sign-up';

export async function loader({ request }: Route.LoaderArgs) {
    await requireAnonymous(request);
    return null;
}

export default function SignUp() {
    const navigate = useNavigate();
    const [form, setForm] = useState<SignUpInput>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<
        Partial<Record<keyof SignUpInput, string>>
    >({});
    const [isLoading, setIsLoading] = useState(false);

    const signUp = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setErrors({});

            const parsed = signUpSchema.safeParse(form);
            if (!parsed.success) {
                const fieldErrors: Partial<Record<keyof SignUpInput, string>> =
                    {};
                for (const issue of parsed.error.issues) {
                    const key = issue.path[0] as keyof SignUpInput;
                    fieldErrors[key] ||= issue.message;
                }
                setErrors(fieldErrors);
                return;
            }

            setIsLoading(true);
            try {
                await authClient.signUp.email(
                    {
                        email: form.email,
                        password: form.password,
                        name: form.name
                    },
                    {
                        onError: (ctx) => {
                            const msg =
                                (ctx as any)?.error?.message ??
                                'Sign up failed';
                            setErrors({ password: String(msg) });
                        }
                    }
                );
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        },
        [form, navigate]
    );

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        RapiDall•E
                    </h1>
                    <h2 className="text-lg text-emerald-400 mb-1">
                        Create your account
                    </h2>
                    <p className="text-sm text-gray-400">
                        Join the creative revolution
                    </p>
                </div>
                <Form className="space-y-6" onSubmit={signUp}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-emerald-400 mb-2"
                            >
                                Full name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        name: e.target.value
                                    }))
                                }
                                disabled={isLoading}
                            />
                            {errors.name ? (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.name}
                                </p>
                            ) : null}
                        </div>
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
                                autoComplete="new-password"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Create a password"
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
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-emerald-400 mb-2"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Confirm your password"
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        confirmPassword: e.target.value
                                    }))
                                }
                                disabled={isLoading}
                            />
                            {errors.confirmPassword ? (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.confirmPassword}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <div className="text-center pt-4">
                        <span className="text-gray-400">Already have an account? </span>
                        <Link
                            to="/sign-in"
                            className="font-medium text-emerald-400 hover:text-emerald-300"
                        >
                            Sign in
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}
