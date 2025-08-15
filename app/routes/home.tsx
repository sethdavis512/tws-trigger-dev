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

// LLM Add components here...

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
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reuse a saved prompt
            </label>
            <select
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                onChange={(e) => {
                    const id = e.target.value;
                    const p = prompts.find((pp) => pp.id === id);
                    if (p) {
                        onPromptSelect(p.theme, p.description);
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
        <div className={`md:col-span-2 ${!hasPrompts ? 'md:col-start-1' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                </label>
                <button
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    onClick={onEnhance}
                    type="button"
                >
                    {isEnhancing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <SparklesIcon className="h-3 w-3" />
                    )}
                </button>
            </div>
            <input
                name="theme"
                type="text"
                required
                value={theme}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
        <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                </label>
                <button
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    onClick={onEnhance}
                    type="button"
                >
                    {isEnhancing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <SparklesIcon className="h-3 w-3" />
                    )}
                </button>
            </div>
            <textarea
                name="description"
                required
                value={description}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                rows={2}
                placeholder="Describe what you want to see in the image..."
            />
        </div>
    );
}

interface GenerateButtonProps {
    isGenerating: boolean;
}

function GenerateButton({ isGenerating }: GenerateButtonProps) {
    return (
        <div className="md:col-span-1 flex items-end">
            <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating
                    </>
                ) : (
                    <>
                        <Rocket className="h-4 w-4" />
                        Generate
                    </>
                )}
            </button>
        </div>
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

    return (
        <div className="md:col-span-1 flex flex-col justify-between">
            <div className="space-y-1">
                {submissionError && (
                    <div className="inline-flex items-center gap-1 rounded-md border border-red-600/30 bg-red-600/10 px-2 py-1 text-xs text-red-400">
                        <XCircle className="h-3 w-3" />
                        Error
                    </div>
                )}
                {combinedErrorMessage && !submissionError && (
                    <div className="inline-flex items-center gap-1 rounded-md border border-red-600/30 bg-red-600/10 px-2 py-1 text-xs text-red-400">
                        <XCircle className="h-3 w-3" />
                        Failed
                    </div>
                )}
                {realtimeError && (
                    <div className="inline-flex items-center gap-1 rounded-md border border-red-600/30 bg-red-600/10 px-2 py-1 text-xs text-red-400">
                        <XCircle className="h-3 w-3" />
                        Connection Error
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No images generated yet.</p>
            <p className="text-gray-400 text-sm mt-2">
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
        <div className="group rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden bg-blue-50 dark:bg-blue-900/20 hover:shadow-lg transition-all duration-200">
            {image.previewSrc ? (
                <Link to={`/${image.runId}/full`} className="block">
                    <img
                        src={image.previewSrc}
                        alt={image.caption ?? 'Generated image'}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                </Link>
            ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800/60 dark:to-blue-700/60 flex items-center justify-center animate-pulse">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                        <span className="text-sm text-blue-600 dark:text-blue-300">
                            Generating...
                        </span>
                    </div>
                </div>
            )}
            <div className="p-4">
                <details className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <summary className="list-none cursor-pointer select-none">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    Generating
                                </span>
                                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                                    {image.theme}
                                </h3>
                            </div>
                            <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 transition-transform">
                                ▾
                            </span>
                        </div>
                    </summary>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                        {image.description}
                    </p>
                </details>
                <div className="mt-2 text-xs text-blue-500 dark:text-blue-400">
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
            className="group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 block"
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
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
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
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                        Prompt
                                    </span>
                                    <h3 className="font-semibold text-lg">
                                        {image.prompt.theme}
                                    </h3>
                                </div>
                                <span className="ml-2 text-xs text-gray-500 transition-transform">
                                    ▾
                                </span>
                            </div>
                        </summary>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                            {image.prompt.description}
                        </p>
                    </details>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{image.size || 'Unknown size'}</span>
                    <span>
                        {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {image.runId && (
                    <div className="mt-2 text-xs text-gray-400 font-mono">
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
            <div className="w-full max-w-7xl mb-8">
                <fetcher.Form
                    method="POST"
                    action="/api/dalle"
                    className="space-y-6"
                >
                    {/* First Row */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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

                        {/* Size - Takes 1 column */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Size
                            </label>
                            <select
                                name="size"
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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

                        <GenerateButton
                            isGenerating={fetcher.state !== 'idle'}
                        />
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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

                        <ErrorDisplay
                            submissionError={submissionError}
                            combinedErrorMessage={combinedErrorMessage}
                            realtimeError={realtimeError}
                        />
                    </div>
                </fetcher.Form>
            </div>

            <ImageGallery images={allImages} />
        </div>
    );
}
