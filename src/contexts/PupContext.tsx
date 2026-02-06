import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { PuppyProfile } from '../types';

// Extended profile with owner info
export interface PupProfile extends PuppyProfile {
    ownerId: string;
    householdId?: string;
    isShared?: boolean;
}

interface PupContextType {
    pups: PupProfile[];
    activePup: PupProfile | null;
    loading: boolean;
    error: string | null;
    setActivePup: (pup: PupProfile) => void;
    addPup: (pup: Omit<PupProfile, 'id' | 'ownerId'>) => Promise<{ error: Error | null; pup?: PupProfile }>;
    updatePup: (id: string, updates: Partial<PupProfile>) => Promise<{ error: Error | null }>;
    deletePup: (id: string) => Promise<{ error: Error | null }>;
    refreshPups: () => Promise<void>;
}

const PupContext = createContext<PupContextType | undefined>(undefined);

// Helper to convert snake_case to camelCase
function toCamelCase<T>(obj: Record<string, unknown>): T {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = obj[key];
    }
    return result as T;
}

// Helper to convert camelCase to snake_case
function toSnakeCase<T extends object>(obj: T): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            result[snakeKey] = obj[key as keyof T];
        }
    }
    return result;
}

export function PupProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [pups, setPups] = useState<PupProfile[]>([]);
    const [activePup, setActivePupState] = useState<PupProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load pups when user changes
    const loadPups = useCallback(async () => {
        if (!user) {
            setPups([]);
            setActivePupState(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Load user's own pups
            const { data: ownPups, error: ownError } = await supabase
                .from('puppy_profiles')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at');

            if (ownError) {
                console.error('Error loading own pups:', ownError);
                throw ownError;
            }

            // Load shared pups via household (fail gracefully)
            let householdPups: typeof ownPups = [];
            try {
                const { data } = await supabase
                    .from('puppy_profiles')
                    .select('*')
                    .not('owner_id', 'eq', user.id)
                    .not('household_id', 'is', null);

                // TODO: Filter by actual household membership once implemented
                householdPups = data || [];
            } catch (householdErr) {
                console.warn('Could not load household pups:', householdErr);
                // Continue without shared pups
            }

            // Combine own and shared pups
            const allPups: PupProfile[] = [
                ...(ownPups || []).map(p => ({
                    ...toCamelCase<PupProfile>(p),
                    isShared: false
                })),
                ...(householdPups || []).map(p => ({
                    ...toCamelCase<PupProfile>(p),
                    isShared: true
                })),
            ];

            setPups(allPups);

            // Set active pup from localStorage or first pup
            const storedActivePupId = localStorage.getItem('apppup-active-pup');
            const activePup = allPups.find(p => p.id === storedActivePupId) || allPups[0] || null;
            setActivePupState(activePup);

        } catch (err) {
            console.error('Error loading pups:', err);
            setError(err instanceof Error ? err.message : 'Failed to load pups');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadPups();
    }, [loadPups]);

    // Set active pup (with localStorage persistence)
    const setActivePup = useCallback((pup: PupProfile) => {
        setActivePupState(pup);
        localStorage.setItem('apppup-active-pup', pup.id);
    }, []);

    // Add a new pup
    const addPup = useCallback(async (pupData: Omit<PupProfile, 'id' | 'ownerId'>) => {
        if (!user) {
            return { error: new Error('Not authenticated') };
        }

        try {
            const dbData = {
                ...toSnakeCase(pupData),
                owner_id: user.id,
            };

            const { data, error } = await supabase
                .from('puppy_profiles')
                .insert(dbData)
                .select()
                .single();

            if (error) throw error;

            const newPup: PupProfile = {
                ...toCamelCase<PupProfile>(data),
                isShared: false,
            };

            setPups(prev => [...prev, newPup]);

            // Auto-select the new pup
            setActivePup(newPup);

            return { error: null, pup: newPup };
        } catch (err) {
            console.error('Error adding pup:', err);
            return { error: err as Error };
        }
    }, [user, setActivePup]);

    // Update a pup
    const updatePup = useCallback(async (id: string, updates: Partial<PupProfile>) => {
        try {
            const { isShared, ...cleanUpdates } = updates;
            const dbUpdates = toSnakeCase(cleanUpdates);

            const { error } = await supabase
                .from('puppy_profiles')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setPups(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

            // Update active pup if it's the one being updated
            if (activePup?.id === id) {
                setActivePupState(prev => prev ? { ...prev, ...updates } : null);
            }

            return { error: null };
        } catch (err) {
            console.error('Error updating pup:', err);
            return { error: err as Error };
        }
    }, [activePup?.id]);

    // Delete a pup
    const deletePup = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('puppy_profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            const updatedPups = pups.filter(p => p.id !== id);
            setPups(updatedPups);

            // If we deleted the active pup, switch to another one
            if (activePup?.id === id) {
                setActivePupState(updatedPups[0] || null);
                if (updatedPups[0]) {
                    localStorage.setItem('apppup-active-pup', updatedPups[0].id);
                } else {
                    localStorage.removeItem('apppup-active-pup');
                }
            }

            return { error: null };
        } catch (err) {
            console.error('Error deleting pup:', err);
            return { error: err as Error };
        }
    }, [pups, activePup?.id]);

    const value: PupContextType = {
        pups,
        activePup,
        loading,
        error,
        setActivePup,
        addPup,
        updatePup,
        deletePup,
        refreshPups: loadPups,
    };

    return (
        <PupContext.Provider value={value}>
            {children}
        </PupContext.Provider>
    );
}

export function usePups() {
    const context = useContext(PupContext);
    if (context === undefined) {
        throw new Error('usePups must be used within a PupProvider');
    }
    return context;
}

export default PupContext;
