import { redirect } from 'react-router';
import { auth } from '../lib/auth.server';
import { APIError } from 'better-auth/api';

export async function requireUser(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            throw redirect('/sign-in');
        }

        return session.user;
    } catch (error) {
        // If it's an APIError from Better Auth (e.g., database connection issues)
        if (error instanceof APIError) {
            console.error('Better Auth API Error in requireUser:', error);
            throw redirect('/sign-in?error=session-unavailable');
        }

        // If it's already a redirect, re-throw it
        if (error instanceof Response) {
            throw error;
        }

        // For any other errors, redirect to sign-in with error parameter
        console.error('Unexpected error in requireUser:', error);
        throw redirect('/sign-in?error=unexpected');
    }
}

export async function getUser(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        return session?.user || null;
    } catch (error) {
        // If it's an APIError from Better Auth (e.g., database connection issues)
        if (error instanceof APIError) {
            console.error('Better Auth API Error in getUser:', error);
            return null;
        }

        // For any other errors, return null (graceful degradation)
        console.error('Unexpected error in getUser:', error);
        return null;
    }
}

export async function getUserId(request: Request) {
    const user = await getUser(request);
    return user?.id || null;
}

export async function requireAnonymous(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (session) {
            throw redirect('/');
        }
    } catch (error) {
        // If it's an APIError from Better Auth, allow the anonymous access
        if (error instanceof APIError) {
            console.error('Better Auth API Error in requireAnonymous:', error);
            return; // Allow anonymous access when session service is unavailable
        }

        // If it's already a redirect, re-throw it
        if (error instanceof Response) {
            throw error;
        }

        // For any other errors, allow anonymous access
        console.error('Unexpected error in requireAnonymous:', error);
        return;
    }
}
