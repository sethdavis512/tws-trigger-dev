import { task, logger } from '@trigger.dev/sdk/v3';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import type { ImageGenerateParamsBase } from 'openai/resources/images.mjs';
import { createImage } from '~/models/image.server';
import { createPrompt } from '~/models/prompt.server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

        // Upload to Cloudinary if we have image data
        let cloudinaryUrl: string | null = null;
        let cloudinaryPublicId: string | null = null;

        if (imageUrl || imageBase64) {
            try {
                const uploadSource =
                    imageUrl || `data:image/png;base64,${imageBase64}`;

                const cloudinaryResult = await cloudinary.uploader.upload(
                    uploadSource,
                    {
                        resource_type: 'image',
                        folder: 'rapidalle/generated',
                        use_filename: false,
                        unique_filename: true,
                        transformation: [
                            { quality: 'auto', fetch_format: 'auto' }
                        ]
                    }
                );

                cloudinaryUrl = cloudinaryResult.secure_url;
                cloudinaryPublicId = cloudinaryResult.public_id;

                logger.log('Image uploaded to Cloudinary', {
                    url: cloudinaryUrl,
                    publicId: cloudinaryPublicId,
                    runId: ctx.run.id
                });
            } catch (error) {
                logger.warn(
                    'Cloudinary upload failed, falling back to original URL',
                    {
                        error: String(error),
                        runId: ctx.run.id
                    }
                );
                // Continue with original URL/base64 if Cloudinary fails
            }
        }

        // Save the prompt and generated image to database
        try {
            if (cloudinaryUrl || imageUrl || imageBase64) {
                // 1) Persist the prompt so we can link it to the image
                const prompt = await createPrompt(userId, {
                    theme,
                    description
                });

                // 2) Create the image linked to the prompt
                // Prefer Cloudinary URL, fallback to original URL, then base64
                const finalImageUrl = cloudinaryUrl || imageUrl || '';

                await createImage(userId, {
                    url: finalImageUrl,
                    base64: cloudinaryUrl ? undefined : imageBase64, // Only store base64 if not uploaded to Cloudinary
                    runId: ctx.run.id,
                    size: size ?? undefined,
                    promptId: prompt.id
                });

                logger.log('Image saved to database', {
                    runId: ctx.run.id,
                    useCloudinary: !!cloudinaryUrl,
                    url: finalImageUrl
                });
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
            image: cloudinaryUrl || imageUrl || null,
            imageBase64: cloudinaryUrl ? null : (imageBase64 ?? null), // Don't return base64 if we have Cloudinary URL
            cloudinaryPublicId
        };
    }
});

function generateTextPrompt(
    theme: string,
    description: string,
    size: ImageGenerateParamsBase['size']
) {
    return `Design Category: ${theme}\n\nArtistic Style: ${description}\n\nCanvas Size: ${size}`;
}

function generateImagePrompt(
    theme: string,
    description: string,
    size: ImageGenerateParamsBase['size']
) {
    return `Create a high-quality artistic typography or design piece based on the theme and style description below.

Hard constraints (must follow):
- Focus on typography, lettering, text composition, or graphic design elements as the primary subject.
- Maintain clear readability if text is present; avoid distorted or illegible letterforms.
- Use proper typographic hierarchy, spacing, and composition principles.
- Avoid photorealistic room interiors, furniture, or architectural elements.

Quality & artistic approach:
- Professional design quality with attention to typographic details and visual harmony.
- Balanced composition with strong focal points and effective use of negative space.
- Cohesive color palette that supports the artistic style and mood.
- Appropriate texture, lighting, and visual effects that enhance the design concept.
- Contemporary design sensibilities with artistic flair and creative expression.

Design category: ${theme}

Artistic style: ${description}

Output:
- Size: ${size}
- Style: artistic, design-focused, typography-centered, professionally crafted`;
}
