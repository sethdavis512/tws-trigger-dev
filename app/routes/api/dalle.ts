import { data } from 'react-router';
import { tasks } from '@trigger.dev/sdk/v3';

import type { generateContent } from '../../../trigger/generateContent';
import type { Route } from './+types/dalle';
import type { ImageGenerateParamsBase } from 'openai/resources/images.mjs';
import { getCredits, deductCredits } from '~/models/credit.server';
import { requireUser } from '~/models/session.server';
import { cacheUtils, cache } from '~/cache';
import {
    ERROR_MESSAGES,
    ERROR_CODES,
    IMAGE_GENERATION_DEFAULTS,
    RATE_LIMITS
} from '~/constants';

// Rate limiting types and utilities
interface RateLimitInfo {
    count: number;
    windowStart: number;
    lastRequest: number;
}

function getRateLimitKey(userId: string): string {
    return `rate_limit:${userId}`;
}

function checkRateLimit(userId: string): {
    limited: boolean;
    resetTime?: number;
    remaining?: number;
} {
    const key = getRateLimitKey(userId);
    const now = Date.now();

    const rateLimitData = cache.getKey(key) as RateLimitInfo | null;

    if (!rateLimitData) {
        // First request - initialize rate limit data
        cache.setKey(key, {
            count: 1,
            windowStart: now,
            lastRequest: now
        });
        cache.save();
        return { limited: false, remaining: RATE_LIMITS.FREE_USER_HOURLY - 1 };
    }

    // Check if we need to reset the window
    const windowAge = now - rateLimitData.windowStart;
    if (windowAge >= RATE_LIMITS.WINDOW_DURATION_MS) {
        // Reset the window
        cache.setKey(key, {
            count: 1,
            windowStart: now,
            lastRequest: now
        });
        cache.save();
        return { limited: false, remaining: RATE_LIMITS.FREE_USER_HOURLY - 1 };
    }

    // Check if rate limit exceeded
    if (rateLimitData.count >= RATE_LIMITS.FREE_USER_HOURLY) {
        const resetTime =
            rateLimitData.windowStart + RATE_LIMITS.WINDOW_DURATION_MS;
        return { limited: true, resetTime };
    }

    // Increment count
    cache.setKey(key, {
        ...rateLimitData,
        count: rateLimitData.count + 1,
        lastRequest: now
    });
    cache.save();

    return {
        limited: false,
        remaining: RATE_LIMITS.FREE_USER_HOURLY - rateLimitData.count - 1
    };
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const user = await requireUser(request);

        // Check rate limit before any processing
        const rateLimitResult = checkRateLimit(user.id);

        if (rateLimitResult.limited) {
            const resetTimeMinutes = rateLimitResult.resetTime
                ? Math.ceil(
                      (rateLimitResult.resetTime - Date.now()) / (1000 * 60)
                  )
                : 60;

            return data(
                {
                    error: {
                        message: `Rate limit exceeded. You can generate ${RATE_LIMITS.FREE_USER_HOURLY} images per hour. Try again in ${resetTimeMinutes} minutes.`,
                        code: 'RATE_LIMIT_EXCEEDED',
                        resetTime: rateLimitResult.resetTime
                    }
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit':
                            RATE_LIMITS.FREE_USER_HOURLY.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset':
                            rateLimitResult.resetTime?.toString() || ''
                    }
                }
            );
        }

        // Add rate limit headers to all responses
        const rateLimitHeaders = {
            'X-RateLimit-Limit': RATE_LIMITS.FREE_USER_HOURLY.toString(),
            'X-RateLimit-Remaining':
                rateLimitResult.remaining?.toString() || '0',
            'X-RateLimit-Reset': (
                Date.now() + RATE_LIMITS.WINDOW_DURATION_MS
            ).toString()
        };

        const formData = await request.formData();
        const theme = String(formData.get('theme') ?? '');
        const description = String(formData.get('description') ?? '');
        const size = String(
            formData.get('size') ?? undefined
        ) as ImageGenerateParamsBase['size'];

        try {
            // Check if user has enough credits
            const currentCredits = await getCredits(user.id);
            if (currentCredits < IMAGE_GENERATION_DEFAULTS.COST_PER_IMAGE) {
                return data(
                    {
                        error: {
                            message: ERROR_MESSAGES.CREDITS_INSUFFICIENT,
                            code: ERROR_CODES.NO_CREDITS
                        }
                    },
                    { status: 402, headers: rateLimitHeaders }
                );
            }

            // Deduct credits before triggering the task
            await deductCredits(
                user.id,
                IMAGE_GENERATION_DEFAULTS.COST_PER_IMAGE
            );

            // Clear library cache since new image will be added
            cacheUtils.invalidateLibrary(user.id);

            /**
             * Triggers the 'generate-content' task asynchronously with the provided parameters.
             * This handle represents a reference to the triggered task execution that can be used
             * to track the task's progress, retrieve its result, or manage its lifecycle.
             *
             * @returns {Promise<TaskHandle>} A promise that resolves to a task handle object
             * containing methods and properties to interact with the running task, such as
             * checking status, waiting for completion, or canceling the operation.
             */
            const handle = await tasks.trigger<typeof generateContent>(
                'generate-content',
                { theme, description, size, userId: user.id }
            );

            return data(handle, { headers: rateLimitHeaders });
        } catch (err: any) {
            return data(
                {
                    error: {
                        message:
                            err?.message ??
                            ERROR_MESSAGES.IMAGE_GENERATION_TASK_ERROR,
                        code: err?.code ?? ERROR_CODES.TRIGGER_ERROR
                    }
                },
                { headers: rateLimitHeaders }
            );
        }
    }
}
