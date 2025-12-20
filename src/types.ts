// ============================================================
// AppPup - Chihuahua Health & Nutrition Command Center
// TypeScript Type Definitions
// ============================================================

/**
 * Puppy Profile - Core identity and birth information
 */
export interface PuppyProfile {
    id: string;
    name: string;
    birthDate: string; // ISO date string for localStorage compatibility
    breed: string;
    color: string;
    microchipId?: string;
    breederName?: string;
    notes?: string;
}

/**
 * Food Guaranteed Analysis - Values from the food bag
 */
export interface FoodAnalysis {
    id: string;
    brandName: string;
    protein: number;  // %
    fat: number;      // %
    fiber: number;    // %
    moisture: number; // %
    ash: number;      // % (default to 7 if not listed)
    type: 'food' | 'treat';
    isDefault?: boolean;
}

/**
 * Nutrition Calculation Results
 */
export interface NutritionResult {
    nfe: number;           // Nitrogen-Free Extract %
    kcalPerKg: number;     // Energy density
    rer: number;           // Resting Energy Requirement
    der: number;           // Daily Energy Requirement
    dailyGrams: number;    // Food amount per day
    mealsPerDay: number;   // Recommended meal frequency
    gramsPerMeal: number;  // Food per meal
    warnings: string[];    // Any health warnings
}

/**
 * Vaccine types supported by the app
 */
export type VaccineType = 'DAPP' | 'Lepto' | 'Bordetella' | 'Deworming' | 'Rabies';

/**
 * Alert status for health items
 */
export type AlertStatus = 'upcoming' | 'due_soon' | 'due_now' | 'overdue' | 'completed';

/**
 * Vaccine/Health Schedule Entry
 */
export interface HealthScheduleEntry {
    id: string;
    type: VaccineType;
    weekNumber: number;
    dueDate: string;       // ISO date string
    description: string;
    status: AlertStatus;
    // Record fields (filled when administered)
    administered?: boolean;
    administeredDate?: string;
    administrator?: string;
    lotNumber?: string;
    notes?: string;
}

/**
 * Weight Log Entry
 */
export interface WeightEntry {
    id: string;
    date: string;          // ISO date string
    weightGrams: number;
    notes?: string;
}

/**
 * Gum color assessment options
 */
export type GumColor = 'pink' | 'pale' | 'blue' | 'red' | 'yellow';

/**
 * Vitals Log Entry
 */
export interface VitalsEntry {
    id: string;
    date: string;          // ISO date string
    fecalScore?: number;   // 1-7 Purina scale
    gumColor?: GumColor;
    crtSeconds?: number;   // Capillary Refill Time
    temperature?: number;  // °F
    notes?: string;
}

/**
 * Complete App Data Structure (for localStorage)
 */
export interface AppData {
    profile: PuppyProfile | null;
    foodBrands: FoodAnalysis[];
    healthSchedule: HealthScheduleEntry[];
    weightLog: WeightEntry[];
    vitalsLog: VitalsEntry[];
    lastUpdated: string;
}

/**
 * Default empty app data
 */
export const DEFAULT_APP_DATA: AppData = {
    profile: null,
    foodBrands: [],
    healthSchedule: [],
    weightLog: [],
    vitalsLog: [],
    lastUpdated: new Date().toISOString(),
};

/**
 * Navigation tab options
 */
export type TabId = 'dashboard' | 'nutrition' | 'health' | 'growth' | 'resources';

/**
 * Educational resource link
 */
export interface ResourceLink {
    title: string;
    organization: string;
    url: string;
    description: string;
    category: 'vaccination' | 'nutrition' | 'growth' | 'parasites';
}

/**
 * Feeding log entry for tracking meals
 */
export interface FeedingEntry {
    id: string;
    fedAt: string;      // ISO timestamp
    amountGrams?: number;
    mealType: 'regular' | 'snack' | 'treat';
    foodBrandId?: string; // Reference to FoodAnalysis.id
    notes?: string;
}

/**
 * Weight unit preference for display
 */
export type WeightUnit = 'g' | 'oz' | 'lbs';

/**
 * Weight conversion utilities
 */
export const WeightConverter = {
    // Convert grams to other units
    fromGrams: (grams: number, unit: WeightUnit): number => {
        switch (unit) {
            case 'oz':
                return Math.round((grams / 28.3495) * 10) / 10;
            case 'lbs':
                return Math.round((grams / 453.592) * 100) / 100;
            default:
                return grams;
        }
    },

    // Convert other units to grams
    toGrams: (value: number, unit: WeightUnit): number => {
        switch (unit) {
            case 'oz':
                return Math.round(value * 28.3495);
            case 'lbs':
                return Math.round(value * 453.592);
            default:
                return value;
        }
    },

    // Format weight with unit label
    format: (grams: number, unit: WeightUnit): string => {
        const converted = WeightConverter.fromGrams(grams, unit);
        return `${converted}${unit}`;
    },

    // Unit labels
    labels: {
        g: 'grams',
        oz: 'ounces',
        lbs: 'pounds'
    } as Record<WeightUnit, string>
};
