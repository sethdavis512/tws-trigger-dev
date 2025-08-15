import { prisma } from '../db.server';
import type { Image, Prompt } from '@prisma/client';

export type { Image };

type ImageWithPrompt = Image & { prompt: Prompt | null };

async function ensureUser(userId: string): Promise<void> {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
        await prisma.user.create({
            data: {
                id: userId,
                name: `User ${userId}`,
                email: `${userId}@example.com`,
                credits: 0
            }
        });
    }
}

export function createImage(
    userId: string,
    input: {
        url: string;
        base64?: string;
        runId?: string;
        size?: string;
        promptId?: string;
    }
): Promise<Image> {
    return ensureUser(userId).then(() =>
        prisma.image.create({
            data: {
                url: input.url,
                base64: input.base64,
                runId: input.runId,
                size: input.size,
                userId,
                promptId: input.promptId
            }
        })
    );
}

export function getImages(userId: string): Promise<ImageWithPrompt[]> {
    return prisma.image.findMany({
        where: { userId },
        include: { prompt: true },
        orderBy: { createdAt: 'desc' }
    });
}

export function getImageById(imageId: string): Promise<ImageWithPrompt | null> {
    return prisma.image.findUnique({
        where: { id: imageId },
        include: { prompt: true }
    });
}

export function getImagesByRunId(runId: string): Promise<ImageWithPrompt[]> {
    return prisma.image.findMany({
        where: { runId },
        include: { prompt: true },
        orderBy: { createdAt: 'desc' }
    });
}

export function updateImage(
    imageId: string,
    patch: Partial<Pick<Image, 'url' | 'base64' | 'promptId'>>
): Promise<Image | null> {
    return prisma.image
        .update({
            where: { id: imageId },
            data: {
                ...(patch.url !== undefined && { url: patch.url }),
                ...(patch.base64 !== undefined && { base64: patch.base64 }),
                ...(patch.promptId !== undefined && {
                    promptId: patch.promptId
                })
            }
        })
        .catch(() => null);
}

export function deleteImage(imageId: string): Promise<boolean> {
    return prisma.image
        .delete({ where: { id: imageId } })
        .then(() => true)
        .catch(() => false);
}
