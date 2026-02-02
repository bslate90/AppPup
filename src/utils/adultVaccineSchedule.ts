/**
 * Adult & Senior Dog Vaccine Booster Schedules
 * Based on AAHA 2022 Canine Vaccination Guidelines
 * 
 * After puppy series completion:
 * - Core vaccines: 1-year booster, then every 3 years
 * - Non-core vaccines: Annual boosters
 * - Rabies: Per local law (typically 1 year, then 3 years)
 */

import type { VaccineType, HealthScheduleEntry } from '../types';
import { getLifeStage, type LifeStageInfo } from './lifeStageData';

export interface AdultVaccineSchedule {
    type: VaccineType;
    name: string;
    category: 'core' | 'non_core' | 'situational';
    frequency: 'annually' | 'every_3_years' | 'as_needed';
    description: string;
    requiredForLifeStage: ('young_adult' | 'mature_adult' | 'senior' | 'geriatric')[];
    seniorConsiderations?: string;
    lastAdministered?: Date;
    nextDue?: Date;
}

// Core vaccines (required for all dogs)
export const CORE_VACCINE_SCHEDULE: AdultVaccineSchedule[] = [
    {
        type: 'DAPP',
        name: 'DAPP/DA2PP (Distemper, Adenovirus, Parvo, Parainfluenza)',
        category: 'core',
        frequency: 'every_3_years',
        description: 'Core vaccine protecting against four major diseases. After 1-year booster, given every 3 years.',
        requiredForLifeStage: ['young_adult', 'mature_adult', 'senior', 'geriatric'],
        seniorConsiderations: 'Consider titer testing for senior dogs to avoid unnecessary vaccination while confirming immunity.',
    },
    {
        type: 'Rabies',
        name: 'Rabies',
        category: 'core',
        frequency: 'every_3_years',
        description: 'Required by law in most areas. First adult booster at 1 year, then every 3 years (varies by jurisdiction).',
        requiredForLifeStage: ['young_adult', 'mature_adult', 'senior', 'geriatric'],
        seniorConsiderations: 'Check local exemption laws for medically fragile senior dogs.',
    },
];

// Non-core vaccines (based on lifestyle/risk)
export const NON_CORE_VACCINE_SCHEDULE: AdultVaccineSchedule[] = [
    {
        type: 'Lepto',
        name: 'Leptospirosis',
        category: 'non_core',
        frequency: 'annually',
        description: 'Recommended for dogs with outdoor exposure, hiking, or contact with wildlife/standing water.',
        requiredForLifeStage: ['young_adult', 'mature_adult', 'senior'],
        seniorConsiderations: 'Risk-benefit analysis for seniors with limited outdoor exposure.',
    },
    {
        type: 'Bordetella',
        name: 'Bordetella (Kennel Cough)',
        category: 'non_core',
        frequency: 'annually',
        description: 'Required for boarding, grooming, dog parks, or social dogs. Some facilities require every 6 months.',
        requiredForLifeStage: ['young_adult', 'mature_adult', 'senior'],
        seniorConsiderations: 'Continue if still boarding/grooming; may reduce if homebound.',
    },
];

export interface BoosterScheduleEntry {
    id: string;
    type: VaccineType;
    name: string;
    dueDate: Date;
    category: 'core' | 'non_core' | 'situational';
    frequency: string;
    status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
    priority: 'high' | 'medium' | 'low';
    notes?: string;
    seniorNote?: string;
}

/**
 * Generate adult booster schedule based on completed puppy vaccines
 */
export function generateAdultBoosterSchedule(
    puppyVaccineHistory: HealthScheduleEntry[],
    breed: string,
    ageMonths: number
): BoosterScheduleEntry[] {
    const schedule: BoosterScheduleEntry[] = [];
    const lifeStage = getLifeStage(breed, ageMonths);
    const today = new Date();

    // Find last administered date for each vaccine type
    const lastVaccineByType = new Map<VaccineType, Date>();

    for (const entry of puppyVaccineHistory) {
        if (entry.administered && entry.administeredDate) {
            const entryDate = new Date(entry.administeredDate);
            const current = lastVaccineByType.get(entry.type);
            if (!current || entryDate > current) {
                lastVaccineByType.set(entry.type, entryDate);
            }
        }
    }

    // Process core vaccines
    for (const vaccine of CORE_VACCINE_SCHEDULE) {
        const lastAdministered = findLastAdministeredForType(vaccine.type, lastVaccineByType);

        if (lastAdministered) {
            const nextDue = calculateNextDue(lastAdministered, vaccine.frequency, lifeStage);
            const status = getVaccineStatus(nextDue, today);

            schedule.push({
                id: `adult-${vaccine.type}-${nextDue.getTime()}`,
                type: vaccine.type,
                name: vaccine.name,
                dueDate: nextDue,
                category: vaccine.category,
                frequency: vaccine.frequency === 'every_3_years' ? 'Every 3 years' : 'Annually',
                status,
                priority: status === 'overdue' ? 'high' : status === 'due_soon' ? 'medium' : 'low',
                notes: vaccine.description,
                seniorNote: lifeStage.stage === 'senior' || lifeStage.stage === 'geriatric'
                    ? vaccine.seniorConsiderations
                    : undefined,
            });
        }
    }

    // Process non-core vaccines
    for (const vaccine of NON_CORE_VACCINE_SCHEDULE) {
        const lastAdministered = findLastAdministeredForType(vaccine.type, lastVaccineByType);

        if (lastAdministered) {
            const nextDue = calculateNextDue(lastAdministered, vaccine.frequency, lifeStage);
            const status = getVaccineStatus(nextDue, today);

            schedule.push({
                id: `adult-${vaccine.type}-${nextDue.getTime()}`,
                type: vaccine.type,
                name: vaccine.name,
                dueDate: nextDue,
                category: vaccine.category,
                frequency: 'Annually',
                status,
                priority: status === 'overdue' ? 'medium' : 'low',
                notes: vaccine.description,
                seniorNote: lifeStage.stage === 'senior' || lifeStage.stage === 'geriatric'
                    ? vaccine.seniorConsiderations
                    : undefined,
            });
        }
    }

    // Sort by due date
    schedule.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return schedule;
}

function findLastAdministeredForType(
    type: VaccineType,
    lastVaccineByType: Map<VaccineType, Date>
): Date | null {
    // For DAPP, check all DAPP variants
    if (type === 'DAPP') {
        const dappTypes: VaccineType[] = ['DAPP', 'DAPP_5', 'DAPP_6', 'DAPP_8', 'DAPP_9'];
        let latest: Date | null = null;

        for (const dappType of dappTypes) {
            const date = lastVaccineByType.get(dappType);
            if (date && (!latest || date > latest)) {
                latest = date;
            }
        }
        return latest;
    }

    return lastVaccineByType.get(type) || null;
}

function calculateNextDue(
    lastAdministered: Date,
    frequency: AdultVaccineSchedule['frequency'],
    _lifeStage: LifeStageInfo
): Date {
    const nextDue = new Date(lastAdministered);

    switch (frequency) {
        case 'annually':
            nextDue.setFullYear(nextDue.getFullYear() + 1);
            break;
        case 'every_3_years':
            // First booster is at 1 year, then every 3 years
            const yearsSinceLast = (Date.now() - lastAdministered.getTime()) / (1000 * 60 * 60 * 24 * 365);
            if (yearsSinceLast < 1.5) {
                // This is likely the first adult booster (1 year after puppy series)
                nextDue.setFullYear(nextDue.getFullYear() + 1);
            } else {
                nextDue.setFullYear(nextDue.getFullYear() + 3);
            }
            break;
        case 'as_needed':
            nextDue.setFullYear(nextDue.getFullYear() + 1);
            break;
    }

    return nextDue;
}

function getVaccineStatus(dueDate: Date, today: Date): BoosterScheduleEntry['status'] {
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < -30) return 'overdue';
    if (daysUntilDue < 30) return 'due_soon';
    return 'upcoming';
}

/**
 * Get vaccine recommendations for a specific life stage
 */
export function getLifeStageVaccineRecommendations(lifeStage: LifeStageInfo): {
    coreVaccines: AdultVaccineSchedule[];
    nonCoreVaccines: AdultVaccineSchedule[];
    generalAdvice: string;
} {
    const core = CORE_VACCINE_SCHEDULE.filter(v =>
        v.requiredForLifeStage.includes(lifeStage.stage as any)
    );

    const nonCore = NON_CORE_VACCINE_SCHEDULE.filter(v =>
        v.requiredForLifeStage.includes(lifeStage.stage as any)
    );

    let generalAdvice = '';

    switch (lifeStage.stage) {
        case 'young_adult':
            generalAdvice = 'Continue with standard vaccine schedule. First adult boosters are due 1 year after completing puppy series. Core vaccines switch to every 3 years after the 1-year booster.';
            break;
        case 'mature_adult':
            generalAdvice = 'Maintain regular vaccine schedule. This is a good time to establish baseline bloodwork for comparison as your dog ages.';
            break;
        case 'senior':
            generalAdvice = 'Consider titer testing to confirm immunity rather than automatic revaccination. Discuss risk-benefit of vaccines with your vet, especially for indoor or less active dogs.';
            break;
        case 'geriatric':
            generalAdvice = 'Vaccination decisions should prioritize quality of life. Many vets recommend titer testing for core diseases. Non-core vaccines may be discontinued for homebound dogs.';
            break;
        default:
            generalAdvice = 'Follow puppy vaccination schedule for now.';
    }

    return { coreVaccines: core, nonCoreVaccines: nonCore, generalAdvice };
}

/**
 * Senior wellness exam schedule
 */
export interface WellnessExamSchedule {
    examType: string;
    frequency: string;
    description: string;
    tests: string[];
    estimatedCost?: string;
}

export const SENIOR_WELLNESS_EXAMS: WellnessExamSchedule[] = [
    {
        examType: 'Comprehensive Physical Exam',
        frequency: 'Every 6 months',
        description: 'Full nose-to-tail examination including weight, vital signs, and body condition.',
        tests: [
            'Temperature, pulse, respiration',
            'Weight and body condition score',
            'Heart and lung auscultation',
            'Joint palpation and mobility',
            'Oral/dental examination',
            'Skin and coat assessment',
        ],
    },
    {
        examType: 'Senior Blood Panel',
        frequency: 'Every 6-12 months',
        description: 'Comprehensive bloodwork to monitor organ function and detect early disease.',
        tests: [
            'Complete Blood Count (CBC)',
            'Chemistry Panel (kidney, liver, glucose)',
            'Thyroid (T4) level',
            'SDMA (early kidney disease marker)',
        ],
    },
    {
        examType: 'Urinalysis',
        frequency: 'Every 6-12 months',
        description: 'Evaluates kidney function and detects urinary tract issues.',
        tests: [
            'Specific gravity',
            'Protein and glucose levels',
            'Sediment examination',
            'Bacterial culture if indicated',
        ],
    },
    {
        examType: 'Blood Pressure',
        frequency: 'Annually',
        description: 'Hypertension is common in senior dogs and can indicate kidney or heart disease.',
        tests: ['Doppler or oscillometric measurement'],
    },
    {
        examType: 'Cardiac Evaluation',
        frequency: 'As needed (annually for at-risk breeds)',
        description: 'Heart health assessment, especially for breeds prone to cardiac disease.',
        tests: [
            'Cardiac auscultation',
            'ECG if indicated',
            'Chest radiographs if indicated',
            'Echocardiogram if indicated',
        ],
    },
];

export default {
    generateAdultBoosterSchedule,
    getLifeStageVaccineRecommendations,
    CORE_VACCINE_SCHEDULE,
    NON_CORE_VACCINE_SCHEDULE,
    SENIOR_WELLNESS_EXAMS,
};
