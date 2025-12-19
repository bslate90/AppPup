import { addWeeks, differenceInDays } from 'date-fns';
import type {
    HealthScheduleEntry,
    AlertStatus,
    NutritionResult,
    FoodAnalysis
} from '../types';


// ============================================================
// WSAVA & NRC Nutrition Calculations for Toy Breeds
// ============================================================

/**
 * Calculate metabolizable energy (kcal/kg) using Modified Atwater factors
 * Formula: 10 × [(3.5 × Protein) + (8.5 × Fat) + (3.5 × NFE)]
 */
export const calculateKcalDensity = (
    protein: number,
    fat: number,
    fiber: number,
    moisture: number,
    ash: number = 7 // Default ash to 7% if not provided
): number => {
    // Calculate Nitrogen-Free Extract (carbohydrates)
    const nfe = 100 - protein - fat - fiber - moisture - ash;

    // Modified Atwater factors
    const kcalPer100g = (3.5 * protein) + (8.5 * fat) + (3.5 * nfe);
    const kcalPerKg = kcalPer100g * 10;

    return Math.round(kcalPerKg);
};

/**
 * Calculate Resting Energy Requirement (RER)
 * Formula: 70 × (weight in kg)^0.75
 */
export const calculateRER = (weightKg: number): number => {
    if (weightKg <= 0) return 0;
    return Math.round(70 * Math.pow(weightKg, 0.75));
};

/**
 * Get DER multiplier based on age for toy breeds
 * Using WSAVA growth factors adjusted for Chihuahuas
 */
export const getDERMultiplier = (ageWeeks: number): number => {
    if (ageWeeks < 16) return 3.0;      // < 4 months: 3.0 × RER
    if (ageWeeks < 52) return 2.0;      // 4-12 months: 2.0 × RER
    return 1.6;                          // Adult: 1.6 × RER
};

/**
 * Calculate Daily Energy Requirement (DER)
 */
export const calculateDER = (weightKg: number, ageWeeks: number): number => {
    const rer = calculateRER(weightKg);
    const multiplier = getDERMultiplier(ageWeeks);
    return Math.round(rer * multiplier);
};

/**
 * Calculate daily food amount in grams
 */
export const calculateDailyGrams = (der: number, kcalPerKg: number): number => {
    if (kcalPerKg <= 0) return 0;
    return Math.round((der / kcalPerKg) * 1000);
};

/**
 * Get recommended meal frequency based on age
 * Young puppies need frequent meals to prevent hypoglycemia
 */
export const getMealFrequency = (ageWeeks: number): number => {
    if (ageWeeks < 8) return 6;         // Very young: 6 meals/day
    if (ageWeeks < 12) return 4;        // 8-12 weeks: 4-5 meals/day
    if (ageWeeks < 16) return 4;        // 12-16 weeks: 4 meals/day
    if (ageWeeks < 26) return 3;        // 4-6 months: 3 meals/day
    return 2;                            // Adult: 2 meals/day
};

/**
 * Check if food density is too low for toy breed stomach capacity
 */
export const getDensityWarning = (kcalPerKg: number): string | null => {
    if (kcalPerKg < 3500) {
        return "⚠️ Caloric density too low for toy breed stomach capacity. Consider a higher-calorie formula.";
    }
    return null;
};

/**
 * Full nutrition calculation with all outputs
 */
export const calculateNutrition = (
    food: FoodAnalysis,
    weightKg: number,
    ageWeeks: number
): NutritionResult => {
    const ash = food.ash || 7;
    const nfe = 100 - food.protein - food.fat - food.fiber - food.moisture - ash;
    const kcalPerKg = calculateKcalDensity(food.protein, food.fat, food.fiber, food.moisture, ash);
    const rer = calculateRER(weightKg);
    const der = calculateDER(weightKg, ageWeeks);
    const dailyGrams = calculateDailyGrams(der, kcalPerKg);
    const mealsPerDay = getMealFrequency(ageWeeks);
    const gramsPerMeal = Math.round(dailyGrams / mealsPerDay);

    const warnings: string[] = [];

    // Density warning
    const densityWarn = getDensityWarning(kcalPerKg);
    if (densityWarn) warnings.push(densityWarn);

    // Hypoglycemia warning for young puppies
    if (ageWeeks < 12) {
        warnings.push("🍼 Young puppy requires frequent small meals to prevent hypoglycemia.");
    }

    return {
        nfe: Math.round(nfe * 10) / 10,
        kcalPerKg,
        rer,
        der,
        dailyGrams,
        mealsPerDay,
        gramsPerMeal,
        warnings,
    };
};

// ============================================================
// Health Schedule Generation (AAHA Guidelines)
// ============================================================

/**
 * Generate a unique ID
 */
const generateId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Get alert status based on due date
 */
export const getAlertStatus = (dueDate: string, administered?: boolean): AlertStatus => {
    if (administered) return 'completed';

    const now = new Date();
    const due = new Date(dueDate);
    const daysUntil = differenceInDays(due, now);

    if (daysUntil < 0) return 'overdue';
    if (daysUntil === 0) return 'due_now';
    if (daysUntil <= 7) return 'due_soon';
    return 'upcoming';
};

/**
 * Generate full health schedule based on birth date
 * Includes: DAPP, Lepto, Bordetella, Deworming
 */
export const generateFullHealthSchedule = (birthDate: Date): HealthScheduleEntry[] => {
    const schedule: HealthScheduleEntry[] = [];

    // DAPP Series (Core) - 8, 12, 16 weeks
    const dappWeeks = [8, 12, 16];
    dappWeeks.forEach((week, idx) => {
        schedule.push({
            id: generateId('dapp'),
            type: 'DAPP',
            weekNumber: week,
            dueDate: addWeeks(birthDate, week).toISOString(),
            description: `DAPP ${idx + 1}/${dappWeeks.length} - Distemper, Adenovirus, Parvovirus, Parainfluenza`,
            status: 'upcoming',
            administered: false,
        });
    });

    // Leptospirosis - 12, 16 weeks
    const leptoWeeks = [12, 16];
    leptoWeeks.forEach((week, idx) => {
        schedule.push({
            id: generateId('lepto'),
            type: 'Lepto',
            weekNumber: week,
            dueDate: addWeeks(birthDate, week).toISOString(),
            description: `Leptospirosis ${idx + 1}/${leptoWeeks.length}${idx === 1 ? ' (Booster)' : ''}`,
            status: 'upcoming',
            administered: false,
        });
    });

    // Bordetella - 8 weeks
    schedule.push({
        id: generateId('bordetella'),
        type: 'Bordetella',
        weekNumber: 8,
        dueDate: addWeeks(birthDate, 8).toISOString(),
        description: 'Bordetella (Kennel Cough) - Intranasal or Injectable',
        status: 'upcoming',
        administered: false,
    });

    // Deworming - 8, 10, 12 weeks
    const dewormWeeks = [8, 10, 12];
    dewormWeeks.forEach((week, idx) => {
        schedule.push({
            id: generateId('deworm'),
            type: 'Deworming',
            weekNumber: week,
            dueDate: addWeeks(birthDate, week).toISOString(),
            description: `Deworming ${idx + 1}/${dewormWeeks.length} - Broad spectrum antiparasitic`,
            status: 'upcoming',
            administered: false,
        });
    });

    // Rabies - 16 weeks (can vary by state)
    schedule.push({
        id: generateId('rabies'),
        type: 'Rabies',
        weekNumber: 16,
        dueDate: addWeeks(birthDate, 16).toISOString(),
        description: 'Rabies - Required by law (timing may vary by location)',
        status: 'upcoming',
        administered: false,
    });

    // Sort by due date
    return schedule.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

// ============================================================
// Waltham Growth Chart Reference Data
// ============================================================

/**
 * Waltham Toy Breed growth curve reference points (grams)
 * Based on typical Chihuahua growth pattern
 */
export const WALTHAM_GROWTH_CURVE = [
    { weekNumber: 0, minGrams: 80, idealGrams: 100, maxGrams: 120 },
    { weekNumber: 4, minGrams: 200, idealGrams: 280, maxGrams: 350 },
    { weekNumber: 8, minGrams: 400, idealGrams: 500, maxGrams: 650 },
    { weekNumber: 12, minGrams: 600, idealGrams: 800, maxGrams: 1000 },
    { weekNumber: 16, minGrams: 900, idealGrams: 1100, maxGrams: 1400 },
    { weekNumber: 20, minGrams: 1100, idealGrams: 1400, maxGrams: 1800 },
    { weekNumber: 26, minGrams: 1400, idealGrams: 1800, maxGrams: 2200 },
    { weekNumber: 36, minGrams: 1800, idealGrams: 2200, maxGrams: 2600 },
    { weekNumber: 52, minGrams: 1800, idealGrams: 2500, maxGrams: 2700 },
];

/**
 * Get target weight range for a given age
 */
export const getTargetWeight = (ageWeeks: number): { min: number; ideal: number; max: number } | null => {
    if (ageWeeks < 0) return null;

    // Find surrounding data points for interpolation
    let lower = WALTHAM_GROWTH_CURVE[0];
    let upper = WALTHAM_GROWTH_CURVE[WALTHAM_GROWTH_CURVE.length - 1];

    for (let i = 0; i < WALTHAM_GROWTH_CURVE.length - 1; i++) {
        if (ageWeeks >= WALTHAM_GROWTH_CURVE[i].weekNumber &&
            ageWeeks < WALTHAM_GROWTH_CURVE[i + 1].weekNumber) {
            lower = WALTHAM_GROWTH_CURVE[i];
            upper = WALTHAM_GROWTH_CURVE[i + 1];
            break;
        }
    }

    // If beyond data, use last point
    if (ageWeeks >= upper.weekNumber) {
        return { min: upper.minGrams, ideal: upper.idealGrams, max: upper.maxGrams };
    }

    // Linear interpolation
    const t = (ageWeeks - lower.weekNumber) / (upper.weekNumber - lower.weekNumber);
    return {
        min: Math.round(lower.minGrams + t * (upper.minGrams - lower.minGrams)),
        ideal: Math.round(lower.idealGrams + t * (upper.idealGrams - lower.idealGrams)),
        max: Math.round(lower.maxGrams + t * (upper.maxGrams - lower.maxGrams)),
    };
};

// ============================================================
// Utility Exports
// ============================================================

export type { NutritionResult };
