import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { authClient } from '~/lib/auth.client';
import { BRAND } from '~/constants';
import { signInSchema, type SignInInput } from '~/validations/auth';

export default function SignIn() {
    const navigate = useNavigate();
    const [form, setForm] = useState<SignInInput>({ email: '', password: '' });
    const [errors, setErrors] = useState<
        Partial<Record<keyof SignInInput, string>>
    >({});
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <div className="col-span-10 min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                        {BRAND.NAME}
                    </h1>
                    <h2 className="text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
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
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.email}
                                </p>
                            ) : null}
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
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.password}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                            disabled={isLoading}
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
                </form>
            </div>
        </div>
    );
}
