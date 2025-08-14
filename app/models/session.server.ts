import { redirect } from 'react-router';
import { auth } from '../lib/auth.server';

export async function requireUser(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session) {
        throw redirect('/sign-in');
    }

    return session.user;
}

export async function getUser(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    return session?.user || null;
}

export async function getUserId(request: Request) {
    const user = await getUser(request);
    return user?.id || null;
}

export async function requireAnonymous(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (session) {
        throw redirect('/');
    }
}
