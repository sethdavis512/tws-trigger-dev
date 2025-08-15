import { data, Link, useRevalidator } from 'react-router';
import type { Prompt } from '@prisma/client';
import type { Route } from './+types/home';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import { Loader2, Rocket, SparklesIcon, XCircle } from 'lucide-react';
import { useEffect, useMemo, useReducer, useId } from 'react';
import { useFetcher } from 'react-router';

import { getPrompts } from '~/models/prompt.server';
import { requireUser } from '~/models/session.server';
import { cache } from '~/cache';
import { getImages } from '~/models/image.server';
import type { Image } from '~/models/image.server';
import { DESCRIPTIONS, pickRandom, THEMES } from '~/utils';

type ImageWithPrompt = Image & { prompt: Prompt | null };

// Reducer state and actions
interface AppState {
    theme: string;
    description: string;
    submissions: Map<
        string,
        {
            theme: string;
            description: string;
            submittedAt: number;
        }
    >;
}

type AppAction =
    | { type: 'SET_THEME'; payload: string }
    | { type: 'SET_DESCRIPTION'; payload: string }
    | {
          type: 'ADD_SUBMISSION';
          payload: { runId: string; theme: string; description: string };
      }
    | { type: 'REMOVE_SUBMISSION'; payload: string }
    | {
          type: 'APPLY_SAVED_PROMPT';
          payload: { theme: string; description: string };
      }
    | { type: 'GENERATE_NEW_RANDOM_PROMPT' };

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_DESCRIPTION':
            return { ...state, description: action.payload };
        case 'ADD_SUBMISSION':
            const newSubmissions = new Map(state.submissions);
            newSubmissions.set(action.payload.runId, {
                theme: action.payload.theme,
                description: action.payload.description,
                submittedAt: Date.now()
            });
            return { ...state, submissions: newSubmissions };
        case 'REMOVE_SUBMISSION':
            const updatedSubmissions = new Map(state.submissions);
            updatedSubmissions.delete(action.payload);
            return { ...state, submissions: updatedSubmissions };
        case 'APPLY_SAVED_PROMPT':
            return {
                ...state,
                theme: action.payload.theme,
                description: action.payload.description
            };
        case 'GENERATE_NEW_RANDOM_PROMPT':
            return {
                ...state,
                theme: pickRandom(THEMES),
                description: pickRandom(DESCRIPTIONS)
            };
        default:
            return state;
    }
}

export function meta() {
    return [
        { title: 'AI Typography & Art Generator' },
        {
            name: 'description',
            content:
                'Create stunning typography designs and artistic compositions with AI-powered generation using DALL-E 3.'
        }
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const prompts = await getPrompts(user.id);
    const images = await getImages(user.id);

    return data({
        prompts,
        images
    });
}

// Client cache state
let isInitialRequest = true;

// Utility function to generate a unique cache key
function generateKey(request: Request): string {
    const url = new URL(request.url);
    return `home:${url.pathname}:${url.search}`;
}

export async function clientLoader({
    request,
    serverLoader
}: Route.ClientLoaderArgs) {
    const cacheKey = generateKey(request);

    if (isInitialRequest) {
        isInitialRequest = false;
        const serverData = await serverLoader();
        cache.setKey(cacheKey, serverData);
        cache.save();
        return serverData;
    }

    const cachedData = cache.getKey(cacheKey);
    if (cachedData) {
        console.log('📦 Home data loaded from client cache');
        return cachedData;
    }

    console.log('🔍 Cache miss - fetching from server');
    const serverData = await serverLoader();
    cache.setKey(cacheKey, serverData);
    cache.save();
    return serverData;
}

// Force clientLoader to run on hydration to prime the cache
clientLoader.hydrate = true;

interface PromptSelectorProps {
    prompts: Array<{
        id: string;
        theme: string;
        description: string;
        userId: string;
        createdAt: Date;
    }>;
    onPromptSelect: (theme: string, description: string) => void;
}

function PromptSelector({ prompts, onPromptSelect }: PromptSelectorProps) {
    if (prompts.length === 0) return null;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                Reuse a saved prompt
            </label>
            <select
                onChange={(e) => {
                    const selectedPrompt = prompts.find(
                        (p) => p.id === e.target.value
                    );
                    if (selectedPrompt) {
                        onPromptSelect(
                            selectedPrompt.theme,
                            selectedPrompt.description
                        );
                    }
                }}
                className="w-full h-10 rounded-lg border border-emerald-300 dark:border-emerald-600 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-zinc-800 text-emerald-900 dark:text-emerald-100 shadow-sm"
                defaultValue=""
            >
                <option value="" disabled>
                    Select a saved prompt...
                </option>
                {prompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                        {prompt.theme}: {prompt.description.slice(0, 50)}
                        {prompt.description.length > 50 ? '...' : ''}
                    </option>
                ))}
            </select>
        </div>
    );
}

interface ThemeInputProps {
    theme: string;
    onChange: (theme: string) => void;
    onEnhance: () => void;
    isEnhancing: boolean;
    hasPrompts: boolean;
}

function ThemeInput({
    theme,
    onChange,
    onEnhance,
    isEnhancing,
    hasPrompts
}: ThemeInputProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Theme
                </label>
                <button
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-300 dark:border-emerald-600 px-2 py-1 text-xs hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:hover:bg-emerald-900/20 bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm"
                    onClick={onEnhance}
                    type="button"
                    disabled={isEnhancing || !theme.trim()}
                >
                    {isEnhancing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <SparklesIcon className="h-3 w-3" />
                    )}
                    <span>Enhance</span>
                </button>
            </div>
            <input
                name="theme"
                type="text"
                required
                value={theme}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 rounded-lg border border-emerald-300 dark:border-emerald-600 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-zinc-800 text-emerald-900 dark:text-emerald-100 shadow-sm"
                placeholder="Enter a theme..."
            />
        </div>
    );
}

interface DescriptionInputProps {
    description: string;
    onChange: (description: string) => void;
    onEnhance: () => void;
    isEnhancing: boolean;
}

function DescriptionInput({
    description,
    onChange,
    onEnhance,
    isEnhancing
}: DescriptionInputProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Description
                </label>
                <button
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-300 dark:border-emerald-600 px-2 py-1 text-xs hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:hover:bg-emerald-900/20 bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm"
                    onClick={onEnhance}
                    type="button"
                    disabled={isEnhancing || !description.trim()}
                >
                    {isEnhancing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <SparklesIcon className="h-3 w-3" />
                    )}
                    <span>Enhance</span>
                </button>
            </div>
            <textarea
                name="description"
                required
                value={description}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-emerald-300 dark:border-emerald-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-zinc-800 text-emerald-900 dark:text-emerald-100 resize-none shadow-sm"
                rows={2}
                placeholder="Describe what you want to see in the image..."
            />
        </div>
    );
}

interface GenerateButtonProps {
    isGenerating: boolean;
    isRateLimited?: boolean;
}

function GenerateButton({ isGenerating, isRateLimited }: GenerateButtonProps) {
    return (
        <button
            type="submit"
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm ${
                isRateLimited
                    ? 'bg-zinc-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md focus:ring-emerald-500 dark:focus:ring-emerald-400 transform hover:scale-105 active:scale-95'
            }`}
            disabled={isGenerating || isRateLimited}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Image...
                </>
            ) : isRateLimited ? (
                <>
                    <XCircle className="h-4 w-4" />
                    Rate Limited
                </>
            ) : (
                <>
                    <Rocket className="h-4 w-4" />
                    Generate Image
                </>
            )}
        </button>
    );
}

interface ErrorDisplayProps {
    submissionError?: { message?: string; code?: string };
    combinedErrorMessage?: string;
    realtimeError?: any;
}

function ErrorDisplay({
    submissionError,
    combinedErrorMessage,
    realtimeError
}: ErrorDisplayProps) {
    if (!submissionError && !combinedErrorMessage && !realtimeError) {
        return null;
    }

    // Handle rate limit specific error
    const isRateLimited = submissionError?.code === 'RATE_LIMIT_EXCEEDED';

    return (
        <div className="flex flex-col gap-2">
            {submissionError && (
                <div
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                        isRateLimited
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/30 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-700/30 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                >
                    <XCircle className="h-4 w-4" />
                    {isRateLimited ? 'Rate Limited' : 'Error'}
                </div>
            )}
            {combinedErrorMessage && !submissionError && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-700/30 dark:bg-red-900/20 dark:text-red-400">
                    <XCircle className="h-4 w-4" />
                    Failed
                </div>
            )}
            {realtimeError && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-700/30 dark:bg-red-900/20 dark:text-red-400">
                    <XCircle className="h-4 w-4" />
                    Connection Error
                </div>
            )}

            {/* Show detailed error message for rate limiting */}
            {isRateLimited && submissionError?.message && (
                <div className="text-sm text-emerald-600 dark:text-emerald-400 max-w-sm break-words bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-md border border-emerald-200 dark:border-emerald-700/30">
                    {submissionError.message}
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-12">
            <p className="text-emerald-600 dark:text-emerald-400 text-lg">
                No images generated yet.
            </p>
            <p className="text-emerald-500 dark:text-emerald-500 text-sm mt-2">
                Generate your first image to see it here!
            </p>
        </div>
    );
}

interface LoadingImageCardProps {
    image: {
        id: string;
        theme: string;
        description: string;
        status: string;
        runId: string;
        previewSrc?: string;
        caption?: string;
    };
}

function LoadingImageCard({ image }: LoadingImageCardProps) {
    return (
        <div className="group rounded-lg border border-emerald-200 dark:border-emerald-700 overflow-hidden bg-emerald-50 dark:bg-emerald-900/20 hover:shadow-lg transition-all duration-200">
            {image.previewSrc ? (
                <Link to={`/${image.runId}/full`} className="block">
                    <img
                        src={image.previewSrc}
                        alt={image.caption ?? 'Generated image'}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                </Link>
            ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800/60 dark:to-emerald-700/60 flex items-center justify-center animate-pulse">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-300">
                            Generating...
                        </span>
                    </div>
                </div>
            )}
            <div className="p-4">
                <details className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <summary className="list-none cursor-pointer select-none">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-start gap-2">
                                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                    Generating
                                </span>
                                <h3 className="font-semibold text-lg text-emerald-900 dark:text-emerald-100">
                                    {image.theme}
                                </h3>
                            </div>
                            <span className="ml-2 text-xs text-emerald-500 dark:text-emerald-400 transition-transform">
                                ▾
                            </span>
                        </div>
                    </summary>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-2">
                        {image.description}
                    </p>
                </details>
                <div className="mt-2 text-xs text-emerald-500 dark:text-emerald-400">
                    Status: {image.status}
                </div>
            </div>
        </div>
    );
}

interface RegularImageCardProps {
    image: ImageWithPrompt & {
        id: string;
        url?: string;
        base64?: string;
        size?: string;
        createdAt: Date;
        runId?: string;
    };
}

function RegularImageCard({ image }: RegularImageCardProps) {
    return (
        <Link
            to={`/${image.id}/full`}
            className="group rounded-lg border border-emerald-200 dark:border-emerald-700 overflow-hidden bg-white dark:bg-zinc-800 hover:shadow-lg transition-all duration-200 block"
        >
            {image.url ? (
                <img
                    src={image.url}
                    alt={image.prompt?.theme || 'Generated image'}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                />
            ) : image.base64 ? (
                <img
                    src={`data:image/png;base64,${image.base64}`}
                    alt={image.prompt?.theme || 'Generated image'}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                />
            ) : (
                <div className="w-full aspect-square bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                    <span className="text-emerald-400 dark:text-emerald-500">
                        No image available
                    </span>
                </div>
            )}

            <div className="p-4">
                {image.prompt && (
                    <details
                        className="mb-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <summary className="list-none cursor-pointer select-none">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col items-start gap-2">
                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                        Prompt
                                    </span>
                                    <h3 className="font-semibold text-lg text-emerald-900 dark:text-emerald-100">
                                        {image.prompt.theme}
                                    </h3>
                                </div>
                                <span className="ml-2 text-xs text-emerald-500 dark:text-emerald-400 transition-transform">
                                    ▾
                                </span>
                            </div>
                        </summary>
                        <p className="text-emerald-600 dark:text-emerald-300 text-sm mt-2">
                            {image.prompt.description}
                        </p>
                    </details>
                )}

                <div className="flex items-center justify-between text-xs text-emerald-500 dark:text-emerald-400">
                    <span>{image.size || 'Unknown size'}</span>
                    <span>
                        {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {image.runId && (
                    <div className="mt-2 text-xs text-emerald-400 dark:text-emerald-500 font-mono">
                        Run: {image.runId.slice(0, 8)}...
                    </div>
                )}
            </div>
        </Link>
    );
}

interface ImageCardProps {
    image: any;
}

function ImageCard({ image }: ImageCardProps) {
    if (image.isLoading) {
        return <LoadingImageCard image={image} />;
    }
    return <RegularImageCard image={image} />;
}

interface ImageGalleryProps {
    images: any[];
}

function ImageGallery({ images }: ImageGalleryProps) {
    if (images.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
            {images.map((image: any) => (
                <div key={image.id}>
                    <ImageCard image={image} />
                </div>
            ))}
        </div>
    );
}

export default function Home({ loaderData }: Route.ComponentProps) {
    // Type assertion for the expected data shape
    const { prompts, images } = loaderData as {
        prompts: Array<{
            id: string;
            theme: string;
            description: string;
            userId: string;
            createdAt: Date;
        }>;
        images: ImageWithPrompt[];
    };

    const cardId = useId();
    const fetcher = useFetcher({ key: `dalle-${cardId}` });
    const revalidator = useRevalidator();
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

    // Check if user is rate limited
    const isRateLimited = submissionError?.code === 'RATE_LIMIT_EXCEEDED';

    // Component state using useReducer
    const [state, dispatch] = useReducer(appReducer, {
        theme: pickRandom(THEMES),
        description: pickRandom(DESCRIPTIONS),
        submissions: new Map()
    });

    const themeFetcher = useFetcher({ key: `theme-${cardId}` });
    const descriptionFetcher = useFetcher({ key: `description-${cardId}` });

    // Update theme when AI enhancement completes
    if (themeFetcher.data?.text && themeFetcher.data.text !== state.theme) {
        dispatch({ type: 'SET_THEME', payload: themeFetcher.data.text });
    }

    // Update description when AI enhancement completes
    if (
        descriptionFetcher.data?.text &&
        descriptionFetcher.data.text !== state.description
    ) {
        dispatch({
            type: 'SET_DESCRIPTION',
            payload: descriptionFetcher.data.text
        });
    }

    // Track new submissions when runId changes
    if (runId && !state.submissions.has(runId) && fetcher.data) {
        dispatch({
            type: 'ADD_SUBMISSION',
            payload: {
                runId,
                theme: state.theme,
                description: state.description
            }
        });

        // Generate new random prompt for next submission
        dispatch({ type: 'GENERATE_NEW_RANDOM_PROMPT' });
    }

    // Create loading images from active submissions
    const loadingImages = useMemo(() => {
        const existingRunIds = new Set(
            images.map((img) => img.runId).filter(Boolean)
        );

        return Array.from(state.submissions.entries())
            .filter(([submissionRunId]) => {
                // Don't show loading if we already have the completed image
                if (existingRunIds.has(submissionRunId)) {
                    return false;
                }

                // Only show if run is not finished
                if (submissionRunId === runId) {
                    return !finished;
                }
                // For other runs, only show them for a short time (5 minutes max)
                const submission = state.submissions.get(submissionRunId);
                if (submission) {
                    const ageInMinutes =
                        (Date.now() - submission.submittedAt) / (1000 * 60);
                    return ageInMinutes < 5; // Remove submissions older than 5 minutes
                }
                return false;
            })
            .map(([submissionRunId, submission]) => ({
                id: `loading-${submissionRunId}`,
                theme: submission.theme,
                description: submission.description,
                status:
                    submissionRunId === runId
                        ? String(status ?? 'idle')
                        : 'queued',
                runId: submissionRunId,
                isLoading: true,
                submittedAt: submission.submittedAt
            }))
            .sort((a, b) => b.submittedAt - a.submittedAt); // Most recent first
    }, [state.submissions, runId, finished, status]);

    // Clean up finished submissions periodically
    useEffect(() => {
        if (finished && runId) {
            const timer = setTimeout(() => {
                dispatch({ type: 'REMOVE_SUBMISSION', payload: runId });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [finished, runId]);

    // Clean up old submissions that might be stuck
    useEffect(() => {
        const cleanupTimer = setInterval(() => {
            const now = Date.now();
            Array.from(state.submissions.entries()).forEach(
                ([submissionRunId, submission]) => {
                    const ageInMinutes =
                        (now - submission.submittedAt) / (1000 * 60);
                    // Remove submissions older than 10 minutes
                    if (ageInMinutes > 10) {
                        console.log(
                            '🧹 Cleaning up old submission:',
                            submissionRunId
                        );
                        dispatch({
                            type: 'REMOVE_SUBMISSION',
                            payload: submissionRunId
                        });
                    }
                }
            );
        }, 60 * 1000); // Check every minute

        return () => clearInterval(cleanupTimer);
    }, [state.submissions]);

    // Invalidate cache and revalidate when run completes
    useEffect(() => {
        if (finished && runId && run?.status === 'COMPLETED') {
            console.log(
                '🎉 Run completed, invalidating cache and revalidating...',
                { runId, status: run.status }
            );

            // Clear client cache to force fresh data load
            const url = new URL(window.location.href);
            const cacheKey = `home:${url.pathname}:${url.search}`;
            cache.removeKey(cacheKey);
            cache.save();

            // Revalidate the route to get fresh data
            revalidator.revalidate();
        }
    }, [finished, runId, run?.status, revalidator]);

    // Combine loading images with actual images, loading first
    const allImages = [...loadingImages, ...images];

    return (
        <div className="md:col-span-10">
            <div className="w-full mb-8">
                <fetcher.Form
                    method="POST"
                    action="/api/dalle"
                    className="bg-white dark:bg-zinc-900 rounded-lg border border-emerald-200 dark:border-emerald-800 p-6 shadow-sm"
                >
                    {/* First Row - Main Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <PromptSelector
                            prompts={prompts}
                            onPromptSelect={(theme, description) => {
                                dispatch({
                                    type: 'APPLY_SAVED_PROMPT',
                                    payload: { theme, description }
                                });
                            }}
                        />

                        <ThemeInput
                            theme={state.theme}
                            onChange={(theme) =>
                                dispatch({ type: 'SET_THEME', payload: theme })
                            }
                            onEnhance={() => {
                                themeFetcher.submit(
                                    {
                                        content: `Enhance this theme: ${state.theme}. Keep it brief. Max 5 words. No punctuation.`
                                    },
                                    {
                                        method: 'POST',
                                        action: '/api/completion'
                                    }
                                );
                            }}
                            isEnhancing={themeFetcher.state !== 'idle'}
                            hasPrompts={prompts.length > 0}
                        />

                        <DescriptionInput
                            description={state.description}
                            onChange={(description) =>
                                dispatch({
                                    type: 'SET_DESCRIPTION',
                                    payload: description
                                })
                            }
                            onEnhance={() => {
                                descriptionFetcher.submit(
                                    {
                                        content: `Enhance this description: ${state.description}`
                                    },
                                    {
                                        method: 'POST',
                                        action: '/api/completion'
                                    }
                                );
                            }}
                            isEnhancing={descriptionFetcher.state !== 'idle'}
                        />

                        {/* Size - Takes 1 column */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                Size
                            </label>
                            <select
                                name="size"
                                className="w-full h-10 rounded-lg border border-emerald-300 dark:border-emerald-600 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-zinc-800 text-emerald-900 dark:text-emerald-100 shadow-sm"
                                defaultValue="1024x1024"
                            >
                                <option value="256x256">256×256</option>
                                <option value="512x512">512×512</option>
                                <option value="1024x1024">1024×1024</option>
                                <option value="1024x1536">1024×1536</option>
                                <option value="1536x1024">1536×1024</option>
                                <option value="1024x1792">1024×1792</option>
                                <option value="1792x1024">1792×1024</option>
                            </select>
                        </div>
                    </div>

                    {/* Second Row - Action and Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-4">
                            <GenerateButton
                                isGenerating={fetcher.state !== 'idle'}
                                isRateLimited={isRateLimited}
                            />

                            <ErrorDisplay
                                submissionError={submissionError}
                                combinedErrorMessage={combinedErrorMessage}
                                realtimeError={realtimeError}
                            />
                        </div>
                    </div>
                </fetcher.Form>
            </div>

            <ImageGallery images={allImages} />
        </div>
    );
}
