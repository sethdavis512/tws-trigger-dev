import { prisma } from '../db.server';
import type { Prompt } from '@prisma/client';

export type { Prompt };

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

export function getPrompts(userId: string): Promise<Prompt[]> {
    return ensureUser(userId).then(() =>
        prisma.prompt.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
    );
}

export function getPromptById(
    userId: string,
    promptId: string
): Promise<Prompt | null> {
    return prisma.prompt.findFirst({
        where: {
            id: promptId,
            userId
        }
    });
}

export function createPrompt(
    userId: string,
    input: { theme: string; description: string }
): Promise<Prompt> {
    return ensureUser(userId).then(() =>
        prisma.prompt.create({
            data: {
                theme: input.theme,
                description: input.description,
                userId
            }
        })
    );
}

export function updatePrompt(
    userId: string,
    promptId: string,
    patch: Partial<Pick<Prompt, 'theme' | 'description'>>
): Promise<Prompt | null> {
    return prisma.prompt
        .update({
            where: {
                id: promptId,
                userId
            },
            data: {
                ...(patch.theme !== undefined && { theme: patch.theme }),
                ...(patch.description !== undefined && {
                    description: patch.description
                })
            }
        })
        .catch(() => null);
}

export function deletePrompt(
    userId: string,
    promptId: string
): Promise<boolean> {
    return prisma.prompt
        .delete({
            where: {
                id: promptId,
                userId
            }
        })
        .then(() => true)
        .catch(() => false);
}
