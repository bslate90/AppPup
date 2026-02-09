import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { AuthCallback } from './AuthCallback';
import { WalkingDogLoader } from '../common/WalkingDogLoader';
import type { ReactNode } from 'react';

interface AuthGuardProps {
    children: ReactNode;
}

/**
 * Check if the current URL contains auth callback parameters
 * This handles email confirmation, password reset, and other Supabase auth redirects
 */
function isAuthCallback(): boolean {
    const hash = window.location.hash;
    const search = window.location.search;

    // Must have actual token content, not just an empty hash
    if (hash.length > 1) {
        // Check for access_token in hash (email confirmation, recovery)
        if (hash.includes('access_token=')) {
            return true;
        }

        // Check for error in hash
        if (hash.includes('error=')) {
            return true;
        }

        // Check for Supabase auth types in hash (recovery, signup, email verification, magiclink, invite)
        if (hash.includes('type=recovery') || hash.includes('type=signup') || hash.includes('type=email') || hash.includes('type=magiclink') || hash.includes('type=invite')) {
            return true;
        }
    }

    // Check query params
    if (search.length > 1) {
        // Check for Supabase auth types in query params
        if (search.includes('type=recovery') || search.includes('type=signup') || search.includes('type=email') || search.includes('type=magiclink') || search.includes('type=invite')) {
            return true;
        }

        // Check for token in query params
        if (search.includes('token=')) {
            return true;
        }
    }

    return false;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();

    // Check if this is an auth callback (email verification, password reset, etc.)
    if (isAuthCallback()) {
        return <AuthCallback />;
    }

    // Show walking dog loading screen while checking auth
    if (loading) {
        return <WalkingDogLoader message="Fetching your pup data" />;
    }

    // Show login page if not authenticated
    if (!user) {
        return <LoginPage />;
    }

    // Render children if authenticated
    return <>{children}</>;
}

export default AuthGuard;


