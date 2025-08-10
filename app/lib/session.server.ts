import { redirect } from 'react-router';
import { auth } from './auth.server';

export async function requireUser(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        throw redirect('/auth/sign-in');
    }

    return session.user;
}

export async function getUser(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    return session?.user || null;
}

export async function requireAnonymous(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (session) {
        throw redirect('/');
    }
}
