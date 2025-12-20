import { useState } from 'react';
import {
    BookOpen,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Syringe,
    Apple,
    TrendingUp,
    Bug,
    Heart,
    Activity,
    Clock
} from 'lucide-react';
import type { ResourceLink } from '../types';

const resources: ResourceLink[] = [
    {
        title: '2022 AAHA Canine Vaccination Guidelines',
        organization: 'American Animal Hospital Association',
        url: 'https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/',
        description: 'The gold standard for puppy vaccinations. Core vaccines (DAPP) should be given at 8, 12, and 16 weeks. The 16-week booster is critical because maternal antibodies can interfere with earlier shots.',
        category: 'vaccination',
    },
    {
        title: 'WSAVA Global Nutrition Guidelines',
        organization: 'World Small Animal Veterinary Association',
        url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
        description: 'Provides Body Condition Scoring (BCS) methodology and guidelines for calculating caloric needs. For toy breeds, the RER formula (70 × kg^0.75) is adjusted with growth multipliers.',
        category: 'nutrition',
    },
    {
        title: 'WALTHAM™ Puppy Growth Charts',
        organization: 'WALTHAM Petcare Science Institute',
        url: 'https://www.waltham.com/resources/puppy-growth-charts',
        description: 'Reference curves for healthy puppy growth by breed size. Toy breeds (like Chihuahuas) have rapid growth until 6 months then plateau around 2.5-2.7kg. Exceeding the curve increases obesity risk.',
        category: 'growth',
    },
    {
        title: 'CAPC Guidelines for Dogs',
        organization: 'Companion Animal Parasite Council',
        url: 'https://capcvet.org/guidelines/',
        description: 'Evidence-based parasite control recommendations. Puppies should be dewormed at 2, 4, 6, 8, 10, and 12 weeks of age, then monthly until 6 months old.',
        category: 'parasites',
    },
];

const categoryIcons: Record<string, React.ReactNode> = {
    vaccination: <Syringe className="w-5 h-5" />,
    nutrition: <Apple className="w-5 h-5" />,
    growth: <TrendingUp className="w-5 h-5" />,
    parasites: <Bug className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
    vaccination: 'from-blue-500 to-indigo-500',
    nutrition: 'from-emerald-500 to-teal-500',
    growth: 'from-violet-500 to-purple-500',
    parasites: 'from-amber-500 to-orange-500',
};

export function ResourceHub() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Header */}
            <div className="card p-6">
                <div className="gradient-header">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <BookOpen className="w-6 h-6" />
                        Learning Resources
                    </h2>
                    <p className="text-sm text-white/90 mt-1">Evidence-Based Guidelines</p>
                </div>

                <p className="text-base text-[var(--text-secondary)] mt-4 leading-relaxed">
                    This app's calculations are based on peer-reviewed veterinary guidelines.
                    Tap each resource to learn more.
                </p>
            </div>

            {/* Vitals Guide Section */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Vitals Guide</h3>

                {/* Fecal Score Guide */}
                <div className="card overflow-hidden p-0 border border-[var(--border-color)]">
                    <button
                        className="w-full text-left p-5 transition-colors hover:bg-[var(--bg-muted)]/30"
                        onClick={() => setExpandedId(expandedId === 'fecal' ? null : 'fecal')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight">
                                    Fecal Scoring (Purina 1-7)
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                                    Digestive Health Indicator
                                </p>
                            </div>
                            <div className="text-[var(--text-muted)]">
                                {expandedId === 'fecal' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </div>
                    </button>
                    {expandedId === 'fecal' && (
                        <div className="px-5 pb-5 pt-0 animate-slide-down">
                            <div className="bg-[var(--bg-muted)]/50 rounded-2xl p-5 border border-[var(--border-color)] space-y-3">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    The fecal score chart assesses stool consistency, providing insights into digestive health and hydration.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-amber-900 text-white text-[10px] flex items-center justify-center flex-shrink-0">1</div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Score 1:</strong> Very hard and dry. Individual pellets. May indicate dehydration.</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center flex-shrink-0">2</div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Score 2:</strong> Firm but not hard. Pliable. Ideal consistency.</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-amber-400 text-white text-[10px] flex items-center justify-center flex-shrink-0">4</div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Score 4:</strong> Very moist/soggy. Leaves residue when picked up.</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center flex-shrink-0">7</div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Score 7:</strong> Watery. No texture. Flat puddles. Seek vet advice.</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] italic">Source: Purina Fecal Scoring Chart</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gum Color Guide */}
                <div className="card overflow-hidden p-0 border border-[var(--border-color)]">
                    <button
                        className="w-full text-left p-5 transition-colors hover:bg-[var(--bg-muted)]/30"
                        onClick={() => setExpandedId(expandedId === 'gums' ? null : 'gums')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Heart className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight">
                                    Gum Color Meaning
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                                    Circulation & Oxygenation
                                </p>
                            </div>
                            <div className="text-[var(--text-muted)]">
                                {expandedId === 'gums' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </div>
                    </button>
                    {expandedId === 'gums' && (
                        <div className="px-5 pb-5 pt-0 animate-slide-down">
                            <div className="bg-[var(--bg-muted)]/50 rounded-2xl p-5 border border-[var(--border-color)] space-y-3">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    Gum color is a crucial indicator of blood flow and oxygen levels.
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-pink-300 shadow-sm"></div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Pink:</strong> Normal and healthy circulation.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 shadow-sm"></div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Pale/White:</strong> Anemia, shock, or poor circulation. <strong>Emergency!</strong></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Blue/Purple:</strong> Oxygen deprivation (Cyanosis). <strong>Critical Emergency!</strong></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-red-600 shadow-sm"></div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Bright Red:</strong> Infection, overheating, or high blood pressure.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm"></div>
                                        <p className="text-xs text-[var(--text-secondary)]"><strong>Yellow:</strong> Jaundice, liver issues, or RBC damage.</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] italic">Source: Veterinary Emergency & Critical Care Society</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* CRT Guide */}
                <div className="card overflow-hidden p-0 border border-[var(--border-color)]">
                    <button
                        className="w-full text-left p-5 transition-colors hover:bg-[var(--bg-muted)]/30"
                        onClick={() => setExpandedId(expandedId === 'crt' ? null : 'crt')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight">
                                    Capillary Refill Time (CRT)
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                                    Hydration & Blood Flow
                                </p>
                            </div>
                            <div className="text-[var(--text-muted)]">
                                {expandedId === 'crt' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </div>
                    </button>
                    {expandedId === 'crt' && (
                        <div className="px-5 pb-5 pt-0 animate-slide-down">
                            <div className="bg-[var(--bg-muted)]/50 rounded-2xl p-5 border border-[var(--border-color)] space-y-3">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    CRT measures how quickly blood returns to the capillaries after pressure is applied.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-xs text-[var(--text-secondary)]"><strong>How to check:</strong> Press firmly on the pink gum until it turns white, then release. Count the seconds until it turns pink again.</p>
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Normal: 1 to 2 seconds</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-xs text-red-700 dark:text-red-400 font-bold">Abnormal: &gt; 2 seconds (Dehydration, Shock, Heart issues)</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] italic">Source: AAHA Canine Life Stage Guidelines</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Official Guidelines List */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Official Guidelines</h3>
                {resources.map((resource) => {
                    const isExpanded = expandedId === resource.title;

                    return (
                        <div key={resource.title} className="card overflow-hidden p-0 border border-[var(--border-color)]">
                            {/* Header */}
                            <button
                                className="w-full text-left p-5 transition-colors hover:bg-[var(--bg-muted)]/30"
                                onClick={() => setExpandedId(isExpanded ? null : resource.title)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${categoryColors[resource.category]} text-white flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                        {categoryIcons[resource.category]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight">
                                            {resource.title}
                                        </h3>
                                        <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                                            {resource.organization}
                                        </p>
                                    </div>
                                    <div className="text-[var(--text-muted)]">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-5 pb-5 pt-0 animate-slide-down">
                                    <div className="bg-[var(--bg-muted)]/50 rounded-2xl p-5 border border-[var(--border-color)]">
                                        <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
                                            {resource.description}
                                        </p>
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary w-full py-3 text-sm font-bold shadow-md"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Read Full Guidelines
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Educational Cards */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Quick Tips</h3>

                <div className="card border-l-4 border-l-cyan-500 p-5">
                    <div className="flex gap-4">
                        <div className="text-3xl flex-shrink-0">💡</div>
                        <div>
                            <h4 className="font-bold text-[var(--text-primary)] text-base">Why Body Condition Scoring?</h4>
                            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                                The WSAVA 9-point Body Condition Score helps assess if your puppy is at a healthy weight.
                                A score of 4-5 is ideal. You should be able to feel ribs easily but not see them prominently.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-l-pink-500 p-5">
                    <div className="flex gap-4">
                        <div className="text-3xl flex-shrink-0">🍼</div>
                        <div>
                            <h4 className="font-bold text-[var(--text-primary)] text-base">Hypoglycemia in Toy Breeds</h4>
                            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                                Chihuahua puppies have high metabolic rates and small glycogen reserves.
                                Feed 4-6 small meals daily until 12 weeks old. Signs of hypoglycemia:
                                weakness, trembling, disorientation.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-l-amber-500 p-5">
                    <div className="flex gap-4">
                        <div className="text-3xl flex-shrink-0">🦴</div>
                        <div>
                            <h4 className="font-bold text-[var(--text-primary)] text-base">Small Breed Nutrition</h4>
                            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                                Toy breeds need energy-dense food (≥3500 kcal/kg) because their small stomachs
                                can't hold enough low-density food to meet caloric needs. Look for "small breed"
                                or "toy breed" formulas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="card bg-[var(--bg-muted)] border border-[var(--border-color)] p-6">
                <p className="text-xs text-[var(--text-muted)] text-center leading-relaxed">
                    <strong className="text-[var(--text-secondary)]">Disclaimer:</strong> This app provides educational information based on
                    published veterinary guidelines. Always consult your veterinarian for personalized
                    medical advice for your puppy.
                </p>
            </div>
        </div>
    );
}

export default ResourceHub;
