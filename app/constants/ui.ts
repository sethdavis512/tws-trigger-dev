// UI constants for consistent styling, timeouts, and user interface behavior

export const UI_CONSTANTS = {
    // Animation durations (in milliseconds)
    ANIMATION_FAST: 150,
    ANIMATION_NORMAL: 300,
    ANIMATION_SLOW: 500,

    // Toast/notification durations
    TOAST_SUCCESS_DURATION: 3000,
    TOAST_ERROR_DURATION: 5000,
    TOAST_WARNING_DURATION: 4000,

    // Loading states
    DEBOUNCE_DELAY: 300,
    POLLING_INTERVAL: 2000,
    RETRY_DELAY: 1000,

    // Form validation
    MIN_PASSWORD_LENGTH: 8,
    MAX_EMAIL_LENGTH: 254,
    MAX_NAME_LENGTH: 100,

    // Image generation UI
    GENERATION_TIMEOUT: 60000, // 60 seconds
    PROGRESS_UPDATE_INTERVAL: 1000,

    // Grid layouts
    IMAGES_PER_ROW_MOBILE: 1,
    IMAGES_PER_ROW_TABLET: 2,
    IMAGES_PER_ROW_DESKTOP: 3,

    // Modal and overlay
    MODAL_ANIMATION_DURATION: 200,
    BACKDROP_OPACITY: 0.5
} as const;

export const BREAKPOINTS = {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
} as const;

export const Z_INDEX = {
    DROPDOWN: 1000,
    MODAL: 1050,
    TOAST: 1100,
    TOOLTIP: 1150
} as const;

export const CSS_CLASSES = {
    // Common form styles
    INPUT_BASE:
        'appearance-none relative block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 placeholder-zinc-500 dark:placeholder-zinc-400 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',

    BUTTON_PRIMARY:
        'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',

    BUTTON_SECONDARY:
        'group relative w-full flex justify-center py-2 px-4 border border-zinc-300 text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',

    // Error styling
    ERROR_CONTAINER:
        'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded',

    // Success styling
    SUCCESS_CONTAINER:
        'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded',

    // Loading states
    SKELETON: 'animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded',
    SPINNER:
        'animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600'
} as const;

export const BRAND = {
    NAME: 'RapiDall•E',
    TAGLINE: 'AI-powered image generation',
    COPYRIGHT: '© 2025 RapiDall•E. All rights reserved.'
} as const;

// Type exports
export type UiConstant = (typeof UI_CONSTANTS)[keyof typeof UI_CONSTANTS];
export type Breakpoint = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS];
export type ZIndex = (typeof Z_INDEX)[keyof typeof Z_INDEX];
