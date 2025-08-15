import { Outlet, redirect } from 'react-router';
import { auth } from '~/lib/auth.server';
import { APIError } from 'better-auth/api';
import type { Route } from './+types/authenticated';

export async function loader({ request }: Route.LoaderArgs) {
    try {
        const response = await auth.api.getSession({
            headers: request.headers
        });

        if (!response || !response.session || !response.user) {
            return redirect('/sign-in');
        }

        return null;
    } catch (error) {
        // If it's an APIError from Better Auth (e.g., database connection issues)
        if (error instanceof APIError) {
            console.error(
                'Better Auth API Error in authenticated layout:',
                error
            );
            return redirect('/sign-in?error=session-unavailable');
        }

        // For any other errors, redirect to sign-in
        console.error('Unexpected error in authenticated layout:', error);
        return redirect('/sign-in?error=unexpected');
    }
}

export default function AuthenticatedRoute() {
    return <Outlet />;
}
