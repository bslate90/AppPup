import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ResetPasswordPage } from './ResetPasswordPage';
import { WalkingDogLoader } from '../common/WalkingDogLoader';

type CallbackStatus = 'loading' | 'success' | 'error' | 'recovery';

export function AuthCallback() {
    const [status, setStatus] = useState<CallbackStatus>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the URL hash and query parameters
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const queryParams = new URLSearchParams(window.location.search);

                // Check for error in URL
                const error = hashParams.get('error') || queryParams.get('error');
                const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

                if (error) {
                    setStatus('error');
                    setMessage(errorDescription || 'Verification failed. Please try again.');
                    return;
                }

                // Check for access token (means email was verified or recovery link clicked)
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type') || queryParams.get('type');

                if (accessToken && refreshToken) {
                    // Set the session with the tokens from URL
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        setStatus('error');
                        setMessage(sessionError.message);
                        return;
                    }

                    // Check if this is a password recovery flow
                    if (type === 'recovery') {
                        // Clear the URL hash to prevent re-processing
                        window.history.replaceState(null, '', window.location.pathname);
                        setStatus('recovery');
                        return;
                    }

                    // Regular email verification
                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting...');

                    // Redirect to main app after a short delay
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                    return;
                }

                // If we reach here, try to get session from URL
                const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

                if (getSessionError) {
                    setStatus('error');
                    setMessage(getSessionError.message);
                    return;
                }

                if (session) {
                    // Check if this was a recovery that already has session
                    if (type === 'recovery') {
                        window.history.replaceState(null, '', window.location.pathname);
                        setStatus('recovery');
                        return;
                    }

                    setStatus('success');
                    setMessage('Logged in successfully! Redirecting...');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    // No session, might just be visiting the page
                    setStatus('error');
                    setMessage('No verification token found. Please check your email for the confirmation link.');
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setStatus('error');
                setMessage('An unexpected error occurred. Please try again.');
            }
        };

        handleAuthCallback();
    }, []);

    // Show walking dog loader while processing
    if (status === 'loading') {
        return <WalkingDogLoader message="Verifying your account" />;
    }

    // Show password reset page for recovery flow
    if (status === 'recovery') {
        return <ResetPasswordPage />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
                    {/* Header gradient bar */}
                    <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

                    <div className="p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/25 mb-4">
                                <span className="text-4xl">🐕</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                AppPup
                            </h1>
                        </div>

                        {/* Status Display */}
                        <div className="text-center">
                            {status === 'success' && (
                                <div className="space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-bounce">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">{message}</p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
                                        <AlertCircle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <p className="text-red-600 dark:text-red-400 font-medium">{message}</p>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/25 transition-all"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthCallback;

