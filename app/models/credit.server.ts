import { prisma } from '../db.server';

async function ensureUser(userId: string): Promise<void> {
    const existing = await prisma.user.findUnique({ where: { id: userId } });

    if (!existing) {
        await prisma.user.create({
            data: {
                id: userId,
                name: `User ${userId}`,
                email: `${userId}@example.com`,
                credits: 10 // Start new users with 10 credits
            }
        });
    }
}

export function getCredits(userId: string): Promise<number> {
    return ensureUser(userId).then(() =>
        prisma.user
            .findUnique({ where: { id: userId } })
            .then((user) => user?.credits ?? 0)
    );
}

export function setCredits(userId: string, amount: number): Promise<number> {
    const value = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    return ensureUser(userId).then(() =>
        prisma.user
            .update({
                where: { id: userId },
                data: { credits: value }
            })
            .then((updated) => updated.credits)
    );
}

export function addCredits(userId: string, delta: number): Promise<number> {
    const inc = Number.isFinite(delta) ? Math.floor(delta) : 0;
    if (inc <= 0) return getCredits(userId);

    return ensureUser(userId).then(() =>
        prisma.user
            .update({
                where: { id: userId },
                data: { credits: { increment: inc } }
            })
            .then((updated) => updated.credits)
    );
}

export function deductCredits(userId: string, delta: number): Promise<number> {
    const dec = Number.isFinite(delta) ? Math.floor(delta) : 0;
    if (dec <= 0) return getCredits(userId);

    return ensureUser(userId).then(() =>
        prisma.user.findUnique({ where: { id: userId } }).then((current) => {
            const newAmount = Math.max(0, (current?.credits ?? 0) - dec);
            return prisma.user
                .update({
                    where: { id: userId },
                    data: { credits: newAmount }
                })
                .then((updated) => updated.credits);
        })
    );
}

export function resetCredits(userId: string): Promise<number> {
    return setCredits(userId, 0);
}
