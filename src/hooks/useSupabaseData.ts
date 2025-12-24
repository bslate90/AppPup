import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type {
    PuppyProfile,
    FoodAnalysis,
    HealthScheduleEntry,
    WeightEntry,
    VitalsEntry,
    FeedingEntry
} from '../types';
import { generateFullHealthSchedule, getAlertStatus } from '../utils/vetFormulas';
import { generateVetReportPDF } from '../utils/pdfGenerator';

// Helper to convert snake_case DB rows to camelCase TypeScript objects
function toCamelCase<T>(obj: Record<string, unknown>): T {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = obj[key];
    }
    return result as T;
}

// Helper to convert camelCase to snake_case for DB
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

/**
 * Central data management hook using Supabase
 * Drop-in replacement for usePuppyData
 */
export function useSupabaseData() {
    const [profile, setProfile] = useState<PuppyProfile | null>(null);
    const [foodBrands, setFoodBrands] = useState<FoodAnalysis[]>([]);
    const [healthSchedule, setHealthSchedule] = useState<HealthScheduleEntry[]>([]);
    const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
    const [vitalsLog, setVitalsLog] = useState<VitalsEntry[]>([]);
    const [feedingLog, setFeedingLog] = useState<FeedingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ============ Initial Data Load ============
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                // Load profile (single row for now)
                const { data: profileData } = await supabase
                    .from('puppy_profiles')
                    .select('*')
                    .limit(1)
                    .single();

                if (profileData) {
                    setProfile(toCamelCase<PuppyProfile>(profileData));

                    // Load related data using profile ID
                    const profileId = profileData.id;

                    const [foodRes, healthRes, weightRes, vitalsRes, feedingRes] = await Promise.all([
                        supabase.from('food_settings').select('*').eq('profile_id', profileId).order('created_at'),
                        supabase.from('health_schedule').select('*').eq('profile_id', profileId).order('due_date'),
                        supabase.from('weight_log').select('*').eq('profile_id', profileId).order('date'),
                        supabase.from('vitals_log').select('*').eq('profile_id', profileId).order('date', { ascending: false }),
                        supabase.from('feeding_log').select('*').eq('profile_id', profileId).order('fed_at', { ascending: false })
                    ]);

                    if (foodRes.data) {
                        setFoodBrands(foodRes.data.map(row => toCamelCase<FoodAnalysis>(row)));
                    }
                    if (healthRes.data) {
                        setHealthSchedule(healthRes.data.map(row => toCamelCase<HealthScheduleEntry>(row)));
                    }
                    if (weightRes.data) {
                        setWeightLog(weightRes.data.map(row => toCamelCase<WeightEntry>(row)));
                    }
                    if (vitalsRes.data) {
                        setVitalsLog(vitalsRes.data.map(row => toCamelCase<VitalsEntry>(row)));
                    }
                    if (feedingRes.data) {
                        setFeedingLog(feedingRes.data.map(row => toCamelCase<FeedingEntry>(row)));
                    }
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    // ============ Profile Management ============
    const updateProfile = useCallback(async (newProfile: PuppyProfile) => {
        try {
            // Remove frontend-generated id for insert (Supabase generates UUID)
            const { id: frontendId, ...profileWithoutId } = newProfile;
            const dbData = toSnakeCase(profileWithoutId);

            console.log('Saving profile to Supabase:', dbData);

            if (profile?.id) {
                // Update existing - use the database UUID
                const { error } = await supabase
                    .from('puppy_profiles')
                    .update(dbData)
                    .eq('id', profile.id);
                if (error) {
                    console.error('Supabase update error:', error);
                    throw new Error(error.message || error.details || 'Failed to update profile');
                }
                setProfile({ ...newProfile, id: profile.id });
            } else {
                // Insert new - let Supabase generate UUID
                const { data, error } = await supabase
                    .from('puppy_profiles')
                    .insert(dbData)
                    .select()
                    .single();
                if (error) {
                    console.error('Supabase insert error:', error);
                    throw new Error(error.message || error.details || 'Failed to insert profile');
                }
                if (data) {
                    const savedProfile = toCamelCase<PuppyProfile>(data);
                    setProfile(savedProfile);
                }
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            const message = err instanceof Error ? err.message : 'Failed to save profile';
            setError(message);
        }
    }, [profile?.id]);

    // ============ Food Brands Management ============
    const addFoodBrand = useCallback(async (food: Omit<FoodAnalysis, 'id'>) => {
        if (!profile?.id) {
            console.error('Cannot add food brand: No profile ID');
            return;
        }
        try {
            const dbData = {
                ...toSnakeCase(food),
                profile_id: profile.id,
                // Ensure type is set if missing
                type: food.type || 'food'
            };
            console.log('Inserting food brand with data:', dbData);

            const { data, error } = await supabase
                .from('food_settings')
                .insert(dbData)
                .select()
                .single();

            if (error) {
                console.error('Supabase food insert error:', error);
                throw new Error(error.message || error.details || 'Failed to insert food brand');
            }
            if (data) {
                setFoodBrands(prev => [...prev, toCamelCase<FoodAnalysis>(data)]);
            }
        } catch (err) {
            console.error('Error adding food brand:', err);
            setError(err instanceof Error ? err.message : 'Failed to add food brand');
        }
    }, [profile?.id]);

    const updateFoodBrand = useCallback(async (id: string, updates: Partial<FoodAnalysis>) => {
        try {
            const dbUpdates = toSnakeCase(updates);
            const { error } = await supabase
                .from('food_settings')
                .update(dbUpdates)
                .eq('id', id);
            if (error) throw error;
            setFoodBrands(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
        } catch (err) {
            console.error('Error updating food brand:', err);
            setError(err instanceof Error ? err.message : 'Failed to update food brand');
        }
    }, []);

    const deleteFoodBrand = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('food_settings').delete().eq('id', id);
            if (error) throw error;
            setFoodBrands(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error('Error deleting food brand:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete food brand');
        }
    }, []);

    const setDefaultFoodBrand = useCallback(async (id: string) => {
        if (!profile?.id) return;
        try {
            const brand = foodBrands.find(b => b.id === id);
            if (!brand) return;

            // Unset all others of the same type
            await supabase
                .from('food_settings')
                .update({ is_default: false })
                .eq('profile_id', profile.id)
                .eq('type', brand.type);

            // Set new default
            const { error } = await supabase
                .from('food_settings')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;
            setFoodBrands(prev => prev.map(f =>
                f.type === brand.type ? { ...f, isDefault: f.id === id } : f
            ));
        } catch (err) {
            console.error('Error setting default food brand:', err);
            setError(err instanceof Error ? err.message : 'Failed to set default food brand');
        }
    }, [profile?.id, foodBrands]);

    // ============ Health Schedule ============
    const generateSchedule = useCallback(async (birthDate: Date) => {
        if (!profile?.id) return;

        try {
            const schedule = generateFullHealthSchedule(birthDate);

            // Delete existing schedule
            await supabase.from('health_schedule').delete().eq('profile_id', profile.id);

            // Insert new schedule - exclude frontend ID, let Supabase generate UUIDs
            const dbData = schedule.map(entry => {
                const { id, ...entryWithoutId } = entry;
                return {
                    ...toSnakeCase(entryWithoutId),
                    profile_id: profile.id
                };
            });

            const { error } = await supabase.from('health_schedule').insert(dbData);
            if (error) throw error;

            // Reload from Supabase to get proper UUIDs
            const { data: savedSchedule } = await supabase
                .from('health_schedule')
                .select('*')
                .eq('profile_id', profile.id)
                .order('due_date');

            if (savedSchedule) {
                setHealthSchedule(savedSchedule.map(row => toCamelCase<HealthScheduleEntry>(row)));
            }
        } catch (err) {
            console.error('Error generating schedule:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate schedule');
        }
    }, [profile?.id]);

    const updateHealthEntry = useCallback(async (id: string, updates: Partial<HealthScheduleEntry>) => {
        try {
            const dbUpdates = toSnakeCase(updates);
            const { error } = await supabase
                .from('health_schedule')
                .update(dbUpdates)
                .eq('id', id);
            if (error) throw error;

            setHealthSchedule(prev =>
                prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry)
            );
        } catch (err) {
            console.error('Error updating health entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to update health entry');
        }
    }, []);

    // ============ Weight Log ============
    const addWeightEntry = useCallback(async (entry: Omit<WeightEntry, 'id'>) => {
        if (!profile?.id) return;

        try {
            const dbData = { ...toSnakeCase(entry), profile_id: profile.id };
            const { data, error } = await supabase
                .from('weight_log')
                .insert(dbData)
                .select()
                .single();
            if (error) throw error;

            if (data) {
                const newEntry = toCamelCase<WeightEntry>(data);
                setWeightLog(prev =>
                    [...prev, newEntry].sort((a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                );
            }
        } catch (err) {
            console.error('Error adding weight entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to add weight entry');
        }
    }, [profile?.id]);

    const deleteWeightEntry = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('weight_log').delete().eq('id', id);
            if (error) throw error;
            setWeightLog(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error('Error deleting weight entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete weight entry');
        }
    }, []);

    // ============ Vitals Log ============
    const addVitalsEntry = useCallback(async (entry: Omit<VitalsEntry, 'id'>) => {
        if (!profile?.id) return;

        try {
            const dbData = { ...toSnakeCase(entry), profile_id: profile.id };
            const { data, error } = await supabase
                .from('vitals_log')
                .insert(dbData)
                .select()
                .single();
            if (error) throw error;

            if (data) {
                const newEntry = toCamelCase<VitalsEntry>(data);
                setVitalsLog(prev =>
                    [...prev, newEntry].sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                );
            }
        } catch (err) {
            console.error('Error adding vitals entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to add vitals entry');
        }
    }, [profile?.id]);

    const deleteVitalsEntry = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('vitals_log').delete().eq('id', id);
            if (error) throw error;
            setVitalsLog(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error('Error deleting vitals entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete vitals entry');
        }
    }, []);

    // ============ Feeding Log ============
    const addFeedingEntry = useCallback(async (entry: Omit<FeedingEntry, 'id'>) => {
        if (!profile?.id) return;

        try {
            const dbData = { ...toSnakeCase(entry), profile_id: profile.id };
            const { data, error } = await supabase
                .from('feeding_log')
                .insert(dbData)
                .select()
                .single();
            if (error) throw error;

            if (data) {
                const newEntry = toCamelCase<FeedingEntry>(data);
                setFeedingLog(prev => [newEntry, ...prev]);
            }
        } catch (err) {
            console.error('Error adding feeding entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to log feeding');
        }
    }, [profile?.id]);

    const deleteFeedingEntry = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('feeding_log').delete().eq('id', id);
            if (error) throw error;
            setFeedingLog(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error('Error deleting feeding entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete feeding');
        }
    }, []);

    // ============ Computed Values ============
    const currentWeight = useMemo(() => {
        if (weightLog.length === 0) return null;
        const sorted = [...weightLog].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sorted[0].weightGrams;
    }, [weightLog]);

    const ageInWeeks = useMemo(() => {
        if (!profile?.birthDate) return null;
        const birth = new Date(profile.birthDate);
        const now = new Date();
        const diffMs = now.getTime() - birth.getTime();
        return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    }, [profile?.birthDate]);

    const upcomingAlerts = useMemo(() => {
        return healthSchedule
            .map((entry) => ({
                ...entry,
                status: getAlertStatus(entry.dueDate, entry.administered),
            }))
            .filter((e) => e.status === 'due_soon' || e.status === 'due_now' || e.status === 'overdue')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [healthSchedule]);

    // Today's feedings for quick tracking
    const todayFeedings = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return feedingLog.filter(entry => entry.fedAt.startsWith(today));
    }, [feedingLog]);

    // ============ Export ============
    const exportVetReport = useCallback(() => {
        generateVetReportPDF(profile, healthSchedule, weightLog, vitalsLog);
    }, [profile, healthSchedule, weightLog, vitalsLog]);

    // ============ Reset ============
    const resetData = useCallback(async () => {
        if (!profile?.id) return;

        try {
            await supabase.from('puppy_profiles').delete().eq('id', profile.id);
            setProfile(null);
            setFoodBrands([]);
            setHealthSchedule([]);
            setWeightLog([]);
            setVitalsLog([]);
        } catch (err) {
            console.error('Error resetting data:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset data');
        }
    }, [profile?.id]);

    return {
        // Loading/Error state
        loading,
        error,

        // Data
        profile,
        foodBrands,
        healthSchedule,
        weightLog,
        vitalsLog,
        feedingLog,

        // Computed
        currentWeight,
        ageInWeeks,
        upcomingAlerts,
        todayFeedings,

        // Actions
        updateProfile,
        addFoodBrand,
        updateFoodBrand,
        deleteFoodBrand,
        setDefaultFoodBrand,
        generateSchedule,
        updateHealthEntry,
        addWeightEntry,
        deleteWeightEntry,
        addVitalsEntry,
        deleteVitalsEntry,
        addFeedingEntry,
        deleteFeedingEntry,
        exportVetReport,
        resetData,
    };
}

export default useSupabaseData;
