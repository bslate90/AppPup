/**
 * Canine Life Stage Data and Utilities
 * Based on AAHA 2019 Canine Life Stage Guidelines
 * 
 * Life Stages:
 * - Puppy: Birth to sexual maturity
 * - Young Adult: After maturity, full grown
 * - Mature Adult: Middle of expected lifespan
 * - Senior: Last 25% of expected lifespan
 * - Geriatric: End of life / palliative care focus
 */

import { getBreedSize, type BreedSize } from './breedData';

export type LifeStage = 'puppy' | 'young_adult' | 'mature_adult' | 'senior' | 'geriatric';

export interface LifeSpanInfo {
    averageYears: number;
    minYears: number;
    maxYears: number;
    maturityMonths: number; // When puppy becomes young adult
    seniorStartPercent: number; // 75% = last 25% is senior
}

export interface LifeStageInfo {
    stage: LifeStage;
    label: string;
    emoji: string;
    description: string;
    color: string;
    gradient: string;
    wellnessFrequency: 'frequent' | 'annual' | 'biannual';
    keyFocusAreas: string[];
    vaccineScheduleType: 'puppy_series' | 'adult_boosters' | 'senior_adjusted';
}

// Life expectancy by breed size (AAHA data)
export const LIFESPAN_BY_SIZE: Record<BreedSize, LifeSpanInfo> = {
    toy: {
        averageYears: 14,
        minYears: 12,
        maxYears: 18,
        maturityMonths: 10,
        seniorStartPercent: 75,
    },
    small: {
        averageYears: 13,
        minYears: 11,
        maxYears: 16,
        maturityMonths: 12,
        seniorStartPercent: 75,
    },
    medium: {
        averageYears: 11,
        minYears: 10,
        maxYears: 14,
        maturityMonths: 12,
        seniorStartPercent: 75,
    },
    large: {
        averageYears: 10,
        minYears: 8,
        maxYears: 12,
        maturityMonths: 15,
        seniorStartPercent: 75,
    },
    giant: {
        averageYears: 8,
        minYears: 6,
        maxYears: 10,
        maturityMonths: 18,
        seniorStartPercent: 75,
    },
};

// Life stage definitions
export const LIFE_STAGE_INFO: Record<LifeStage, LifeStageInfo> = {
    puppy: {
        stage: 'puppy',
        label: 'Puppy',
        emoji: '🐶',
        description: 'Rapid growth phase, requires puppy vaccine series and frequent vet visits',
        color: 'text-pink-600',
        gradient: 'from-pink-500 to-rose-500',
        wellnessFrequency: 'frequent',
        keyFocusAreas: [
            'Complete puppy vaccine series',
            'Deworming schedule',
            'Growth monitoring',
            'Socialization',
            'Spay/neuter planning',
        ],
        vaccineScheduleType: 'puppy_series',
    },
    young_adult: {
        stage: 'young_adult',
        label: 'Young Adult',
        emoji: '🐕',
        description: 'Fully grown, maintaining peak health, annual wellness exams',
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-indigo-500',
        wellnessFrequency: 'annual',
        keyFocusAreas: [
            'Annual wellness exams',
            'Vaccine boosters (1-year, then every 3 years)',
            'Dental care begins',
            'Weight management',
            'Heartworm/flea prevention',
        ],
        vaccineScheduleType: 'adult_boosters',
    },
    mature_adult: {
        stage: 'mature_adult',
        label: 'Mature Adult',
        emoji: '🦮',
        description: 'Middle age, monitoring for early signs of age-related conditions',
        color: 'text-emerald-600',
        gradient: 'from-emerald-500 to-teal-500',
        wellnessFrequency: 'annual',
        keyFocusAreas: [
            'Annual wellness with bloodwork',
            'Dental disease monitoring',
            'Weight and mobility checks',
            'Cancer screening awareness',
            'Joint health supplements',
        ],
        vaccineScheduleType: 'adult_boosters',
    },
    senior: {
        stage: 'senior',
        label: 'Senior',
        emoji: '🐕‍🦺',
        description: 'Last 25% of lifespan, bi-annual exams, age-related care focus',
        color: 'text-amber-600',
        gradient: 'from-amber-500 to-orange-500',
        wellnessFrequency: 'biannual',
        keyFocusAreas: [
            'Bi-annual wellness exams',
            'Comprehensive bloodwork (CBC, chemistry, thyroid)',
            'Cognitive function monitoring',
            'Mobility/arthritis management',
            'Kidney and heart health',
            'Quality of life assessments',
        ],
        vaccineScheduleType: 'senior_adjusted',
    },
    geriatric: {
        stage: 'geriatric',
        label: 'Geriatric',
        emoji: '🤍',
        description: 'Focus on comfort, quality of life, and palliative care',
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-violet-500',
        wellnessFrequency: 'biannual',
        keyFocusAreas: [
            'Quality of life assessments (HHHHHMM)',
            'Pain management',
            'Comfort and mobility aids',
            'Cognitive support',
            'End-of-life planning discussions',
            'Palliative care options',
        ],
        vaccineScheduleType: 'senior_adjusted',
    },
};

/**
 * Calculate life stage based on breed and age
 */
export function getLifeStage(breed: string, ageMonths: number): LifeStageInfo {
    const size = getBreedSize(breed);
    const lifespanInfo = LIFESPAN_BY_SIZE[size];

    const ageYears = ageMonths / 12;
    const lifespanYears = lifespanInfo.averageYears;

    // Puppy: Before maturity
    if (ageMonths < lifespanInfo.maturityMonths) {
        return LIFE_STAGE_INFO.puppy;
    }

    // Young Adult: Maturity to 40% of lifespan
    const youngAdultEnd = lifespanYears * 0.4;
    if (ageYears < youngAdultEnd) {
        return LIFE_STAGE_INFO.young_adult;
    }

    // Mature Adult: 40% to 75% of lifespan
    const matureAdultEnd = lifespanYears * 0.75;
    if (ageYears < matureAdultEnd) {
        return LIFE_STAGE_INFO.mature_adult;
    }

    // Senior: 75% to 90% of lifespan
    const seniorEnd = lifespanYears * 0.9;
    if (ageYears < seniorEnd) {
        return LIFE_STAGE_INFO.senior;
    }

    // Geriatric: 90%+ of lifespan
    return LIFE_STAGE_INFO.geriatric;
}

/**
 * Get estimated remaining lifespan
 */
export function getEstimatedRemainingYears(breed: string, ageMonths: number): {
    minYears: number;
    avgYears: number;
    maxYears: number;
} {
    const size = getBreedSize(breed);
    const lifespanInfo = LIFESPAN_BY_SIZE[size];
    const ageYears = ageMonths / 12;

    return {
        minYears: Math.max(0, lifespanInfo.minYears - ageYears),
        avgYears: Math.max(0, lifespanInfo.averageYears - ageYears),
        maxYears: Math.max(0, lifespanInfo.maxYears - ageYears),
    };
}

/**
 * Get next life stage transition
 */
export function getNextLifeStageTransition(breed: string, ageMonths: number): {
    nextStage: LifeStageInfo | null;
    monthsUntil: number;
    ageAtTransition: number;
} | null {
    const size = getBreedSize(breed);
    const lifespanInfo = LIFESPAN_BY_SIZE[size];


    const lifespanMonths = lifespanInfo.averageYears * 12;

    const transitions: { stage: LifeStage; ageMonths: number }[] = [
        { stage: 'young_adult', ageMonths: lifespanInfo.maturityMonths },
        { stage: 'mature_adult', ageMonths: lifespanMonths * 0.4 },
        { stage: 'senior', ageMonths: lifespanMonths * 0.75 },
        { stage: 'geriatric', ageMonths: lifespanMonths * 0.9 },
    ];

    for (const transition of transitions) {
        if (ageMonths < transition.ageMonths) {
            return {
                nextStage: LIFE_STAGE_INFO[transition.stage],
                monthsUntil: Math.round(transition.ageMonths - ageMonths),
                ageAtTransition: Math.round(transition.ageMonths),
            };
        }
    }

    return null;
}

/**
 * Get wellness exam schedule based on life stage
 */
export function getWellnessSchedule(lifeStage: LifeStageInfo): {
    frequency: string;
    nextDueMonths: number;
    description: string;
} {
    switch (lifeStage.wellnessFrequency) {
        case 'frequent':
            return {
                frequency: 'Every 3-4 weeks (during puppy series)',
                nextDueMonths: 1,
                description: 'Frequent visits during puppy vaccination series for health monitoring',
            };
        case 'annual':
            return {
                frequency: 'Once per year',
                nextDueMonths: 12,
                description: 'Annual comprehensive wellness exam with preventive care updates',
            };
        case 'biannual':
            return {
                frequency: 'Every 6 months',
                nextDueMonths: 6,
                description: 'Bi-annual exams recommended for early detection of age-related conditions',
            };
    }
}

/**
 * HHHHHMM Quality of Life Scale (for senior/geriatric dogs)
 * Based on Dr. Alice Villalobos's scale
 */
export interface QualityOfLifeAssessment {
    date: string;
    hurt: number; // 0-10 (pain management)
    hunger: number; // 0-10 (eating enough)
    hydration: number; // 0-10 (drinking enough)
    hygiene: number; // 0-10 (clean, groomed)
    happiness: number; // 0-10 (joy, responsiveness)
    mobility: number; // 0-10 (can move, stand, walk)
    moreBadThanGood: number; // 0-10 (good days vs bad days)
    totalScore: number; // 0-70
    interpretation: 'excellent' | 'good' | 'acceptable' | 'concerning' | 'critical';
    notes?: string;
}

export const QOL_CATEGORIES = [
    {
        id: 'hurt',
        label: 'Hurt (Pain)',
        emoji: '💊',
        description: 'Is pain being successfully managed? Breathing difficulties?',
        lowLabel: 'Severe uncontrolled pain',
        highLabel: 'Pain-free or well-managed',
    },
    {
        id: 'hunger',
        label: 'Hunger',
        emoji: '🍽️',
        description: 'Is the pet eating enough? Hand feeding or feeding tubes are OK.',
        lowLabel: 'Not eating at all',
        highLabel: 'Eating well',
    },
    {
        id: 'hydration',
        label: 'Hydration',
        emoji: '💧',
        description: 'Is the pet hydrated? Subq fluids are acceptable.',
        lowLabel: 'Severely dehydrated',
        highLabel: 'Well hydrated',
    },
    {
        id: 'hygiene',
        label: 'Hygiene',
        emoji: '🛁',
        description: 'Can the pet be kept clean? Pressure sores, soiling?',
        lowLabel: 'Cannot maintain hygiene',
        highLabel: 'Clean and well-groomed',
    },
    {
        id: 'happiness',
        label: 'Happiness',
        emoji: '😊',
        description: 'Does the pet express joy, interest, responsiveness?',
        lowLabel: 'Depressed, unresponsive',
        highLabel: 'Happy, responsive',
    },
    {
        id: 'mobility',
        label: 'Mobility',
        emoji: '🚶',
        description: 'Can the pet stand, walk, or move with assistance?',
        lowLabel: 'Immobile, struggling',
        highLabel: 'Mobile, independent',
    },
    {
        id: 'moreBadThanGood',
        label: 'More Good Days Than Bad',
        emoji: '📅',
        description: 'Are there more good days than bad days?',
        lowLabel: 'Mostly bad days',
        highLabel: 'Mostly good days',
    },
];

export function interpretQoLScore(totalScore: number): QualityOfLifeAssessment['interpretation'] {
    if (totalScore >= 60) return 'excellent';
    if (totalScore >= 50) return 'good';
    if (totalScore >= 35) return 'acceptable';
    if (totalScore >= 20) return 'concerning';
    return 'critical';
}

export function getQoLInterpretationInfo(interpretation: QualityOfLifeAssessment['interpretation']): {
    label: string;
    emoji: string;
    color: string;
    description: string;
    recommendation: string;
} {
    switch (interpretation) {
        case 'excellent':
            return {
                label: 'Excellent Quality of Life',
                emoji: '🌟',
                color: 'text-emerald-600',
                description: 'Your pet is thriving with excellent quality of life.',
                recommendation: 'Continue current care plan. Schedule routine check-ups.',
            };
        case 'good':
            return {
                label: 'Good Quality of Life',
                emoji: '😊',
                color: 'text-blue-600',
                description: 'Your pet has a good quality of life with manageable concerns.',
                recommendation: 'Monitor closely, discuss any changes with your vet.',
            };
        case 'acceptable':
            return {
                label: 'Acceptable Quality of Life',
                emoji: '🤔',
                color: 'text-amber-600',
                description: 'Quality of life is acceptable but requires close monitoring.',
                recommendation: 'Have a detailed conversation with your vet about care options.',
            };
        case 'concerning':
            return {
                label: 'Concerning Quality of Life',
                emoji: '⚠️',
                color: 'text-orange-600',
                description: 'Quality of life is declining. Intervention needed.',
                recommendation: 'Schedule a vet appointment soon to discuss care adjustments or hospice.',
            };
        case 'critical':
            return {
                label: 'Critical - End of Life Consideration',
                emoji: '💔',
                color: 'text-red-600',
                description: 'Quality of life is severely compromised.',
                recommendation: 'Urgent: Discuss humane euthanasia and end-of-life options with your vet.',
            };
    }
}

/**
 * Senior dog health monitoring checklist
 */
export const SENIOR_HEALTH_CHECKS = [
    {
        id: 'cognitive',
        category: 'Cognitive Function',
        emoji: '🧠',
        checks: [
            'Recognizes family members',
            'Responds to name',
            'Sleeps through the night',
            'No disorientation or confusion',
            'No excessive vocalization',
        ],
    },
    {
        id: 'mobility',
        category: 'Mobility & Comfort',
        emoji: '🦴',
        checks: [
            'Can stand up without difficulty',
            'Can climb stairs (if applicable)',
            'No limping or favoring limbs',
            'Comfortable lying down',
            'No signs of pain when touched',
        ],
    },
    {
        id: 'appetite',
        category: 'Appetite & Digestion',
        emoji: '🍖',
        checks: [
            'Eating normal amounts',
            'Drinking adequate water',
            'Normal stool consistency',
            'No vomiting or regurgitation',
            'Maintaining weight',
        ],
    },
    {
        id: 'senses',
        category: 'Senses',
        emoji: '👁️',
        checks: [
            'Vision appears normal',
            'Hearing appears normal',
            'No excessive ear scratching',
            'Eyes clear, no discharge',
            'No bumping into objects',
        ],
    },
    {
        id: 'behavior',
        category: 'Behavior & Mood',
        emoji: '❤️',
        checks: [
            'Shows interest in surroundings',
            'Enjoys interactions',
            'Normal energy for age',
            'No excessive panting or restlessness',
            'Seeks comfort from family',
        ],
    },
];

export default {
    getLifeStage,
    getEstimatedRemainingYears,
    getNextLifeStageTransition,
    getWellnessSchedule,
    interpretQoLScore,
    getQoLInterpretationInfo,
    LIFE_STAGE_INFO,
    LIFESPAN_BY_SIZE,
    QOL_CATEGORIES,
    SENIOR_HEALTH_CHECKS,
};
