import { useRealtimeRun } from '@trigger.dev/react-hooks';
import {
    ImageIcon,
    Loader2,
    Rocket,
    SparklesIcon,
    XCircle
} from 'lucide-react';
import { useEffect, useMemo, useState, useId } from 'react';
import { useFetcher, Link } from 'react-router';
import { StatusBadge } from './StatusBadge';
import { DESCRIPTIONS, pickRandom, THEMES } from '~/utils';
import type { Prompt } from '@prisma/client';

export function PromptCard({ prompts = [] }: { prompts?: Prompt[] }) {
    // Generate unique IDs for this card instance
    const cardId = useId();
    const fetcher = useFetcher({ key: `dalle-${cardId}` });
    const handle = fetcher.data;

    const accessToken = handle?.publicAccessToken as string | undefined;
    const runId = handle?.id as string | undefined;

    const { run, error: realtimeError } = useRealtimeRun(runId, {
        accessToken,
        enabled: !!runId && !!accessToken && !handle?.error
    });

    const status = run?.status ?? fetcher.state;
    const finished =
        run?.status === 'COMPLETED' ||
        run?.status === 'FAILED' ||
        run?.status === 'CANCELED';
    const dimClass = finished ? 'opacity-60 transition-opacity' : undefined;

    // Extract any errors from submission (server action) or the run itself
    const submissionError: { message?: string; code?: string } | undefined =
        handle?.error;
    const runError: any = (run as any)?.error || (run as any)?.output?.error;
    const combinedErrorMessage =
        submissionError?.message ||
        runError?.message ||
        (status === 'FAILED'
            ? 'Run failed. See logs in Trigger.dev.'
            : undefined);
    const combinedErrorCode = submissionError?.code || runError?.code;

    const imageUrl: string | undefined = run?.output?.image ?? undefined;
    const imageBase64: string | undefined =
        run?.output?.imageBase64 ?? undefined;
    const caption: string | undefined = run?.output?.text ?? undefined;

    const previewSrc = useMemo(() => {
        if (imageUrl) return imageUrl;
        if (imageBase64) return `data:image/png;base64,${imageBase64}`;
        return undefined;
    }, [imageUrl, imageBase64]);

    // Controlled values to allow applying a saved prompt
    const [theme, setTheme] = useState<string>(() => pickRandom(THEMES));
    const [description, setDescription] = useState<string>(() =>
        pickRandom(DESCRIPTIONS)
    );

    const themeFetcher = useFetcher({ key: `theme-${cardId}` });
    useEffect(() => {
        if (themeFetcher.data) {
            setTheme(themeFetcher.data.text);
        }
    }, [themeFetcher.data]);

    const descriptionFetcher = useFetcher({ key: `description-${cardId}` });
    useEffect(() => {
        if (descriptionFetcher.data) {
            setDescription(descriptionFetcher.data.text);
        }
    }, [descriptionFetcher.data]);

    return (
        <div className="min-w-[28rem] max-w-md rounded-xl border border-gray-200 p-4 dark:border-gray-700 bg-transparent">
            <div className={dimClass}>
                <div className="mb-4">
                    <StatusBadge status={String(status ?? 'idle')} />
                </div>
                <fetcher.Form
                    method="POST"
                    action="/api/dalle"
                    className="space-y-3"
                >
                    {prompts.length > 0 ? (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reuse a saved prompt
                            </label>
                            <select
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                disabled={finished}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const p = prompts.find(
                                        (pp) => pp.id === id
                                    );
                                    if (p) {
                                        setTheme(p.theme);
                                        setDescription(p.description);
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select a saved prompt…
                                </option>
                                {prompts.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.theme} — {p.description.slice(0, 40)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                    <div className="space-y-1">
                        <div className="flex gap-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Theme
                            </label>
                            <button
                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-60"
                                onClick={() => {
                                    themeFetcher.submit(
                                        {
                                            content: `Enhance this theme: ${theme}. Keep it brief. Max 5 words. No punctuation.`
                                        },
                                        {
                                            method: 'POST',
                                            action: '/api/completion'
                                        }
                                    );
                                }}
                                type="button"
                                disabled={
                                    finished || themeFetcher.state !== 'idle'
                                }
                            >
                                {themeFetcher.state !== 'idle' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <SparklesIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <input
                            name="theme"
                            type="text"
                            required
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            disabled={finished}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Size
                        </label>
                        <select
                            name="size"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            disabled={finished}
                            defaultValue="1024x1024"
                        >
                            <option value="256x256">256x256</option>
                            <option value="512x512">512x512</option>
                            <option value="1024x1024">1024x1024</option>
                            <option value="1024x1536">1024x1536</option>
                            <option value="1536x1024">1536x1024</option>
                            <option value="1024x1792">1024x1792</option>
                            <option value="1792x1024">1792x1024</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <div className="flex gap-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <button
                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-60"
                                onClick={() => {
                                    descriptionFetcher.submit(
                                        {
                                            content: `Enhance this description:${description}`
                                        },
                                        {
                                            method: 'POST',
                                            action: '/api/completion'
                                        }
                                    );
                                }}
                                type="button"
                                disabled={
                                    finished ||
                                    descriptionFetcher.state !== 'idle'
                                }
                            >
                                {descriptionFetcher.state !== 'idle' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <SparklesIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <textarea
                            name="description"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={finished}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            rows={3}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            disabled={
                                fetcher.state !== 'idle' ||
                                finished ||
                                status === 'EXECUTING' ||
                                status === 'QUEUED'
                            }
                        >
                            {fetcher.state !== 'idle' ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating
                                </>
                            ) : (
                                <>
                                    <Rocket className="h-4 w-4" />
                                    Generate Image
                                </>
                            )}
                        </button>
                    </div>
                </fetcher.Form>

                <div className="mt-4 space-y-3">
                    {submissionError ? (
                        <div className="inline-flex items-center gap-2 rounded-md border border-red-600/30 bg-red-600/10 px-2 py-1 text-xs text-red-400">
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                            {submissionError.message}
                            {submissionError.code ? (
                                <span className="ml-1 opacity-80">
                                    ({submissionError.code})
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                    {combinedErrorMessage && !submissionError ? (
                        <div className="inline-flex items-center gap-2 rounded-md border border-red-600/30 bg-red-600/10 px-2 py-1 text-xs text-red-400">
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                            {combinedErrorMessage}
                            {combinedErrorCode ? (
                                <span className="ml-1 opacity-80">
                                    ({combinedErrorCode})
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                    {realtimeError ? (
                        <div className="inline-flex items-center gap-2 rounded-md border border-red-600/30 bg-red-600/10 px-2 py-1 text-xs text-red-400">
                            <XCircle className="h-4 w-4" aria-hidden="true" />{' '}
                            {realtimeError.message}
                        </div>
                    ) : null}
                    {caption ? (
                        <details>
                            <summary>Caption</summary>
                            <p className="text-sm leading-relaxed">{caption}</p>
                        </details>
                    ) : null}
                </div>
            </div>

            <Link to={`/${runId}/full`}>
                <div className="mt-4">
                    {previewSrc ? (
                        <img
                            src={previewSrc}
                            alt={caption ?? 'Generated image'}
                            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                    ) : status !== 'idle' ? (
                        <div className="mt-1 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="aspect-[16/9] animate-pulse bg-gradient-to-br from-gray-800/60 to-gray-700/60" />
                            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
                                <ImageIcon className="h-4 w-4" /> Preparing
                                image…
                            </div>
                        </div>
                    ) : null}
                </div>
            </Link>
        </div>
    );
}
