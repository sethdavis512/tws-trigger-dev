import { Form, Link } from 'react-router';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';

interface UserMenuProps {
    user: {
        id: string;
        name: string;
        email: string;
        credits?: number | null;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const credits = user.credits ?? 0;

    return (
        <div className="relative border rounded-xl border-emerald-500 px-3 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 focus:outline-none"
            >
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <User className="w-3 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="hidden md:inline-block">{user.name}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-lg py-1 z-20 border border-emerald-200 dark:border-emerald-700">
                        <div className="px-4 py-2 border-b border-emerald-200 dark:border-emerald-700">
                            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                {user.name}
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                {user.email}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                {credits} credits remaining
                            </p>
                        </div>
                        <div className="p-4">
                            <p className="text-emerald-700 dark:text-emerald-300">
                                It's a portmanteau of "Rapid" and "DALL·E", a
                                cutting-edge AI image generation tool.
                            </p>
                        </div>
                        <Form action="/api/auth/sign-out" method="post">
                            <button
                                type="submit"
                                className="flex items-center w-full px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </button>
                        </Form>
                    </div>
                </>
            )}
        </div>
    );
}
