// ============================================================
// Disease Information Database
// Comprehensive data for all vaccine-preventable diseases
// ============================================================

export interface DiseaseInfo {
    id: string;
    name: string;
    scientificName?: string;
    type: 'virus' | 'bacteria' | 'parasite';
    vaccineTypes: string[];
    emoji: string;
    shortDescription: string;
    symptoms: {
        early: string[];
        severe: string[];
    };
    transmission: string;
    incubationPeriod: string;
    prognosis: {
        untreated: string;
        treated: string;
        survivalRate: string;
    };
    longevity: {
        duration: string;
        longTermEffects: string[];
    };
    atRisk: string[];
    prevention: string[];
    vaccineEffectiveness: string;
    urgencyLevel: 'critical' | 'high' | 'moderate';
}

export const DISEASE_DATABASE: DiseaseInfo[] = [
    // =========================================
    // CORE VACCINE DISEASES (DAPP)
    // =========================================
    {
        id: 'distemper',
        name: 'Canine Distemper',
        scientificName: 'Canine morbillivirus (CDV)',
        type: 'virus',
        vaccineTypes: ['DAPP', 'DAPP_5', 'DAPP_6', 'DAPP_8', 'DAPP_9'],
        emoji: '🦠',
        shortDescription: 'A highly contagious and often fatal viral disease affecting multiple organ systems.',
        symptoms: {
            early: [
                'High fever (103-105°F)',
                'Watery to pus-like discharge from eyes and nose',
                'Lethargy and depression',
                'Loss of appetite',
                'Coughing and labored breathing'
            ],
            severe: [
                'Thickened nose and footpads ("hard pad disease")',
                'Seizures and convulsions',
                'Muscle twitching and paralysis',
                'Head tilting and circling',
                'Uncontrollable jaw movements ("chewing gum fits")'
            ]
        },
        transmission: 'Airborne exposure through respiratory secretions, direct contact with infected dogs, or sharing food/water bowls.',
        incubationPeriod: '1-2 weeks after exposure',
        prognosis: {
            untreated: 'Often fatal, especially in puppies. Death can occur within 2-5 weeks.',
            treated: 'Supportive care only; no cure. Survival depends on immune response.',
            survivalRate: '50% in adult dogs, lower in puppies'
        },
        longevity: {
            duration: 'Acute phase: 2-4 weeks. Neurological symptoms may appear weeks to months later.',
            longTermEffects: [
                'Permanent brain damage',
                'Chronic seizures',
                'Dental enamel damage (in puppies)',
                'Lifelong muscle twitches'
            ]
        },
        atRisk: ['Puppies under 4 months', 'Unvaccinated dogs', 'Immunocompromised dogs'],
        prevention: ['Vaccination (core vaccine)', 'Avoid contact with wild animals', 'Proper quarantine of sick dogs'],
        vaccineEffectiveness: '95-99% effective when full series completed',
        urgencyLevel: 'critical'
    },
    {
        id: 'parvovirus',
        name: 'Canine Parvovirus',
        scientificName: 'Canine parvovirus type 2 (CPV-2)',
        type: 'virus',
        vaccineTypes: ['DAPP', 'DAPP_5', 'DAPP_6', 'DAPP_8', 'DAPP_9'],
        emoji: '💀',
        shortDescription: 'An extremely contagious and potentially fatal gastrointestinal virus, especially dangerous to puppies.',
        symptoms: {
            early: [
                'Severe lethargy and weakness',
                'Loss of appetite',
                'Fever or low body temperature',
                'Abdominal pain and bloating',
                'Vomiting (often severe and frequent)'
            ],
            severe: [
                'Bloody, foul-smelling diarrhea',
                'Severe dehydration',
                'Sepsis (systemic infection)',
                'Collapse and shock',
                'Rapid weight loss'
            ]
        },
        transmission: 'Fecal-oral route. The virus is extremely hardy and survives in the environment for months to years. Can be carried on shoes, clothing, and hands.',
        incubationPeriod: '3-7 days after exposure',
        prognosis: {
            untreated: '91% mortality rate without treatment',
            treated: 'With aggressive ICU care, 68-92% survival rate',
            survivalRate: '9% untreated, up to 92% with intensive care'
        },
        longevity: {
            duration: 'Acute illness: 5-10 days. Recovery: 1-2 weeks for survivors.',
            longTermEffects: [
                'Temporary intestinal damage',
                'Potential heart damage in very young puppies',
                'Immune suppression for weeks',
                'Most survivors recover fully'
            ]
        },
        atRisk: ['Puppies 6 weeks to 6 months', 'Unvaccinated dogs', 'Rottweilers, Dobermans, and German Shepherds (higher susceptibility)'],
        prevention: ['Complete vaccination series', 'Avoid high-risk areas until fully vaccinated', 'Disinfect with bleach solution'],
        vaccineEffectiveness: '98-99% effective when full series completed',
        urgencyLevel: 'critical'
    },
    {
        id: 'adenovirus',
        name: 'Canine Adenovirus / Hepatitis',
        scientificName: 'Canine adenovirus type 1 & 2 (CAV-1, CAV-2)',
        type: 'virus',
        vaccineTypes: ['DAPP', 'DAPP_5', 'DAPP_6', 'DAPP_8', 'DAPP_9'],
        emoji: '🫀',
        shortDescription: 'A viral infection causing liver disease (hepatitis) and respiratory illness.',
        symptoms: {
            early: [
                'Fever and lethargy',
                'Loss of appetite',
                'Increased thirst and urination',
                'Abdominal pain and tenderness',
                'Tonsillitis and swollen lymph nodes'
            ],
            severe: [
                'Jaundice (yellowing of skin, gums, and eyes)',
                'Bloody diarrhea and vomiting',
                '"Blue eye" (corneal edema/clouding)',
                'Bleeding disorders (petechiae)',
                'Enlarged, painful liver',
                'Neurological signs in severe cases'
            ]
        },
        transmission: 'Direct contact with infected urine, feces, or saliva. The virus can persist in recovered dogs\' urine for 6+ months.',
        incubationPeriod: '4-9 days after exposure',
        prognosis: {
            untreated: 'Fatal in severe cases; mild cases may recover in 1-2 weeks',
            treated: 'Supportive care improves outcomes significantly',
            survivalRate: '80-90% with treatment, depends on severity'
        },
        longevity: {
            duration: 'Acute illness: 1-2 weeks. "Blue eye" may last 2-3 weeks.',
            longTermEffects: [
                'Chronic liver damage in some dogs',
                '"Blue eye" usually resolves but may recur',
                'Lifelong immunity after recovery',
                'Kidney damage possible'
            ]
        },
        atRisk: ['Puppies under 1 year', 'Unvaccinated dogs', 'Dogs in shelters or kennels'],
        prevention: ['Core vaccination (CAV-2 vaccine protects against both types)', 'Avoid contact with infected dogs'],
        vaccineEffectiveness: '95-99% effective',
        urgencyLevel: 'high'
    },
    {
        id: 'parainfluenza',
        name: 'Canine Parainfluenza',
        scientificName: 'Canine parainfluenza virus (CPIV)',
        type: 'virus',
        vaccineTypes: ['DAPP', 'DAPP_5', 'DAPP_6', 'DAPP_8', 'DAPP_9'],
        emoji: '🫁',
        shortDescription: 'A highly contagious respiratory virus and a major component of "kennel cough" complex.',
        symptoms: {
            early: [
                'Dry, hacking cough (honking sound)',
                'Runny nose',
                'Sneezing',
                'Low-grade fever',
                'Mild lethargy'
            ],
            severe: [
                'Persistent, severe coughing',
                'Thick nasal discharge',
                'Pneumonia (secondary infection)',
                'Decreased appetite',
                'Exercise intolerance'
            ]
        },
        transmission: 'Airborne transmission through coughing and sneezing. Highly contagious in group settings.',
        incubationPeriod: '2-8 days after exposure',
        prognosis: {
            untreated: 'Usually self-limiting in healthy dogs; can progress to pneumonia',
            treated: 'Full recovery expected within 1-3 weeks',
            survivalRate: '99%+ with healthy immune system'
        },
        longevity: {
            duration: 'Symptoms last 1-3 weeks. Virus shedding for 1-2 weeks after recovery.',
            longTermEffects: [
                'Usually no permanent damage',
                'Secondary pneumonia risk in young/old dogs',
                'May predispose to other respiratory infections',
                'Complete recovery expected'
            ]
        },
        atRisk: ['Dogs in kennels, daycares, shelters', 'Puppies', 'Elderly or immunocompromised dogs'],
        prevention: ['Vaccination', 'Good ventilation in kennels', 'Avoid overcrowding'],
        vaccineEffectiveness: '80-90% effective at preventing severe disease',
        urgencyLevel: 'moderate'
    },

    // =========================================
    // ADDITIONAL COMBINATION VACCINE DISEASES
    // =========================================
    {
        id: 'coronavirus',
        name: 'Canine Coronavirus',
        scientificName: 'Canine coronavirus (CCoV)',
        type: 'virus',
        vaccineTypes: ['DAPP_6', 'DAPP_8', 'DAPP_9'],
        emoji: '🔬',
        shortDescription: 'A gastrointestinal virus causing mild to moderate digestive upset, mainly in puppies.',
        symptoms: {
            early: [
                'Mild diarrhea (watery to mushy)',
                'Decreased appetite',
                'Mild lethargy',
                'Occasional vomiting',
                'Low-grade fever'
            ],
            severe: [
                'Profuse watery diarrhea',
                'Dehydration',
                'Blood in stool (rare)',
                'Combined with parvo: much more severe',
                'Weight loss'
            ]
        },
        transmission: 'Fecal-oral route through contact with infected feces. Common in shelters and breeding facilities.',
        incubationPeriod: '1-4 days after exposure',
        prognosis: {
            untreated: 'Usually self-limiting within 2-10 days; rarely fatal alone',
            treated: 'Supportive care leads to full recovery',
            survivalRate: '99%+ when not combined with other infections'
        },
        longevity: {
            duration: 'Acute illness: 2-10 days. Full recovery expected.',
            longTermEffects: [
                'Usually no permanent damage',
                'Brief immunity after infection',
                'May shed virus for weeks',
                'Dangerous if combined with parvovirus'
            ]
        },
        atRisk: ['Puppies under 12 weeks', 'Dogs in crowded conditions', 'Stressed or immunocompromised dogs'],
        prevention: ['Vaccination (in high-risk environments)', 'Good hygiene', 'Proper sanitation'],
        vaccineEffectiveness: '70-80% effective (less commonly used now)',
        urgencyLevel: 'moderate'
    },

    // =========================================
    // LEPTOSPIROSIS
    // =========================================
    {
        id: 'leptospirosis',
        name: 'Leptospirosis',
        scientificName: 'Leptospira interrogans (multiple serovars)',
        type: 'bacteria',
        vaccineTypes: ['Lepto', 'DAPP_8', 'DAPP_9'],
        emoji: '🐀',
        shortDescription: 'A bacterial infection from wildlife urine that damages kidneys and liver. Can spread to humans (zoonotic).',
        symptoms: {
            early: [
                'Sudden fever and shivering',
                'Muscle tenderness and reluctance to move',
                'Increased thirst and urination',
                'Loss of appetite',
                'Vomiting and diarrhea'
            ],
            severe: [
                'Jaundice (yellow skin, eyes, gums)',
                'Kidney failure (decrease/absence of urine)',
                'Bleeding disorders',
                'Difficulty breathing',
                'Swelling (edema)',
                'Blood in urine'
            ]
        },
        transmission: 'Contact with urine from infected wildlife (rats, raccoons, skunks) or contaminated water/soil. Enters through mucous membranes or skin wounds.',
        incubationPeriod: '4-12 days after exposure',
        prognosis: {
            untreated: 'Can be fatal; kidney and liver failure are common',
            treated: 'With early antibiotics, most dogs recover; may have permanent organ damage',
            survivalRate: '80-90% with early treatment'
        },
        longevity: {
            duration: 'Acute illness: 1-3 weeks. Treatment takes 2-4 weeks of antibiotics.',
            longTermEffects: [
                'Chronic kidney disease',
                'Liver damage',
                'Dogs can shed bacteria for months',
                'Some dogs become carriers'
            ]
        },
        atRisk: ['Dogs with outdoor exposure', 'Hunting dogs', 'Dogs in areas with wildlife', 'Dogs drinking from puddles/lakes'],
        prevention: ['Annual vaccination', 'Avoid stagnant water', 'Rodent control', 'Keep yard clean'],
        vaccineEffectiveness: '70-80% effective; covers 4 most common serovars; requires annual boosters',
        urgencyLevel: 'high'
    },

    // =========================================
    // BORDETELLA (KENNEL COUGH)
    // =========================================
    {
        id: 'bordetella',
        name: 'Bordetella (Kennel Cough)',
        scientificName: 'Bordetella bronchiseptica',
        type: 'bacteria',
        vaccineTypes: ['Bordetella'],
        emoji: '🫁',
        shortDescription: 'A highly contagious respiratory bacteria causing the classic "kennel cough" in dogs.',
        symptoms: {
            early: [
                'Dry, honking cough',
                'Retching or gagging after coughing',
                'Sneezing',
                'Nasal discharge',
                'Normal energy and appetite usually'
            ],
            severe: [
                'Persistent, exhausting cough',
                'Fever',
                'Lethargy and loss of appetite',
                'Pneumonia (secondary)',
                'Thick, colored nasal discharge'
            ]
        },
        transmission: 'Airborne droplets from coughing/sneezing, direct contact, or shared water bowls. Extremely contagious in close quarters.',
        incubationPeriod: '2-14 days after exposure',
        prognosis: {
            untreated: 'Usually resolves in 2-3 weeks; can progress to pneumonia in young/old dogs',
            treated: 'Faster recovery with antibiotics; cough suppressants help',
            survivalRate: '99%+ in healthy dogs'
        },
        longevity: {
            duration: 'Cough lasts 1-3 weeks. May persist for 6 weeks in some cases.',
            longTermEffects: [
                'Usually no permanent effects',
                'Tracheal damage rare',
                'Pneumonia risk in puppies and seniors',
                'Full recovery expected'
            ]
        },
        atRisk: ['Dogs in boarding, daycare, grooming', 'Show dogs', 'Dogs in shelters', 'Puppies and senior dogs'],
        prevention: ['Vaccination (intranasal or injectable)', 'Good ventilation', 'Avoid sick dogs'],
        vaccineEffectiveness: '70-80% effective; may still get mild disease; requires 6-12 month boosters',
        urgencyLevel: 'moderate'
    },

    // =========================================
    // RABIES
    // =========================================
    {
        id: 'rabies',
        name: 'Rabies',
        scientificName: 'Rabies lyssavirus',
        type: 'virus',
        vaccineTypes: ['Rabies'],
        emoji: '🦇',
        shortDescription: 'A fatal viral disease affecting the nervous system. 100% fatal once symptoms appear. Legally required vaccination.',
        symptoms: {
            early: [
                'Behavior changes (aggression or unusual friendliness)',
                'Fever',
                'Sensitivity to light, touch, and sound',
                'Eating unusual objects (pica)',
                'Hiding and anxiety'
            ],
            severe: [
                'Extreme aggression or "dumb" form (paralysis)',
                'Drooling and difficulty swallowing',
                'Seizures',
                'Paralysis of jaw and throat',
                'Coma and death'
            ]
        },
        transmission: 'Bite from infected animal (bats, raccoons, skunks, foxes). Virus travels through nerves to the brain.',
        incubationPeriod: '2 weeks to 4+ months depending on bite location',
        prognosis: {
            untreated: '100% fatal once clinical signs appear',
            treated: 'No treatment; euthanasia required',
            survivalRate: '0% after symptoms begin'
        },
        longevity: {
            duration: 'Once symptoms appear: death within 10 days. Incubation can be months.',
            longTermEffects: [
                'No survivors once symptomatic',
                'Disease is always fatal',
                'Prevention is the only option',
                'Post-exposure prophylaxis may work before symptoms'
            ]
        },
        atRisk: ['All mammals including humans', 'Unvaccinated dogs', 'Dogs with wildlife exposure', 'Dogs in rural areas'],
        prevention: ['Vaccination is LEGALLY REQUIRED', 'Avoid contact with wildlife', 'Report animal bites immediately'],
        vaccineEffectiveness: '99-100% effective; required by law; protects both pet and humans',
        urgencyLevel: 'critical'
    },

    // =========================================
    // INTESTINAL PARASITES (DEWORMING)
    // =========================================
    {
        id: 'roundworms',
        name: 'Roundworms',
        scientificName: 'Toxocara canis, Toxascaris leonina',
        type: 'parasite',
        vaccineTypes: ['Deworming'],
        emoji: '🪱',
        shortDescription: 'Common intestinal parasites that can be passed from mother to puppies. Treatable but can be serious in young puppies.',
        symptoms: {
            early: [
                'Pot-bellied appearance',
                'Poor growth or failure to thrive',
                'Dull coat',
                'Visible worms in stool or vomit (spaghetti-like)',
                'Mild diarrhea'
            ],
            severe: [
                'Intestinal blockage',
                'Severe diarrhea and vomiting',
                'Coughing (larval migration through lungs)',
                'Weight loss',
                'Anemia'
            ]
        },
        transmission: 'Puppies get from mother (in utero or nursing). Adults from ingesting eggs in contaminated soil or eating infected prey.',
        incubationPeriod: 'Eggs visible in stool 4-5 weeks after infection',
        prognosis: {
            untreated: 'Can be fatal in puppies; chronic poor health in adults',
            treated: 'Easy to treat with dewormers; full recovery expected',
            survivalRate: '99%+ with treatment'
        },
        longevity: {
            duration: 'Ongoing without treatment. Eggs survive years in environment.',
            longTermEffects: [
                'Usually none with treatment',
                'Can cause visceral larva migrans in humans (zoonotic)',
                'Chronic infection leads to poor health'
            ]
        },
        atRisk: ['All puppies (assume infected)', 'Dogs eating prey', 'Dogs in contaminated environments'],
        prevention: ['Regular deworming (starting at 2 weeks of age)', 'Good hygiene', 'Monthly preventatives'],
        vaccineEffectiveness: 'Dewormers are 95-100% effective; require repeated treatments',
        urgencyLevel: 'moderate'
    },
    {
        id: 'hookworms',
        name: 'Hookworms',
        scientificName: 'Ancylostoma caninum, Uncinaria stenocephala',
        type: 'parasite',
        vaccineTypes: ['Deworming'],
        emoji: '🩸',
        shortDescription: 'Blood-sucking intestinal parasites that can cause life-threatening anemia in puppies.',
        symptoms: {
            early: [
                'Dark, tarry stool',
                'Pale gums (anemia)',
                'Weakness and lethargy',
                'Poor weight gain',
                'Poor coat quality'
            ],
            severe: [
                'Severe anemia (life-threatening)',
                'Bloody diarrhea',
                'Collapse',
                'Skin irritation on feet (larvae entry)',
                'Coughing (larval migration)'
            ]
        },
        transmission: 'Larvae penetrate skin (especially feet) or are ingested. Mother to puppy transmission common.',
        incubationPeriod: '2-3 weeks until eggs appear in stool',
        prognosis: {
            untreated: 'Can be fatal in puppies from blood loss',
            treated: 'Full recovery with deworming and supportive care',
            survivalRate: '99%+ with treatment; puppies may need blood transfusions'
        },
        longevity: {
            duration: 'Chronic without treatment. Environmental contamination lasts weeks.',
            longTermEffects: [
                'Usually none with treatment',
                'Can cause cutaneous larva migrans in humans',
                'Chronic anemia without treatment'
            ]
        },
        atRisk: ['Puppies', 'Dogs in sandy/warm environments', 'Dogs walking barefoot in contaminated areas'],
        prevention: ['Regular deworming', 'Monthly preventatives', 'Clean up feces promptly'],
        vaccineEffectiveness: 'Dewormers are 95-100% effective',
        urgencyLevel: 'high'
    }
];

// Get disease by ID
export const getDiseaseById = (id: string): DiseaseInfo | undefined => {
    return DISEASE_DATABASE.find(disease => disease.id === id);
};

// Get diseases by vaccine type
export const getDiseasesByVaccineType = (vaccineType: string): DiseaseInfo[] => {
    return DISEASE_DATABASE.filter(disease => disease.vaccineTypes.includes(vaccineType));
};

// Get all unique diseases
export const getAllDiseases = (): DiseaseInfo[] => {
    return DISEASE_DATABASE;
};

// Map vaccine composition to disease info
export const getVaccineDiseasesInfo = (vaccineType: string): DiseaseInfo[] => {
    return getDiseasesByVaccineType(vaccineType);
};
