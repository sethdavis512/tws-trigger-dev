import { data, Link } from 'react-router';
import { getImages } from '~/models/image.server';
import { cache, getCacheKey } from '~/cache';
import { requireUser } from '~/lib/session.server';
import type { Route } from './+types/library';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const cacheKey = getCacheKey.library(user.id);

    // Try to get from cache first
    const cachedImages = cache.get(cacheKey);
    if (cachedImages && Array.isArray(cachedImages)) {
        console.log('📦 Library images loaded from cache');
        return data({ images: cachedImages });
    }

    // Cache miss - fetch from database
    console.log('🔍 Cache miss - fetching library images from database');
    const images = await getImages(user.id);

    // Store in cache
    cache.set(cacheKey, images);
    cache.save();

    return data({ images });
}

export default function Library({ loaderData }: Route.ComponentProps) {
    const { images } = loaderData;

    return (
        <div className="col-span-10 py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Image Library</h1>

            {images.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        No images generated yet.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        Generate your first image to see it here!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {images.map((image) => (
                        <Link
                            key={image.id}
                            to={`/${image.id}/full`}
                            className="group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 block"
                        >
                            {image.url ? (
                                <img
                                    src={image.url}
                                    alt={
                                        image.prompt?.theme || 'Generated image'
                                    }
                                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            ) : image.base64 ? (
                                <img
                                    src={`data:image/png;base64,${image.base64}`}
                                    alt={
                                        image.prompt?.theme || 'Generated image'
                                    }
                                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            ) : (
                                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-gray-400">
                                        No image available
                                    </span>
                                </div>
                            )}

                            <div className="p-4">
                                {image.prompt && (
                                    <>
                                        <h3 className="font-semibold text-lg mb-2">
                                            {image.prompt.theme}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                            {image.prompt.description}
                                        </p>
                                    </>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{image.size || 'Unknown size'}</span>
                                    <span>
                                        {new Date(
                                            image.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>

                                {image.runId && (
                                    <div className="mt-2 text-xs text-gray-400 font-mono">
                                        Run: {image.runId.slice(0, 8)}...
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
