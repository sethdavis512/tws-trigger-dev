import { data, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { getImageById } from '~/models/image.server';
import type { Route } from './+types/fullscreen';

export async function loader({ params }: Route.LoaderArgs) {
    const imageId = params.imageId;

    if (!imageId) {
        throw new Response('Image ID is required', { status: 400 });
    }

    const image = await getImageById(imageId);

    if (!image) {
        throw new Response('Image not found', { status: 404 });
    }

    return data({ image });
}

export default function FullscreenRoute({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();

    // Listen for ESC key to go back
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                navigate(-1);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-90" />

            {/* Fullscreen Image Container */}
            <div className="relative max-w-screen-lg max-h-screen w-full h-full flex items-center justify-center p-4">
                {loaderData.image.url ? (
                    <img
                        src={loaderData.image.url}
                        alt={
                            loaderData.image.prompt?.theme || 'Generated image'
                        }
                        className="max-w-full max-h-full object-contain"
                    />
                ) : loaderData.image.base64 ? (
                    <img
                        src={`data:image/png;base64,${loaderData.image.base64}`}
                        alt={
                            loaderData.image.prompt?.theme || 'Generated image'
                        }
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <div className="bg-gray-700 rounded-lg p-8">
                        <span className="text-white">No image available</span>
                    </div>
                )}

                {/* Close button */}
                <button
                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Image info overlay */}
                {loaderData.image.prompt && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-1">
                            {loaderData.image.prompt.theme}
                        </h3>
                        <p className="text-sm text-gray-300 mb-2">
                            {loaderData.image.prompt.description}
                        </p>
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>
                                {loaderData.image.size || 'Unknown size'}
                            </span>
                            <span>
                                {new Date(
                                    loaderData.image.createdAt
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
