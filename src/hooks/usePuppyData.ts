import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
    AppData,
    PuppyProfile,
    FoodAnalysis,
    HealthScheduleEntry,
    WeightEntry,
    VitalsEntry
} from '../types';
import { DEFAULT_APP_DATA } from '../types';
import { generateFullHealthSchedule, getAlertStatus } from '../utils/vetFormulas';

const STORAGE_KEY = 'apppup_data';

/**
 * Central data management hook for the puppy health app
 * Handles all CRUD operations and provides computed values
 */
export function usePuppyData() {
    const [data, setData, resetData] = useLocalStorage<AppData>(STORAGE_KEY, DEFAULT_APP_DATA);

    // ============ Profile Management ============
    const updateProfile = useCallback((profile: PuppyProfile) => {
        setData((prev) => ({
            ...prev,
            profile,
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    // ============ Food Settings ============
    const updateFoodSettings = useCallback((food: FoodAnalysis) => {
        setData((prev) => ({
            ...prev,
            foodSettings: food,
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    // ============ Health Schedule ============
    const generateSchedule = useCallback((birthDate: Date) => {
        const schedule = generateFullHealthSchedule(birthDate);
        setData((prev) => ({
            ...prev,
            healthSchedule: schedule,
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    const updateHealthEntry = useCallback((id: string, updates: Partial<HealthScheduleEntry>) => {
        setData((prev) => ({
            ...prev,
            healthSchedule: prev.healthSchedule.map((entry) =>
                entry.id === id ? { ...entry, ...updates } : entry
            ),
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    // ============ Weight Log ============
    const addWeightEntry = useCallback((entry: Omit<WeightEntry, 'id'>) => {
        const newEntry: WeightEntry = {
            ...entry,
            id: `weight_${Date.now()}`,
        };
        setData((prev) => ({
            ...prev,
            weightLog: [...prev.weightLog, newEntry].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            ),
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    const deleteWeightEntry = useCallback((id: string) => {
        setData((prev) => ({
            ...prev,
            weightLog: prev.weightLog.filter((e) => e.id !== id),
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    // ============ Vitals Log ============
    const addVitalsEntry = useCallback((entry: Omit<VitalsEntry, 'id'>) => {
        const newEntry: VitalsEntry = {
            ...entry,
            id: `vitals_${Date.now()}`,
        };
        setData((prev) => ({
            ...prev,
            vitalsLog: [...prev.vitalsLog, newEntry].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    const deleteVitalsEntry = useCallback((id: string) => {
        setData((prev) => ({
            ...prev,
            vitalsLog: prev.vitalsLog.filter((e) => e.id !== id),
            lastUpdated: new Date().toISOString(),
        }));
    }, [setData]);

    // ============ Computed Values ============
    const currentWeight = useMemo(() => {
        if (data.weightLog.length === 0) return null;
        const sorted = [...data.weightLog].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sorted[0].weightGrams;
    }, [data.weightLog]);

    const ageInWeeks = useMemo(() => {
        if (!data.profile?.birthDate) return null;
        const birth = new Date(data.profile.birthDate);
        const now = new Date();
        const diffMs = now.getTime() - birth.getTime();
        return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    }, [data.profile?.birthDate]);

    const upcomingAlerts = useMemo(() => {
        return data.healthSchedule
            .map((entry) => ({
                ...entry,
                status: getAlertStatus(entry.dueDate, entry.administered),
            }))
            .filter((e) => e.status === 'due_soon' || e.status === 'due_now' || e.status === 'overdue')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [data.healthSchedule]);

    // ============ Export ============
    const exportVetReport = useCallback(() => {
        const report = {
            exportDate: new Date().toISOString(),
            ...data,
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.profile?.name || 'puppy'}_vet_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [data]);

    return {
        // Data
        data,
        profile: data.profile,
        foodSettings: data.foodSettings,
        healthSchedule: data.healthSchedule,
        weightLog: data.weightLog,
        vitalsLog: data.vitalsLog,

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

export default usePuppyData;
