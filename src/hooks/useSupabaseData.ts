import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type {
    PuppyProfile,
    FoodAnalysis,
    HealthScheduleEntry,
    WeightEntry,
    VitalsEntry
} from '../types';
import { generateFullHealthSchedule, getAlertStatus } from '../utils/vetFormulas';

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
    const [foodSettings, setFoodSettings] = useState<FoodAnalysis | null>(null);
    const [healthSchedule, setHealthSchedule] = useState<HealthScheduleEntry[]>([]);
    const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
    const [vitalsLog, setVitalsLog] = useState<VitalsEntry[]>([]);
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

                    const [foodRes, healthRes, weightRes, vitalsRes] = await Promise.all([
                        supabase.from('food_settings').select('*').eq('profile_id', profileId).single(),
                        supabase.from('health_schedule').select('*').eq('profile_id', profileId).order('due_date'),
                        supabase.from('weight_log').select('*').eq('profile_id', profileId).order('date'),
                        supabase.from('vitals_log').select('*').eq('profile_id', profileId).order('date', { ascending: false })
                    ]);

                    if (foodRes.data) {
                        const { profile_id, created_at, id, ...foodData } = foodRes.data;
                        setFoodSettings(toCamelCase<FoodAnalysis>(foodData));
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
            const dbData = toSnakeCase(newProfile);

            if (profile?.id) {
                // Update existing
                const { error } = await supabase
                    .from('puppy_profiles')
                    .update(dbData)
                    .eq('id', profile.id);
                if (error) throw error;
            } else {
                // Insert new
                const { data, error } = await supabase
                    .from('puppy_profiles')
                    .insert(dbData)
                    .select()
                    .single();
                if (error) throw error;
                if (data) {
                    newProfile = toCamelCase<PuppyProfile>(data);
                }
            }
            setProfile(newProfile);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to save profile');
        }
    }, [profile?.id]);

    // ============ Food Settings ============
    const updateFoodSettings = useCallback(async (food: FoodAnalysis) => {
        if (!profile?.id) return;

        try {
            const dbData = { ...toSnakeCase(food), profile_id: profile.id };

            // Check if exists
            const { data: existing } = await supabase
                .from('food_settings')
                .select('id')
                .eq('profile_id', profile.id)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('food_settings')
                    .update(dbData)
                    .eq('profile_id', profile.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('food_settings')
                    .insert(dbData);
                if (error) throw error;
            }
            setFoodSettings(food);
        } catch (err) {
            console.error('Error saving food settings:', err);
            setError(err instanceof Error ? err.message : 'Failed to save food settings');
        }
    }, [profile?.id]);

    // ============ Health Schedule ============
    const generateSchedule = useCallback(async (birthDate: Date) => {
        if (!profile?.id) return;

        try {
            const schedule = generateFullHealthSchedule(birthDate);

            // Delete existing schedule
            await supabase.from('health_schedule').delete().eq('profile_id', profile.id);

            // Insert new schedule
            const dbData = schedule.map(entry => ({
                ...toSnakeCase(entry),
                profile_id: profile.id
            }));

            const { error } = await supabase.from('health_schedule').insert(dbData);
            if (error) throw error;

            setHealthSchedule(schedule);
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

    // ============ Export ============
    const exportVetReport = useCallback(() => {
        const report = {
            exportDate: new Date().toISOString(),
            profile,
            foodSettings,
            healthSchedule,
            weightLog,
            vitalsLog,
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${profile?.name || 'puppy'}_vet_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [profile, foodSettings, healthSchedule, weightLog, vitalsLog]);

    // ============ Reset ============
    const resetData = useCallback(async () => {
        if (!profile?.id) return;

        try {
            await supabase.from('puppy_profiles').delete().eq('id', profile.id);
            setProfile(null);
            setFoodSettings(null);
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
        foodSettings,
        healthSchedule,
        weightLog,
        vitalsLog,

        // Computed
        currentWeight,
        ageInWeeks,
        upcomingAlerts,

        // Actions
        updateProfile,
        updateFoodSettings,
        generateSchedule,
        updateHealthEntry,
        addWeightEntry,
        deleteWeightEntry,
        addVitalsEntry,
        deleteVitalsEntry,
        exportVetReport,
        resetData,
    };
}

export default useSupabaseData;
