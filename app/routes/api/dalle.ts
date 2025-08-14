import { data } from 'react-router';
import { tasks } from '@trigger.dev/sdk/v3';

import type { generateContent } from '../../../trigger/generateContent';
import type { Route } from './+types/dalle';
import type { ImageGenerateParamsBase } from 'openai/resources/images.mjs';
import { getCredits, deductCredits } from '~/models/credit.server';
import { requireUser } from '~/models/session.server';
import { cacheUtils } from '~/cache';
import {
    ERROR_MESSAGES,
    ERROR_CODES,
    IMAGE_GENERATION_DEFAULTS
} from '~/constants';

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const user = await requireUser(request);

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
                return Response.json(
                    {
                        error: {
                            message: ERROR_MESSAGES.CREDITS_INSUFFICIENT,
                            code: ERROR_CODES.NO_CREDITS
                        }
                    },
                    { status: 402 }
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

            return data(handle);
        } catch (err: any) {
            return Response.json({
                error: {
                    message:
                        err?.message ??
                        ERROR_MESSAGES.IMAGE_GENERATION_TASK_ERROR,
                    code: err?.code ?? ERROR_CODES.TRIGGER_ERROR
                }
            });
        }
    }
}
