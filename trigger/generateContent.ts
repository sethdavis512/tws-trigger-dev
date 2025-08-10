import { task, logger } from '@trigger.dev/sdk/v3';
import OpenAI from 'openai';
import type { ImageGenerateParamsBase } from 'openai/resources/images.mjs';
import { createImage } from '~/models/image.server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Payload = {
    theme: string;
    description: string;
    size: ImageGenerateParamsBase['size'];
    userId?: string;
};

export const generateContent = task({
    id: 'generate-content',
    // More tolerant retry/backoff than project default for this task
    retry: {
        maxAttempts: 5,
        minTimeoutInMs: 2_000,
        maxTimeoutInMs: 45_000,
        factor: 2,
        randomize: true
    },
    run: async (
        { theme, description, size, userId = 'default-user' }: Payload,
        { ctx }
    ) => {
        // Generate accompanying text
        const textResult = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a concise creative assistant. Write a short, vivid caption (2-3 sentences).'
                },
                {
                    role: 'user',
                    content: generateTextPrompt(theme, description, size)
                }
            ],
            temperature: 0.8
        });

        const choice = textResult.choices?.[0];

        if (!choice || !choice.message?.content) {
            throw new Error('No content, retrying…');
        }

        const caption = choice.message.content;

        // Generate image using DALL·E 3
        const imageResult = await openai.images.generate({
            model: 'dall-e-3',
            prompt: generateImagePrompt(theme, description, size),
            size,
            quality: 'standard',
            n: 1
        });

        const imageData = imageResult.data?.[0];

        if (!imageData) {
            throw new Error('No image, retrying…');
        }

        // Prefer URL if available; otherwise allow base64 fallback
        const imageUrl = imageData.url;
        const imageBase64 = (imageData as any).b64_json as string | undefined;

        logger.log('Generated content', {
            theme,
            description,
            hasUrl: !!imageUrl,
            hasBase64: !!imageBase64
        });

        // Save the generated image to database
        try {
            if (imageUrl || imageBase64) {
                await createImage(userId, {
                    url: imageUrl ?? '',
                    base64: imageBase64,
                    runId: ctx.run.id,
                    size: size ?? undefined
                });
                logger.log('Image saved to database', { runId: ctx.run.id });
            }
        } catch (error) {
            logger.warn('Failed to save image to database', {
                error: String(error),
                runId: ctx.run.id
            });
            // Don't fail the run for database save errors
        }

        return {
            text: caption,
            image: imageUrl ?? null,
            imageBase64: imageBase64 ?? null
        };
    }
});

function generateTextPrompt(
    theme: string,
    description: string,
    size: ImageGenerateParamsBase['size']
) {
    return `Theme: ${theme}\n\nDescription: ${description}\n\nSize: ${size}`;
}

function generateImagePrompt(
    theme: string,
    description: string,
    size: ImageGenerateParamsBase['size']
) {
    return `Create a photorealistic, production-quality image based on the theme and description below.

Hard constraints (must follow):
- Never render text, letters, numbers, logos, watermarks, UI, borders, or frames.
- Maintain coherent perspective and scale; no distortions, extra limbs, or artifacts.
- Avoid extreme cropping; keep the main subject fully visible.

Quality & look:
- Physically plausible materials, accurate reflections, and natural shadows (soft global illumination).
- Balanced composition with clear subject, useful negative space, and depth (foreground/midground/background).
- Camera feel: 35–50mm lens, subtle depth of field where appropriate; minimal wide-angle distortion.
- Color: cohesive palette informed by the theme; avoid harsh clipping or oversaturation unless implied.

Room type: ${theme}

Style: ${description}

Output:
- Size: ${size}
- Style: photorealistic, ultra-detailed, high dynamic range`;
}
