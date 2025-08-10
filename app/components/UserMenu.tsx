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
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="hidden md:inline-block">{user.name}</span>
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    {credits} credits
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                {credits} credits remaining
                            </p>
                        </div>
                        <Form action="/api/auth/sign-out" method="post">
                            <button
                                type="submit"
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
