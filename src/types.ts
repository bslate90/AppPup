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
export type VaccineType = 'DAPP' | 'Lepto' | 'Bordetella' | 'Deworming' | 'Rabies' | 'DAPP_5' | 'DAPP_6' | 'DAPP_8' | 'DAPP_9';

/**
 * Disease components for combination vaccines
 */
export const VACCINE_COMPOSITION: Record<string, string[]> = {
    'DAPP': ['Distemper', 'Adenovirus', 'Parvovirus', 'Parainfluenza'],
    'DAPP_5': ['Distemper', 'Adenovirus', 'Parvovirus', 'Parainfluenza', 'Hepatitis'],
    'DAPP_6': ['Distemper', 'Adenovirus', 'Parvovirus', 'Parainfluenza', 'Hepatitis', 'Coronavirus'],
    'DAPP_8': ['Distemper', 'Adenovirus', 'Parvovirus', 'Parainfluenza', 'Hepatitis', 'Coronavirus', 'Lepto (2 strains)'],
    'DAPP_9': ['Distemper', 'Adenovirus', 'Parvovirus', 'Parainfluenza', 'Hepatitis', 'Coronavirus', 'Lepto (4 strains)'],
    'Lepto': ['Leptospirosis'],
    'Bordetella': ['Bordetella (Kennel Cough)'],
    'Rabies': ['Rabies'],
    'Deworming': ['Intestinal Parasites']
};

/**
 * Common vaccine brand/label names mapped to VaccineType
 * Format: { brandName: { type: VaccineType, aliases: string[] } }
 */
export interface VaccineBrandMapping {
    type: VaccineType;
    brandName: string;
    aliases: string[]; // Alternative names/spellings
    manufacturer?: string;
}

export const VACCINE_BRAND_DATABASE: VaccineBrandMapping[] = [
    // DAPP / DHPP 4-way vaccines
    { type: 'DAPP', brandName: 'Nobivac DHPP', aliases: ['nobivac dhpp', 'dhpp', 'nobivac 4'], manufacturer: 'Merck' },
    { type: 'DAPP', brandName: 'Vanguard Plus 4', aliases: ['vanguard 4', 'vanguard plus four'], manufacturer: 'Zoetis' },
    { type: 'DAPP', brandName: 'Canine Spectra 4', aliases: ['spectra 4', 'canine spectra four'], manufacturer: 'Durvet' },
    { type: 'DAPP', brandName: 'Solo-Jec 4', aliases: ['solojec 4', 'solo jec 4'], manufacturer: 'Boehringer Ingelheim' },

    // 5-way vaccines (DAPP + additional coverage)
    { type: 'DAPP_5', brandName: 'Nobivac DAPPv', aliases: ['nobivac dappv', 'dappv', 'nobivac 5'], manufacturer: 'Merck' },
    { type: 'DAPP_5', brandName: 'Vanguard Plus 5', aliases: ['vanguard 5', 'vanguard plus five', 'vanguard plus 5/cv'], manufacturer: 'Zoetis' },
    { type: 'DAPP_5', brandName: 'Canine Spectra 5', aliases: ['spectra 5', 'canine spectra five'], manufacturer: 'Durvet' },
    { type: 'DAPP_5', brandName: 'Solo-Jec 5', aliases: ['solojec 5', 'solo jec 5'], manufacturer: 'Boehringer Ingelheim' },
    { type: 'DAPP_5', brandName: 'Progard Puppy DPv', aliases: ['progard puppy', 'progard dpv'], manufacturer: 'Elanco' },

    // 6-way vaccines
    { type: 'DAPP_6', brandName: 'Canine Spectra 6', aliases: ['spectra 6', 'canine spectra six'], manufacturer: 'Durvet' },
    { type: 'DAPP_6', brandName: 'Solo-Jec 6', aliases: ['solojec 6', 'solo jec 6'], manufacturer: 'Boehringer Ingelheim' },
    { type: 'DAPP_6', brandName: 'Vanguard Plus 5/CV', aliases: ['vanguard 5 cv', 'vanguard plus 5 cv'], manufacturer: 'Zoetis' },

    // 7-way / 8-way vaccines (includes Lepto strains)
    { type: 'DAPP_8', brandName: 'Nobivac DAPP-L4', aliases: ['nobivac dapp l4', 'nobivac puppy dpl4', 'dappl4'], manufacturer: 'Merck' },
    { type: 'DAPP_8', brandName: 'Vanguard Plus 5 L4', aliases: ['vanguard 5 l4', 'vanguard plus 5 l4', 'vanguard l4'], manufacturer: 'Zoetis' },
    { type: 'DAPP_8', brandName: 'Canine Spectra 7', aliases: ['spectra 7', 'canine spectra seven'], manufacturer: 'Durvet' },
    { type: 'DAPP_8', brandName: 'Canine Spectra 9', aliases: ['spectra 9', 'canine spectra nine'], manufacturer: 'Durvet' },
    { type: 'DAPP_8', brandName: 'Solo-Jec 7', aliases: ['solojec 7', 'solo jec 7'], manufacturer: 'Boehringer Ingelheim' },

    // 9-way vaccines (max coverage)
    { type: 'DAPP_9', brandName: 'Canine Spectra 10', aliases: ['spectra 10', 'canine spectra ten'], manufacturer: 'Durvet' },
    { type: 'DAPP_9', brandName: 'Vanguard Plus 5 L4 CV', aliases: ['vanguard 5 l4 cv', 'vanguard full'], manufacturer: 'Zoetis' },
    { type: 'DAPP_9', brandName: 'Solo-Jec 9', aliases: ['solojec 9', 'solo jec 9'], manufacturer: 'Boehringer Ingelheim' },

    // Leptospirosis standalone
    { type: 'Lepto', brandName: 'Nobivac Lepto4', aliases: ['nobivac lepto', 'lepto4', 'lepto 4'], manufacturer: 'Merck' },
    { type: 'Lepto', brandName: 'Vanguard L4', aliases: ['vanguard lepto', 'l4'], manufacturer: 'Zoetis' },
    { type: 'Lepto', brandName: 'Duramune Lyme', aliases: ['duramune lepto', 'duramune l4'], manufacturer: 'Elanco' },
    { type: 'Lepto', brandName: 'LeptoVax 4', aliases: ['leptovax', 'lepto vax'], manufacturer: 'Zoetis' },

    // Bordetella
    { type: 'Bordetella', brandName: 'Nobivac Intra-Trac KC', aliases: ['intra-trac', 'intratrac', 'intra trac kc', 'nobivac kc'], manufacturer: 'Merck' },
    { type: 'Bordetella', brandName: 'Bronchi-Shield', aliases: ['bronchishield', 'bronchi shield'], manufacturer: 'Elanco' },
    { type: 'Bordetella', brandName: 'Vanguard B', aliases: ['vanguard bordetella'], manufacturer: 'Zoetis' },
    { type: 'Bordetella', brandName: 'Kennel-Jec 2', aliases: ['kenneljec', 'kennel jec'], manufacturer: 'Boehringer Ingelheim' },
    { type: 'Bordetella', brandName: 'Canine Spectra KC', aliases: ['spectra kc', 'kennel cough'], manufacturer: 'Durvet' },

    // Rabies
    { type: 'Rabies', brandName: 'Nobivac 1-Rabies', aliases: ['nobivac rabies', 'nobivac 1 rabies'], manufacturer: 'Merck' },
    { type: 'Rabies', brandName: 'Nobivac 3-Rabies', aliases: ['nobivac 3 rabies', 'nobivac 3yr rabies'], manufacturer: 'Merck' },
    { type: 'Rabies', brandName: 'IMRAB 3', aliases: ['imrab', 'imrab 3', 'imrab3'], manufacturer: 'Boehringer Ingelheim' },
    { type: 'Rabies', brandName: 'Rabvac 3', aliases: ['rabvac', 'rab vac'], manufacturer: 'Zoetis' },
    { type: 'Rabies', brandName: 'Defensor 3', aliases: ['defensor', 'defensor rabies'], manufacturer: 'Zoetis' },

    // Deworming
    { type: 'Deworming', brandName: 'Panacur', aliases: ['panacur c', 'fenbendazole'], manufacturer: 'Merck' },
    { type: 'Deworming', brandName: 'Pyrantel Pamoate', aliases: ['pyrantel', 'nemex', 'nemex-2'], manufacturer: 'Various' },
    { type: 'Deworming', brandName: 'Drontal Plus', aliases: ['drontal', 'drontal+'], manufacturer: 'Elanco' },
    { type: 'Deworming', brandName: 'Interceptor Plus', aliases: ['interceptor', 'interceptor+'], manufacturer: 'Elanco' },
    { type: 'Deworming', brandName: 'Heartgard Plus', aliases: ['heartgard', 'heartgard+', 'heart guard'], manufacturer: 'Boehringer Ingelheim' },
];

/**
 * Find matching vaccine brands based on user input
 * Returns matches sorted by relevance
 */
export const findVaccineMatches = (input: string): VaccineBrandMapping[] => {
    const searchTerm = input.toLowerCase().trim();
    if (!searchTerm) return [];

    return VACCINE_BRAND_DATABASE.filter(brand => {
        // Check brand name
        if (brand.brandName.toLowerCase().includes(searchTerm)) return true;
        // Check aliases
        if (brand.aliases.some(alias => alias.includes(searchTerm))) return true;
        // Check manufacturer
        if (brand.manufacturer?.toLowerCase().includes(searchTerm)) return true;
        return false;
    }).sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.brandName.toLowerCase() === searchTerm || a.aliases.includes(searchTerm);
        const bExact = b.brandName.toLowerCase() === searchTerm || b.aliases.includes(searchTerm);
        if (aExact && !bExact) return -1;
        if (bExact && !aExact) return 1;
        // Then by brand name length (shorter = more likely match)
        return a.brandName.length - b.brandName.length;
    });
};

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
export type TabId = 'dashboard' | 'nutrition' | 'health' | 'growth' | 'resources' | 'emergency';

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
