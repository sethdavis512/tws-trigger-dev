// Error messages and codes for consistent error handling across the application

export const ERROR_MESSAGES = {
    // Authentication errors
    AUTH_FIELDS_REQUIRED: 'Email and password are required',
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
    AUTH_ALL_FIELDS_REQUIRED: 'All fields are required',
    AUTH_PASSWORDS_MISMATCH: "Passwords don't match",
    AUTH_PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    AUTH_ACCOUNT_CREATION_FAILED: 'Failed to create account',

    // Credit system errors
    CREDITS_INSUFFICIENT: 'Insufficient credits to generate image',
    CREDITS_INVALID_AMOUNT: 'Invalid credit amount',

    // Image generation errors
    IMAGE_GENERATION_FAILED: 'Failed to generate image',
    IMAGE_GENERATION_NO_CONTENT: 'No content, retrying…',
    IMAGE_GENERATION_TASK_ERROR: 'Task execution failed',

    // Rate limiting errors
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',

    // General errors
    UNEXPECTED_ERROR: 'An unexpected error occurred',
    PAGE_NOT_FOUND: 'The requested page could not be found',
    VALIDATION_ERROR: 'Invalid input data'
} as const;

export const ERROR_CODES = {
    // Authentication
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    AUTH_INVALID: 'AUTH_INVALID',
    AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',

    // Credits
    NO_CREDITS: 'NO_CREDITS',
    INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',

    // Image generation
    GENERATION_FAILED: 'GENERATION_FAILED',
    TRIGGER_ERROR: 'TRIGGER_ERROR',

    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

    // General
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    NOT_FOUND: 'NOT_FOUND'
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
} as const;

// Type exports for better TypeScript support
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
