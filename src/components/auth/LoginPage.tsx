import { useState } from 'react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    ArrowRight,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'forgot';

export function LoginPage() {
    const { signIn, signUp, resetPassword } = useAuth();

    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else if (mode === 'signup') {
                if (!displayName.trim()) {
                    throw new Error('Please enter your name');
                }
                const { error } = await signUp(email, password, displayName);
                if (error) throw error;
                setSuccess('Account created! Check your email to verify your account.');
                setMode('login');
            } else if (mode === 'forgot') {
                const { error } = await resetPassword(email);
                if (error) throw error;
                setSuccess('Password reset email sent! Check your inbox.');
                setMode('login');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Animated background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-200/10 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Floating paw prints decoration */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute text-4xl opacity-10 animate-bounce"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: `${2 + i * 0.5}s`,
                        }}
                    >
                        🐾
                    </span>
                ))}
            </div>

            {/* Main Card */}
            <div className="relative w-full max-w-md">
                {/* Glass card */}
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
                                {mode === 'login' && 'Welcome back! Sign in to continue'}
                                {mode === 'signup' && 'Create your account to get started'}
                                {mode === 'forgot' && 'Enter your email to reset password'}
                            </p>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 animate-shake">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Display Name (signup only) */}
                            {mode === 'signup' && (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400"
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400"
                                />
                            </div>

                            {/* Password (not for forgot mode) */}
                            {mode !== 'forgot' && (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}

                            {/* Forgot Password Link */}
                            {mode === 'login' && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setMode('forgot')}
                                        className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' && 'Sign In'}
                                        {mode === 'signup' && 'Create Account'}
                                        {mode === 'forgot' && 'Send Reset Link'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>



                        {/* Mode Toggle */}
                        <div className="mt-6 text-center">
                            {mode === 'login' && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            )}
                            {mode === 'signup' && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            )}
                            {mode === 'forgot' && (
                                <button
                                    onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                                    className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold"
                                >
                                    ← Back to sign in
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Premium badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25">
                        <Sparkles className="w-3.5 h-3.5" />
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

export default LoginPage;
