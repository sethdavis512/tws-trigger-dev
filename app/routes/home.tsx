import { useState } from 'react';
import { data } from 'react-router';
import type { Route } from './+types/home';

import { getPrompts } from '~/models/prompt.server';
import { PromptCard } from '~/components/PromptCard';
import { Plus } from 'lucide-react';
import { requireUser } from '~/lib/session.server';

export function meta({}: Route.MetaArgs) {
    return [
        { title: 'New React Router App' },
        { name: 'description', content: 'Welcome to React Router!' }
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const prompts = await getPrompts(user.id);

    return data({
        prompts
    });
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const [items, setItems] = useState<Array<{ id: string }>>([
        { id: `${Date.now()}` }
    ]);

    return (
        <div className="md:col-span-10">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Generate Images
                </h2>
            </div>
            <div className="w-full overflow-x-auto">
                <div className="flex gap-6">
                    {items.map((item) => (
                        <PromptCard
                            key={item.id}
                            prompts={loaderData.prompts}
                        />
                    ))}

                    <button
                        type="button"
                        onClick={() =>
                            setItems((prev) => [
                                ...prev,
                                {
                                    id: `${Date.now()}_${prev.length + 1}`
                                }
                            ])
                        }
                        className="min-w-[28rem] max-w-md rounded-xl border-2 border-dashed border-gray-400/40 dark:border-gray-600/40 p-4 text-left hover:border-gray-300/60 dark:hover:border-gray-500/60 hover:bg-gray-50 dark:hover:bg-gray-800/30 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    >
                        <div className="flex h-full min-h-[13rem] w-full flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-500/40 dark:border-gray-600/40">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                New prompt
                            </div>
                            <div className="text-xs opacity-80 text-gray-500 dark:text-gray-500">
                                Click to add
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
