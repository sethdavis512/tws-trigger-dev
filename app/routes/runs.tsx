import { data } from 'react-router';
import { getImagesByRunId } from '~/models/image.server';
import { requireUser } from '~/lib/session.server';
import { prisma } from '~/db.server';
import type { Route } from './+types/runs';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    // Get all unique run IDs for this user with their images
    const runsWithImages = await prisma.image.groupBy({
        by: ['runId'],
        where: {
            userId: user.id,
            runId: { not: null }
        },
        _count: { id: true },
        _min: { createdAt: true },
        _max: { createdAt: true },
        orderBy: { _min: { createdAt: 'desc' } }
    });

    // Get detailed data for each run
    const runs = await Promise.all(
        runsWithImages.map(async (run) => {
            const images = await getImagesByRunId(run.runId!);
            return {
                runId: run.runId,
                imageCount: run._count.id,
                startedAt: run._min.createdAt,
                completedAt: run._max.createdAt,
                images
            };
        })
    );

    return data({ runs });
}

export async function action() {}

export default function RunsRoute({ loaderData }: Route.ComponentProps) {
    const { runs } = loaderData;

    return (
        <div className="col-span-10 py-8 px-4">
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    Runs
                </h1>

                {runs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="max-w-sm mx-auto">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg mb-2">
                                No runs found.
                            </p>
                            <p className="text-gray-400 text-sm">
                                Generate your first image to see runs here!
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                            {runs.length} run{runs.length !== 1 ? 's' : ''}{' '}
                            completed
                        </div>

                        <div className="space-y-3">
                            {runs.map((run) => (
                                <div
                                    key={run.runId}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                                >
                                    {/* Run Header */}
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white font-mono">
                                                    {run.runId}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        {run.imageCount} image
                                                        {run.imageCount !== 1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        {run.startedAt
                                                            ? new Date(
                                                                  run.startedAt
                                                              ).toLocaleDateString() +
                                                              ' ' +
                                                              new Date(
                                                                  run.startedAt
                                                              ).toLocaleTimeString(
                                                                  [],
                                                                  {
                                                                      hour: '2-digit',
                                                                      minute: '2-digit'
                                                                  }
                                                              )
                                                            : 'Unknown time'}
                                                    </span>
                                                    {run.completedAt !==
                                                        run.startedAt && (
                                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded-full">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {run.completedAt &&
                                                    run.startedAt
                                                        ? Math.round(
                                                              (new Date(
                                                                  run.completedAt
                                                              ).getTime() -
                                                                  new Date(
                                                                      run.startedAt
                                                                  ).getTime()) /
                                                                  1000
                                                          ) + 's'
                                                        : '0s'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Generated Images */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                Generated Images
                                            </h4>
                                        </div>

                                        {run.images.length > 0 ? (
                                            <div className="flex flex-wrap gap-3">
                                                {run.images.map((image) => (
                                                    <div
                                                        key={image.id}
                                                        className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square w-20 h-20 flex-shrink-0"
                                                    >
                                                        {image.url ? (
                                                            <img
                                                                src={image.url}
                                                                alt={
                                                                    image.prompt
                                                                        ?.theme ||
                                                                    'Generated image'
                                                                }
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                loading="lazy"
                                                            />
                                                        ) : image.base64 ? (
                                                            <img
                                                                src={`data:image/png;base64,${image.base64}`}
                                                                alt={
                                                                    image.prompt
                                                                        ?.theme ||
                                                                    'Generated image'
                                                                }
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <span className="text-gray-400 text-xs">
                                                                    No image
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Image overlay with prompt info */}
                                                        {image.prompt && (
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-200 flex items-center justify-center p-1">
                                                                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                                                                    <p className="text-xs font-medium mb-1 line-clamp-1">
                                                                        {
                                                                            image
                                                                                .prompt
                                                                                .theme
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-300 line-clamp-1">
                                                                        {
                                                                            image
                                                                                .prompt
                                                                                .description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                <p className="text-sm">
                                                    No images found for this run
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
