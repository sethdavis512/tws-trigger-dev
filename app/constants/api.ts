// API endpoints, rate limits, and API-related constants

export const API_ENDPOINTS = {
    // Authentication
    AUTH: '/api/auth',
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',

    // Image generation
    DALLE: '/api/dalle',
    COMPLETION: '/api/completion',

    // Protected routes
    LIBRARY: '/library',
    RUNS: '/runs',
    FULLSCREEN: '/:imageId/full'
} as const;

export const API_LIMITS = {
    // Rate limiting
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 1000,

    // Image generation limits
    MAX_IMAGES_PER_DAY: 50,
    MAX_CONCURRENT_GENERATIONS: 3,

    // File size limits (in bytes)
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_PROMPT_LENGTH: 1000,

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
} as const;

export const OPENAI_CONFIG = {
    // Model configurations
    CHAT_MODEL: 'gpt-4o',
    DALLE_MODEL: 'dall-e-3',

    // Image generation parameters
    DEFAULT_IMAGE_SIZE: '1024x1024' as const,
    AVAILABLE_SIZES: ['1024x1024', '1024x1792', '1792x1024'] as const,

    // Chat completion parameters
    DEFAULT_TEMPERATURE: 0.8,
    MAX_TOKENS: 4000
} as const;

export const CACHE_KEYS = {
    LIBRARY: (userId: string) => `library:${userId}`,
    USER: (userId: string) => `user:${userId}`,
    CREDITS: (userId: string) => `credits:${userId}`,
    IMAGE: (imageId: string) => `image:${imageId}`
} as const;

export const CACHE_TTL = {
    // Cache time-to-live in seconds
    LIBRARY: 5 * 60, // 5 minutes
    USER: 10 * 60, // 10 minutes
    CREDITS: 1 * 60, // 1 minute
    IMAGE: 30 * 60 // 30 minutes
} as const;

// Type exports
export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
export type ImageSize = (typeof OPENAI_CONFIG.AVAILABLE_SIZES)[number];
