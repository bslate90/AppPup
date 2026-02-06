import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    role: 'owner' | 'family' | 'trainer' | 'viewer';
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user session on mount
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await loadUserProfile(session.user.id);
                } else {
                    setUserProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Load or create user profile
    async function loadUserProfile(userId: string) {
        try {
            // Try to load existing profile
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // Not "not found" error
                console.error('Error loading profile:', error);
            }

            if (data) {
                setUserProfile({
                    id: data.id,
                    displayName: data.display_name,
                    email: user?.email || '',
                    avatarUrl: data.avatar_url,
                    role: data.role,
                    createdAt: data.created_at,
                });
            } else {
                // Create profile for new user
                const { data: session } = await supabase.auth.getSession();
                const userEmail = session?.session?.user?.email || '';
                const displayName = session?.session?.user?.user_metadata?.display_name
                    || session?.session?.user?.user_metadata?.full_name
                    || userEmail.split('@')[0];

                const { data: newProfile, error: createError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: userId,
                        display_name: displayName,
                        role: 'owner',
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating profile:', createError);
                } else if (newProfile) {
                    setUserProfile({
                        id: newProfile.id,
                        displayName: newProfile.display_name,
                        email: userEmail,
                        avatarUrl: newProfile.avatar_url,
                        role: newProfile.role,
                        createdAt: newProfile.created_at,
                    });
                }
            }
        } catch (err) {
            console.error('Error in loadUserProfile:', err);
        } finally {
            setLoading(false);
        }
    }

    // Sign in with email/password
    async function signIn(email: string, password: string) {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err as Error };
        }
    }

    // Sign up with email/password
    async function signUp(email: string, password: string, displayName: string) {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    },
                },
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err as Error };
        }
    }

    // Sign out
    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setUserProfile(null);
    }

    // Reset password
    async function resetPassword(email: string) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err as Error };
        }
    }

    // Update user profile
    async function updateProfile(updates: Partial<UserProfile>) {
        if (!user) return { error: new Error('Not authenticated') };

        try {
            const dbUpdates: Record<string, unknown> = {};
            if (updates.displayName) dbUpdates.display_name = updates.displayName;
            if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
            if (updates.role) dbUpdates.role = updates.role;

            const { error } = await supabase
                .from('user_profiles')
                .update(dbUpdates)
                .eq('id', user.id);

            if (error) {
                return { error: new Error(error.message) };
            }

            setUserProfile(prev => prev ? { ...prev, ...updates } : null);
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    }

    const value: AuthContextType = {
        user,
        session,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
