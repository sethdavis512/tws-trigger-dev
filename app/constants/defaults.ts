// Default values for user accounts, credits, and application settings

export const USER_DEFAULTS = {
    // New user settings
    INITIAL_CREDITS: 10,
    DEFAULT_NAME_PREFIX: 'User',
    DEFAULT_EMAIL_DOMAIN: '@example.com',

    // User limits
    MAX_CREDITS: 1000,
    MIN_CREDITS: 0,

    // Account settings
    REQUIRE_EMAIL_VERIFICATION: false
} as const;

export const SESSION_DEFAULTS = {
    // Session duration in seconds
    EXPIRES_IN: 60 * 60 * 24 * 7, // 7 days
    UPDATE_AGE: 60 * 60 * 24, // 1 day

    // Cookie settings
    SAME_SITE: 'lax' as const,
    SECURE: true,
    HTTP_ONLY: true
} as const;

export const IMAGE_GENERATION_DEFAULTS = {
    // Credit costs
    COST_PER_IMAGE: 1,

    // Generation settings
    DEFAULT_THEME: 'A beautiful landscape',
    DEFAULT_DESCRIPTION: 'A serene scene with natural lighting',

    // Retry configuration
    MAX_RETRY_ATTEMPTS: 5,
    MIN_RETRY_TIMEOUT: 2000, // 2 seconds
    MAX_RETRY_TIMEOUT: 30000, // 30 seconds
    RETRY_FACTOR: 2,
    RANDOMIZE_RETRY: true
} as const;

export const TRIGGER_DEFAULTS = {
    // Task configuration
    MAX_DURATION: 2 * 60 * 60, // 2 hours in seconds
    LOG_LEVEL: 'log' as const,

    // Retry configuration for Trigger.dev tasks
    ENABLED_IN_DEV: true,
    DEFAULT_MAX_ATTEMPTS: 5,
    DEFAULT_MIN_TIMEOUT: 2000,
    DEFAULT_MAX_TIMEOUT: 30000,
    DEFAULT_FACTOR: 2,
    DEFAULT_RANDOMIZE: true
} as const;

export const ENVIRONMENT_DEFAULTS = {
    // Node environment
    NODE_ENV: 'development',

    // Server settings
    PORT: 5173,
    HOST: 'localhost',

    // Database
    DATABASE_PROVIDER: 'postgresql',

    // Logging
    LOG_LEVEL: 'info'
} as const;

export const VALIDATION_DEFAULTS = {
    // String lengths
    MIN_STRING_LENGTH: 1,
    MAX_STRING_LENGTH: 255,

    // Email validation
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // Password requirements
    MIN_PASSWORD_LENGTH: 8,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false
} as const;

// Type exports
export type UserDefault = (typeof USER_DEFAULTS)[keyof typeof USER_DEFAULTS];
export type SessionDefault =
    (typeof SESSION_DEFAULTS)[keyof typeof SESSION_DEFAULTS];
export type ImageGenerationDefault =
    (typeof IMAGE_GENERATION_DEFAULTS)[keyof typeof IMAGE_GENERATION_DEFAULTS];
