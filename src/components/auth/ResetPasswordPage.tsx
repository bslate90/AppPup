import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';

type ResetStatus = 'form' | 'loading' | 'success' | 'error';

export function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState<ResetStatus>('form');
    const [error, setError] = useState<string | null>(null);

    // Password strength indicators
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    const isPasswordStrong = strengthScore >= 3 && hasMinLength;

    const getStrengthLabel = () => {
        if (password.length === 0) return { label: '', color: '' };
        if (strengthScore <= 2) return { label: 'Weak', color: 'text-red-500' };
        if (strengthScore === 3) return { label: 'Fair', color: 'text-amber-500' };
        if (strengthScore === 4) return { label: 'Good', color: 'text-emerald-500' };
        return { label: 'Strong', color: 'text-emerald-600' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!hasMinLength) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setStatus('loading');

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            setStatus('success');

            // Redirect to main app after showing success
            setTimeout(() => {
                // Clear any hash/query params and go to home
                window.location.href = '/';
            }, 2500);
        } catch (err) {
            console.error('Password reset error:', err);
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
        }
    };

    const handleBackToLogin = () => {
        // Sign out and redirect to force a fresh login
        supabase.auth.signOut().then(() => {
            window.location.href = '/';
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Animated background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Main Card */}
            <div className="relative w-full max-w-md">
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
                    {/* Header gradient bar */}
                    <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

                    <div className="p-8">
                        {/* Logo & Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/25 mb-4">
                                <span className="text-4xl">🐕</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                AppPup
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Create your new password
                            </p>
                        </div>

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6 animate-bounce">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                    Password Updated! 🎉
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                                    Your password has been successfully reset. Redirecting you to the app...
                                </p>
                                <div className="flex items-center justify-center gap-2 text-amber-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-medium">Redirecting...</span>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && !error && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                                    <AlertCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                    Something Went Wrong
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    We couldn't reset your password. The link may have expired.
                                </p>
                                <button
                                    onClick={handleBackToLogin}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/25 transition-all"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}

                        {/* Form State */}
                        {(status === 'form' || status === 'loading' || (status === 'error' && error)) && (
                            <>
                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter new password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={8}
                                                disabled={status === 'loading'}
                                                className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 disabled:opacity-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        {/* Password Strength Indicator */}
                                        {password.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Password strength:</span>
                                                    <span className={`text-xs font-semibold ${getStrengthLabel().color}`}>
                                                        {getStrengthLabel().label}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strengthScore
                                                                    ? strengthScore <= 2
                                                                        ? 'bg-red-400'
                                                                        : strengthScore === 3
                                                                            ? 'bg-amber-400'
                                                                            : 'bg-emerald-400'
                                                                    : 'bg-slate-200 dark:bg-slate-600'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-2 gap-1 text-xs">
                                                    <div className={hasMinLength ? 'text-emerald-600' : 'text-slate-400'}>
                                                        {hasMinLength ? '✓' : '○'} 8+ characters
                                                    </div>
                                                    <div className={hasUppercase ? 'text-emerald-600' : 'text-slate-400'}>
                                                        {hasUppercase ? '✓' : '○'} Uppercase
                                                    </div>
                                                    <div className={hasNumber ? 'text-emerald-600' : 'text-slate-400'}>
                                                        {hasNumber ? '✓' : '○'} Number
                                                    </div>
                                                    <div className={hasSpecial ? 'text-emerald-600' : 'text-slate-400'}>
                                                        {hasSpecial ? '✓' : '○'} Special char
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <ShieldCheck className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                disabled={status === 'loading'}
                                                className={`w-full pl-12 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-2 ${confirmPassword.length > 0
                                                        ? passwordsMatch
                                                            ? 'border-emerald-500'
                                                            : 'border-red-400'
                                                        : 'border-transparent focus:border-amber-500'
                                                    } focus:bg-white dark:focus:bg-slate-700 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 disabled:opacity-50`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {confirmPassword.length > 0 && (
                                            <p className={`mt-1 text-xs ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={status === 'loading' || !isPasswordStrong || !passwordsMatch}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === 'loading' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Reset Password
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Back to Login */}
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleBackToLogin}
                                        className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold"
                                    >
                                        ← Back to sign in
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Premium badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25">
                        <span>✨</span>
                        <span>Premium Puppy Care</span>
                    </div>
                </div>
            </div>

            {/* App Version */}
            <div className="absolute bottom-4 text-center text-xs text-slate-400 dark:text-slate-600">
                AppPup v2.0 • Your Puppy's Health Command Center
            </div>
        </div>
    );
}

export default ResetPasswordPage;
