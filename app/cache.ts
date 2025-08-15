import { FlatCache } from 'flat-cache';

export const cache = new FlatCache({
    ttl: 5 * 60 * 1000, // 5 minutes
    cacheId: 'library-cache',
    persistInterval: 60 * 1000, // Auto-save every minute
    cacheDir: './cache'
});

// Cache key generators
export const getCacheKey = {
    library: (userId: string) => `library:${userId}`
};

// Cache utilities
export const cacheUtils = {
    invalidateLibrary: (userId: string) => {
        cache.removeKey(getCacheKey.library(userId));
        cache.save();
    },

    clearAll: () => {
        cache.clear();
        cache.save();
    }
};
