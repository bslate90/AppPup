/**
 * Breed Size Categories and Growth Data
 * Based on WALTHAM Puppy Growth Charts
 */

export type BreedSize = 'toy' | 'small' | 'medium' | 'large' | 'giant';

export interface BreedSizeInfo {
    category: BreedSize;
    label: string;
    adultWeightMin: number; // grams
    adultWeightMax: number; // grams
    adultWeightIdeal: number; // grams
    maturityWeeks: number; // when growth stabilizes
}

export interface GrowthPoint {
    weekNumber: number;
    minGrams: number;
    idealGrams: number;
    maxGrams: number;
}

// Size category definitions
export const SIZE_CATEGORIES: Record<BreedSize, BreedSizeInfo> = {
    toy: {
        category: 'toy',
        label: 'Toy Breed',
        adultWeightMin: 1800,
        adultWeightMax: 4500,
        adultWeightIdeal: 2700,
        maturityWeeks: 40,
    },
    small: {
        category: 'small',
        label: 'Small Breed',
        adultWeightMin: 4500,
        adultWeightMax: 11000,
        adultWeightIdeal: 7700,
        maturityWeeks: 48,
    },
    medium: {
        category: 'medium',
        label: 'Medium Breed',
        adultWeightMin: 11000,
        adultWeightMax: 23000,
        adultWeightIdeal: 17000,
        maturityWeeks: 52,
    },
    large: {
        category: 'large',
        label: 'Large Breed',
        adultWeightMin: 23000,
        adultWeightMax: 45000,
        adultWeightIdeal: 32000,
        maturityWeeks: 64,
    },
    giant: {
        category: 'giant',
        label: 'Giant Breed',
        adultWeightMin: 45000,
        adultWeightMax: 90000,
        adultWeightIdeal: 60000,
        maturityWeeks: 78,
    },
};

// Growth curves by size category (based on WALTHAM data)
export const GROWTH_CURVES: Record<BreedSize, GrowthPoint[]> = {
    toy: [
        { weekNumber: 0, minGrams: 80, idealGrams: 100, maxGrams: 120 },
        { weekNumber: 4, minGrams: 200, idealGrams: 280, maxGrams: 350 },
        { weekNumber: 8, minGrams: 400, idealGrams: 500, maxGrams: 650 },
        { weekNumber: 12, minGrams: 600, idealGrams: 800, maxGrams: 1000 },
        { weekNumber: 16, minGrams: 900, idealGrams: 1100, maxGrams: 1400 },
        { weekNumber: 20, minGrams: 1100, idealGrams: 1400, maxGrams: 1800 },
        { weekNumber: 26, minGrams: 1400, idealGrams: 1800, maxGrams: 2200 },
        { weekNumber: 36, minGrams: 1800, idealGrams: 2200, maxGrams: 2600 },
        { weekNumber: 52, minGrams: 1800, idealGrams: 2500, maxGrams: 2700 },
    ],
    small: [
        { weekNumber: 0, minGrams: 150, idealGrams: 200, maxGrams: 250 },
        { weekNumber: 4, minGrams: 500, idealGrams: 700, maxGrams: 900 },
        { weekNumber: 8, minGrams: 1200, idealGrams: 1600, maxGrams: 2000 },
        { weekNumber: 12, minGrams: 2000, idealGrams: 2800, maxGrams: 3500 },
        { weekNumber: 16, minGrams: 3000, idealGrams: 4000, maxGrams: 5000 },
        { weekNumber: 20, minGrams: 3800, idealGrams: 5000, maxGrams: 6200 },
        { weekNumber: 26, minGrams: 4200, idealGrams: 5800, maxGrams: 7500 },
        { weekNumber: 36, minGrams: 4500, idealGrams: 6500, maxGrams: 8500 },
        { weekNumber: 52, minGrams: 4500, idealGrams: 7700, maxGrams: 11000 },
    ],
    medium: [
        { weekNumber: 0, minGrams: 300, idealGrams: 400, maxGrams: 500 },
        { weekNumber: 4, minGrams: 1200, idealGrams: 1600, maxGrams: 2000 },
        { weekNumber: 8, minGrams: 2800, idealGrams: 3800, maxGrams: 4800 },
        { weekNumber: 12, minGrams: 4500, idealGrams: 6000, maxGrams: 7500 },
        { weekNumber: 16, minGrams: 6500, idealGrams: 8500, maxGrams: 10500 },
        { weekNumber: 20, minGrams: 8000, idealGrams: 10500, maxGrams: 13000 },
        { weekNumber: 26, minGrams: 9500, idealGrams: 12500, maxGrams: 15500 },
        { weekNumber: 36, minGrams: 10500, idealGrams: 14500, maxGrams: 18500 },
        { weekNumber: 52, minGrams: 11000, idealGrams: 17000, maxGrams: 23000 },
    ],
    large: [
        { weekNumber: 0, minGrams: 400, idealGrams: 550, maxGrams: 700 },
        { weekNumber: 4, minGrams: 2000, idealGrams: 2800, maxGrams: 3600 },
        { weekNumber: 8, minGrams: 5000, idealGrams: 7000, maxGrams: 9000 },
        { weekNumber: 12, minGrams: 8000, idealGrams: 11000, maxGrams: 14000 },
        { weekNumber: 16, minGrams: 11000, idealGrams: 15000, maxGrams: 19000 },
        { weekNumber: 20, minGrams: 14000, idealGrams: 19000, maxGrams: 24000 },
        { weekNumber: 26, minGrams: 17000, idealGrams: 23000, maxGrams: 29000 },
        { weekNumber: 36, minGrams: 20000, idealGrams: 27000, maxGrams: 34000 },
        { weekNumber: 52, minGrams: 23000, idealGrams: 32000, maxGrams: 41000 },
        { weekNumber: 78, minGrams: 23000, idealGrams: 32000, maxGrams: 45000 },
    ],
    giant: [
        { weekNumber: 0, minGrams: 600, idealGrams: 800, maxGrams: 1000 },
        { weekNumber: 4, minGrams: 3500, idealGrams: 4500, maxGrams: 5500 },
        { weekNumber: 8, minGrams: 8000, idealGrams: 10500, maxGrams: 13000 },
        { weekNumber: 12, minGrams: 14000, idealGrams: 18000, maxGrams: 22000 },
        { weekNumber: 16, minGrams: 20000, idealGrams: 26000, maxGrams: 32000 },
        { weekNumber: 20, minGrams: 26000, idealGrams: 34000, maxGrams: 42000 },
        { weekNumber: 26, minGrams: 32000, idealGrams: 42000, maxGrams: 52000 },
        { weekNumber: 36, minGrams: 38000, idealGrams: 50000, maxGrams: 62000 },
        { weekNumber: 52, minGrams: 42000, idealGrams: 55000, maxGrams: 68000 },
        { weekNumber: 78, minGrams: 45000, idealGrams: 60000, maxGrams: 90000 },
    ],
};

// Breed to size category mapping
const BREED_MAP: Record<string, BreedSize> = {
    // Toy breeds
    'chihuahua': 'toy',
    'yorkshire terrier': 'toy',
    'yorkie': 'toy',
    'pomeranian': 'toy',
    'maltese': 'toy',
    'toy poodle': 'toy',
    'papillon': 'toy',
    'italian greyhound': 'toy',
    'chinese crested': 'toy',
    'affenpinscher': 'toy',
    'brussels griffon': 'toy',
    'japanese chin': 'toy',
    'pekingese': 'toy',
    'russian toy': 'toy',
    'silky terrier': 'toy',
    'toy fox terrier': 'toy',

    // Small breeds
    'french bulldog': 'small',
    'beagle': 'small',
    'cocker spaniel': 'small',
    'miniature poodle': 'small',
    'miniature schnauzer': 'small',
    'shih tzu': 'small',
    'boston terrier': 'small',
    'cavalier king charles spaniel': 'small',
    'pug': 'small',
    'dachshund': 'small',
    'corgi': 'small',
    'pembroke welsh corgi': 'small',
    'cardigan welsh corgi': 'small',
    'jack russell terrier': 'small',
    'scottish terrier': 'small',
    'west highland white terrier': 'small',
    'westie': 'small',
    'lhasa apso': 'small',
    'havanese': 'small',
    'bichon frise': 'small',
    'miniature pinscher': 'small',

    // Medium breeds
    'border collie': 'medium',
    'bulldog': 'medium',
    'english bulldog': 'medium',
    'australian shepherd': 'medium',
    'springer spaniel': 'medium',
    'english springer spaniel': 'medium',
    'brittany': 'medium',
    'standard poodle': 'medium',
    'australian cattle dog': 'medium',
    'basset hound': 'medium',
    'shetland sheepdog': 'medium',
    'sheltie': 'medium',
    'whippet': 'medium',
    'staffordshire bull terrier': 'medium',
    'american staffordshire terrier': 'medium',
    'pit bull': 'medium',
    'pitbull': 'medium',
    'vizsla': 'medium',
    'dalmatian': 'medium',
    'samoyed': 'medium',

    // Large breeds
    'labrador retriever': 'large',
    'labrador': 'large',
    'lab': 'large',
    'golden retriever': 'large',
    'german shepherd': 'large',
    'rottweiler': 'large',
    'doberman': 'large',
    'doberman pinscher': 'large',
    'boxer': 'large',
    'siberian husky': 'large',
    'husky': 'large',
    'alaskan malamute': 'large',
    'belgian malinois': 'large',
    'bernese mountain dog': 'large',
    'collie': 'large',
    'weimaraner': 'large',
    'rhodesian ridgeback': 'large',
    'akita': 'large',
    'bloodhound': 'large',
    'greyhound': 'large',
    'standard schnauzer': 'large',
    'old english sheepdog': 'large',

    // Giant breeds
    'great dane': 'giant',
    'mastiff': 'giant',
    'english mastiff': 'giant',
    'bullmastiff': 'giant',
    'saint bernard': 'giant',
    'st. bernard': 'giant',
    'newfoundland': 'giant',
    'irish wolfhound': 'giant',
    'scottish deerhound': 'giant',
    'leonberger': 'giant',
    'great pyrenees': 'giant',
    'tibetan mastiff': 'giant',
    'neapolitan mastiff': 'giant',
    'cane corso': 'giant',
    'dogue de bordeaux': 'giant',
    'anatolian shepherd': 'giant',
    'komondor': 'giant',
    'kuvasz': 'giant',
};

/**
 * Get the size category for a breed
 * Returns 'small' as default if breed not found
 */
export function getBreedSize(breed: string): BreedSize {
    const normalized = breed.toLowerCase().trim();
    return BREED_MAP[normalized] || 'small';
}

/**
 * Get full breed size info
 */
export function getBreedSizeInfo(breed: string): BreedSizeInfo {
    const size = getBreedSize(breed);
    return SIZE_CATEGORIES[size];
}

/**
 * Get growth curve for a breed
 */
export function getBreedGrowthCurve(breed: string): GrowthPoint[] {
    const size = getBreedSize(breed);
    return GROWTH_CURVES[size];
}

/**
 * Get target weight for a breed at a specific age
 */
export function getBreedTargetWeight(
    breed: string,
    ageWeeks: number
): { min: number; ideal: number; max: number } | null {
    if (ageWeeks < 0) return null;

    const curve = getBreedGrowthCurve(breed);

    // Find surrounding data points for interpolation
    let lower = curve[0];
    let upper = curve[curve.length - 1];

    for (let i = 0; i < curve.length - 1; i++) {
        if (ageWeeks >= curve[i].weekNumber && ageWeeks < curve[i + 1].weekNumber) {
            lower = curve[i];
            upper = curve[i + 1];
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
}
