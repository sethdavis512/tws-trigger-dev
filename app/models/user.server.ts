import { prisma } from '../db.server';
import type { User } from '@prisma/client';

function clampCredits(n: number | undefined): number {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n as number));
}

async function ensureUser(
    userId: string,
    defaults?: Partial<Pick<User, 'name' | 'email' | 'credits'>>
): Promise<User> {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (existing) return existing;

    return await prisma.user.create({
        data: {
            id: userId,
            name: defaults?.name ?? `User ${userId}`,
            email: defaults?.email ?? `${userId}@example.com`,
            credits: clampCredits(defaults?.credits ?? 0)
        }
    });
}

export function getOrCreateUser(
    userId: string,
    defaults?: Partial<Pick<User, 'name' | 'email' | 'credits'>>
): Promise<User> {
    return ensureUser(userId, defaults);
}

export function getUser(userId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id: userId } });
}

export function listUsers(): Promise<User[]> {
    return prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export function createUser(input: {
    id?: string;
    name?: string;
    email?: string;
    credits?: number;
}): Promise<User> {
    return prisma.user.create({
        data: {
            id: input.id,
            name: input.name ?? (input.id ? `User ${input.id}` : undefined),
            email:
                input.email ??
                (input.id
                    ? `${input.id}@example.com`
                    : 'anonymous@example.com'),
            credits: clampCredits(input.credits ?? 0)
        }
    });
}

export function updateUser(
    userId: string,
    patch: Partial<Pick<User, 'name' | 'email' | 'credits'>>
): Promise<User | null> {
    return prisma.user
        .update({
            where: { id: userId },
            data: {
                ...(patch.name !== undefined && { name: patch.name }),
                ...(patch.email !== undefined && { email: patch.email }),
                ...(patch.credits !== undefined && {
                    credits: clampCredits(patch.credits)
                })
            }
        })
        .catch(() => null);
}

export function deleteUser(userId: string): Promise<boolean> {
    return prisma.user
        .delete({ where: { id: userId } })
        .then(() => true)
        .catch(() => false);
}
