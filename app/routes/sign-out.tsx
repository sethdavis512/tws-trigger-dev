import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authClient } from '~/lib/auth.client';

export default function SignOut() {
    const navigate = useNavigate();
    useEffect(() => {
        authClient.signOut().finally(() => navigate('/'));
    }, [navigate]);
    return null;
}
