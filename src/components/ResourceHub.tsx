import { useState } from 'react';
import {
    BookOpen,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Syringe,
    Apple,
    TrendingUp,
    Bug
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
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="card">
                <div className="gradient-header">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Learning Resources
                    </h2>
                    <p className="text-sm text-white/80">Evidence-Based Guidelines</p>
                </div>

                <p className="text-sm text-slate-600">
                    This app's calculations are based on peer-reviewed veterinary guidelines.
                    Tap each resource to learn more.
                </p>
            </div>

            {/* Resources List */}
            {resources.map((resource) => {
                const isExpanded = expandedId === resource.title;

                return (
                    <div key={resource.title} className="card overflow-hidden p-0">
                        {/* Header */}
                        <button
                            className="w-full text-left p-4"
                            onClick={() => setExpandedId(isExpanded ? null : resource.title)}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[resource.category]} text-white flex items-center justify-center flex-shrink-0`}>
                                    {categoryIcons[resource.category]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-800 text-sm leading-tight">
                                        {resource.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {resource.organization}
                                    </p>
                                </div>
                                <div className="text-slate-400">
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </div>
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="px-4 pb-4 pt-0">
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-sm text-slate-700 mb-4">
                                        {resource.description}
                                    </p>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary w-full"
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

            {/* Educational Cards */}
            <div className="card bg-gradient-to-r from-cyan-50 to-blue-50">
                <div className="flex gap-3">
                    <div className="text-3xl">💡</div>
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Why Body Condition Scoring?</h4>
                        <p className="text-xs text-slate-600 mt-1">
                            The WSAVA 9-point Body Condition Score helps assess if your puppy is at a healthy weight.
                            A score of 4-5 is ideal. You should be able to feel ribs easily but not see them prominently.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card bg-gradient-to-r from-pink-50 to-rose-50">
                <div className="flex gap-3">
                    <div className="text-3xl">🍼</div>
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Hypoglycemia in Toy Breeds</h4>
                        <p className="text-xs text-slate-600 mt-1">
                            Chihuahua puppies have high metabolic rates and small glycogen reserves.
                            Feed 4-6 small meals daily until 12 weeks old. Signs of hypoglycemia:
                            weakness, trembling, disorientation.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card bg-gradient-to-r from-amber-50 to-yellow-50">
                <div className="flex gap-3">
                    <div className="text-3xl">🦴</div>
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Small Breed Nutrition</h4>
                        <p className="text-xs text-slate-600 mt-1">
                            Toy breeds need energy-dense food (≥3500 kcal/kg) because their small stomachs
                            can't hold enough low-density food to meet caloric needs. Look for "small breed"
                            or "toy breed" formulas.
                        </p>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="card bg-slate-100 border border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                    <strong>Disclaimer:</strong> This app provides educational information based on
                    published veterinary guidelines. Always consult your veterinarian for personalized
                    medical advice for your puppy.
                </p>
            </div>
        </div>
    );
}

export default ResourceHub;
