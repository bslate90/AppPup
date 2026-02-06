import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { AuthCallback } from './AuthCallback';
import { Loader2 } from 'lucide-react';
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

    // Check for access_token in hash (email confirmation)
    if (hash.includes('access_token') || hash.includes('error')) {
        return true;
    }

    // Check for type=recovery or type=signup in URL
    if (search.includes('type=recovery') || search.includes('type=signup')) {
        return true;
    }

    // Check for token in query params
    if (search.includes('token=')) {
        return true;
    }

    return false;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();

    // Check if this is an auth callback (email verification, password reset, etc.)
    if (isAuthCallback()) {
        return <AuthCallback />;
    }

    // Show loading screen while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/25 mb-6 animate-pulse">
                        <span className="text-4xl">🐕</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Show login page if not authenticated
    if (!user) {
        return <LoginPage />;
    }

    // Render children if authenticated
    return <>{children}</>;
}

export default AuthGuard;

