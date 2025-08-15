import { Form, Link, useNavigate } from 'react-router';
import { authClient } from '~/lib/auth.client';
import { useCallback, useState } from 'react';
import { signUpSchema, type SignUpInput } from '~/validations/auth';

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
        <div className="col-span-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                            RapiDall•E
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                            AI-powered image generation
                        </p>
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Join the creative revolution
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-800 py-8 px-6 shadow-xl rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <Form className="space-y-6" onSubmit={signUp}>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                                >
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-emerald-300 dark:border-emerald-600 placeholder-emerald-500 dark:placeholder-emerald-400 text-emerald-900 dark:text-emerald-100 bg-white dark:bg-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 sm:text-sm transition-colors"
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
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.name}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-600 placeholder-zinc-500 dark:placeholder-zinc-400 text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors"
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
                                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-600 placeholder-zinc-500 dark:placeholder-zinc-400 text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors"
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
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.password}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-600 placeholder-zinc-500 dark:placeholder-zinc-400 text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors"
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
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.confirmPassword}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-md hover:shadow-lg"
                                disabled={isLoading}
                            >
                                Create Account
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/sign-in"
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}
