import { useState } from 'react';
import {
    BookOpen,
    ExternalLink,
    ChevronDown,
    Syringe,
    Apple,
    TrendingUp,
    Bug,
    Heart,
    Activity,
    Clock,
    Sparkles,
    Shield,
    Zap,
    Info
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
    vaccination: <Syringe className="w-6 h-6" />,
    nutrition: <Apple className="w-6 h-6" />,
    growth: <TrendingUp className="w-6 h-6" />,
    parasites: <Bug className="w-6 h-6" />,
};

const categoryColors: Record<string, { gradient: string; glow: string; bg: string }> = {
    vaccination: {
        gradient: 'from-blue-500 via-indigo-500 to-violet-600',
        glow: 'shadow-blue-500/30',
        bg: 'bg-blue-500/10'
    },
    nutrition: {
        gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
        glow: 'shadow-emerald-500/30',
        bg: 'bg-emerald-500/10'
    },
    growth: {
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
        glow: 'shadow-violet-500/30',
        bg: 'bg-violet-500/10'
    },
    parasites: {
        gradient: 'from-amber-400 via-orange-500 to-red-500',
        glow: 'shadow-amber-500/30',
        bg: 'bg-amber-500/10'
    },
};

// Pro Tips Data organized by category
const proTipsCategories = [
    {
        id: 'nutrition',
        title: 'Nutrition & Feeding',
        icon: <Apple className="w-5 h-5" />,
        gradient: 'from-emerald-500 to-teal-600',
        borderColor: 'border-emerald-500/30',
        tips: [
            { icon: '🍽️', title: 'Meal Frequency by Age', description: '8-12 weeks: 4 meals/day. 3-6 months: 3 meals/day. 6+ months: 2 meals/day. Small, frequent meals prevent hypoglycemia in toy breeds.' },
            { icon: '⚖️', title: 'Portion Control', description: 'Use a kitchen scale, not a measuring cup. Weight-based portions are 30% more accurate. Adjust every 2 weeks during growth.' },
            { icon: '💧', title: 'Hydration Matters', description: 'Puppies need 0.5-1 oz water per pound body weight daily. Wet food counts! Monitor water bowl for tracking intake.' },
            { icon: '🦴', title: 'Energy-Dense Food', description: 'Toy breeds need ≥3500 kcal/kg food. Their small stomachs can\'t hold enough low-density food to meet caloric needs.' },
            { icon: '🥩', title: 'Protein Requirements', description: 'Puppies need 22-32% protein (AAFCO). Look for named meat sources (chicken, beef) as first ingredients, not by-products.' },
            { icon: '🐟', title: 'Omega Fatty Acids', description: 'DHA supports brain development. Look for fish oil or algae-based DHA in puppy food. Aim for 0.1% DHA minimum.' },
        ]
    },
    {
        id: 'health',
        title: 'Health Monitoring',
        icon: <Activity className="w-5 h-5" />,
        gradient: 'from-rose-500 to-pink-600',
        borderColor: 'border-rose-500/30',
        tips: [
            { icon: '📊', title: 'Weekly Weigh-Ins', description: 'Weigh at same time, same scale, weekly. 10-15% weekly gain is healthy for toy breeds. Sudden changes signal problems.' },
            { icon: '💩', title: 'Stool Monitoring', description: 'Healthy stool is chocolate brown, firm but not hard (score 2-3). Black, red, or white specs require immediate vet attention.' },
            { icon: '👁️', title: 'Eye Health', description: 'Clear, bright eyes with no discharge. Excessive tearing or redness can indicate allergies, injury, or infection.' },
            { icon: '👂', title: 'Ear Checks', description: 'Healthy ears are pink, odor-free. Brown discharge or yeast smell indicates infection. Clean weekly with vet-approved solution.' },
            { icon: '🦷', title: 'Dental Development', description: 'Baby teeth start falling out at 3-4 months. By 6 months, all 42 adult teeth should be in. Retained baby teeth need extraction.' },
            { icon: '🌡️', title: 'Temperature Baseline', description: 'Normal puppy temp: 99.5-102.5°F (37.5-39.2°C). Above 103°F is fever. Below 99°F is hypothermia—both are emergencies.' },
        ]
    },
    {
        id: 'vaccination',
        title: 'Vaccination Knowledge',
        icon: <Syringe className="w-5 h-5" />,
        gradient: 'from-blue-500 to-indigo-600',
        borderColor: 'border-blue-500/30',
        tips: [
            { icon: '💉', title: 'Core vs Non-Core', description: 'Core: DAPP, Rabies (required). Non-core: Lepto, Bordetella, Lyme (based on lifestyle/region). Discuss with your vet.' },
            { icon: '⏰', title: 'The 16-Week Rule', description: 'Final DAPP booster at 16+ weeks is CRITICAL. Maternal antibodies can block earlier vaccines. Don\'t skip this one!' },
            { icon: '📅', title: 'Booster Schedule', description: 'After puppy series: 1-year booster, then every 3 years for core vaccines. Lepto/Bordetella need annual boosters.' },
            { icon: '🛡️', title: 'Titer Testing', description: 'Blood tests measure immunity levels. Alternative to automatic re-vaccination. Discuss with holistic or integrative vets.' },
            { icon: '⚠️', title: 'Post-Vaccine Care', description: 'Mild lethargy 24-48 hrs is normal. Watch for: facial swelling, vomiting, difficulty breathing—these are emergencies.' },
        ]
    },
    {
        id: 'training',
        title: 'Training & Behavior',
        icon: <Sparkles className="w-5 h-5" />,
        gradient: 'from-violet-500 to-purple-600',
        borderColor: 'border-violet-500/30',
        tips: [
            { icon: '🧠', title: 'Socialization Window', description: '3-14 weeks is the critical socialization period. Expose to 100 new things safely. This shapes lifelong behavior!' },
            { icon: '🏠', title: 'Crate Training', description: 'Crate = safe den, not punishment. Size: stand, turn, lie down. Max crate time: age in months + 1 hour.' },
            { icon: '🎯', title: 'Positive Reinforcement', description: 'Reward within 1-2 seconds of desired behavior. Use tiny treats (pea-sized) to avoid overfeeding during training.' },
            { icon: '😴', title: 'Sleep Requirements', description: 'Puppies need 18-20 hours sleep daily! Overtired puppies become nippy and hyperactive. Enforce nap times.' },
            { icon: '🚫', title: 'Bite Inhibition', description: 'Yelp and withdraw when puppy bites too hard. Redirect to toys. Learn this by 18 weeks or it\'s harder to correct.' },
            { icon: '🎾', title: 'Play = Learning', description: 'Short play sessions (5-10 min) several times daily. Tug teaches impulse control. Fetch builds recall foundation.' },
        ]
    },
    {
        id: 'safety',
        title: 'Safety & Emergencies',
        icon: <Shield className="w-5 h-5" />,
        gradient: 'from-red-500 to-orange-600',
        borderColor: 'border-red-500/30',
        tips: [
            { icon: '🍫', title: 'Toxic Foods', description: 'NEVER: Chocolate, grapes, xylitol, onions, garlic, macadamia nuts, alcohol, caffeine. Even small amounts can be fatal.' },
            { icon: '🌱', title: 'Toxic Plants', description: 'Lilies, azaleas, tulips, sago palm are deadly. Check ASPCA poison plant database before bringing plants home.' },
            { icon: '🚨', title: 'Emergency Signs', description: 'Immediate vet: collapse, seizures, bloated belly, labored breathing, pale gums, not eating 24+ hrs, blood in stool/urine.' },
            { icon: '🩹', title: 'First Aid Kit', description: 'Keep: gauze, vet wrap, hydrogen peroxide (induces vomiting—call poison control first!), digital thermometer, tweezers.' },
            { icon: '🏥', title: 'Emergency Vet Info', description: 'Save 24/7 emergency vet number NOW. Know location. ASPCA Poison Control: (888) 426-4435 ($75 fee).' },
            { icon: '🔥', title: 'Heatstroke Prevention', description: 'Toy breeds overheat fast. Signs: excessive panting, drooling, red gums. Never leave in car. Walk in cool hours.' },
        ]
    },
    {
        id: 'growth',
        title: 'Growth & Development',
        icon: <TrendingUp className="w-5 h-5" />,
        gradient: 'from-amber-500 to-yellow-600',
        borderColor: 'border-amber-500/30',
        tips: [
            { icon: '📈', title: 'Growth Spurts', description: 'Toy breeds grow fastest 8-16 weeks. Expect 2-4 oz gain weekly. Growth slows dramatically after 6 months.' },
            { icon: '🍼', title: 'Hypoglycemia Risk', description: 'Toy puppies under 12 weeks are HIGH RISK. Signs: weakness, trembling, glazed eyes. Give Karo syrup and call vet immediately.' },
            { icon: '💪', title: 'Exercise Limits', description: '5 minutes of exercise per month of age, twice daily. Over-exercising damages developing joints. No jumping until 1 year!' },
            { icon: '🦴', title: 'Growth Plate Safety', description: 'Growth plates close at 9-12 months in toy breeds. Until then: no high-impact activities, stairs limited, no jumping from heights.' },
            { icon: '🧪', title: 'Neutering Timing', description: 'Current research suggests waiting until growth is complete (9-12 months for toy breeds). Discuss optimal timing with your vet.' },
            { icon: '📝', title: 'Milestone Tracking', description: 'Eyes open: 2 weeks. Walking: 3 weeks. Weaning: 6-8 weeks. Teething: 3-6 months. Adult size: 9-12 months (toy breeds).' },
        ]
    },
];

// Pro Tips Library Component with collapsible categories
function ProTipsLibrary() {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Zap className="w-4 h-4 text-[var(--color-primary)]" />
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Pro Tips Library
                </h3>
            </div>

            <div className="space-y-3">
                {proTipsCategories.map((category) => {
                    const isExpanded = expandedCategories.has(category.id);

                    return (
                        <div
                            key={category.id}
                            className={`glass-card-interactive overflow-hidden ${category.borderColor} border`}
                        >
                            {/* Category Header - Clickable */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full text-left p-4 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} text-white flex items-center justify-center shadow-lg`}>
                                        {category.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[var(--text-primary)] text-sm">
                                            {category.title}
                                        </h4>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {category.tips.length} tips
                                        </p>
                                    </div>
                                    <div
                                        className={`text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                                    >
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>

                            {/* Expandable Tips Content */}
                            {isExpanded && (
                                <div className="px-4 pb-4 animate-slide-down">
                                    <div className="grid gap-2">
                                        {category.tips.map((tip) => (
                                            <div
                                                key={tip.title}
                                                className="glass-panel p-3 rounded-xl"
                                            >
                                                <div className="flex gap-3">
                                                    <div className="text-xl flex-shrink-0">{tip.icon}</div>
                                                    <div>
                                                        <h5 className="font-bold text-[var(--text-primary)] text-xs">{tip.title}</h5>
                                                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{tip.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Custom SVG Icons for better resolution and design
const FecalIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3C8 3 5 6 5 10c0 2.5 1 4 2.5 5s3.5 2 3.5 4c0 1-1 2-1 2h4s-1-1-1-2c0-2 2-3 3.5-4S19 12.5 19 10c0-4-3-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor" opacity="0.5" />
        <path d="M15 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor" opacity="0.5" />
    </svg>
);

const GumIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4C7 4 3 8 3 12c0 3 2 5 4 6 1.5.8 3 1 5 1s3.5-.2 5-1c2-1 4-3 4-6 0-4-4-8-9-8z" strokeLinecap="round" />
        <path d="M8 13c0-1 1-2 2-2s2 1 2 2" strokeLinecap="round" />
        <path d="M12 13c0-1 1-2 2-2s2 1 2 2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
);

const CRTIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.4" />
    </svg>
);

export function ResourceHub() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            {/* Hero Header - Glassmorphic */}
            <div className="relative overflow-hidden rounded-3xl">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-0 backdrop-blur-3xl" />

                {/* Floating orbs for depth */}
                <div className="absolute top-4 right-8 w-24 h-24 bg-cyan-400/30 rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-8 w-32 h-32 bg-violet-400/20 rounded-full blur-3xl" />

                {/* Glass card */}
                <div className="relative glass-card p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                                Learning Hub
                            </h2>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                                Evidence-Based Veterinary Guidelines
                            </p>
                        </div>
                    </div>

                    <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
                        All calculations in this app are powered by peer-reviewed veterinary science.
                        Explore each resource to understand the methodology behind your puppy's care plan.
                    </p>
                </div>
            </div>

            {/* Vitals Quick Reference - Glass Grid */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 px-1">
                    <Shield className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        Vitals Quick Reference
                    </h3>
                </div>

                {/* Fecal Score Guide - Glass Card */}
                <div className="glass-card-interactive overflow-hidden">
                    <button
                        className="w-full text-left p-5 transition-all duration-300"
                        onClick={() => setExpandedId(expandedId === 'fecal' ? null : 'fecal')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 ring-4 ring-amber-500/20">
                                    <FecalIcon />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center ring-2 ring-[var(--bg-card)]">
                                    <Activity className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                                    Fecal Scoring
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                    Purina 1-7 System • Digestive Health
                                </p>
                            </div>
                            <div className={`text-[var(--text-muted)] transition-transform duration-300 ${expandedId === 'fecal' ? 'rotate-180' : 'rotate-0'}`}>
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </button>

                    {expandedId === 'fecal' && (
                        <div className="px-5 pb-5 pt-0 animate-slide-down">
                            <div className="glass-panel p-5 space-y-4">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    The fecal score chart assesses stool consistency, providing critical insights into digestive health and hydration status.
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { score: 1, color: '#78350f', label: 'Very Hard', desc: 'Dry pellets. Possible dehydration.', status: 'warning' },
                                        { score: 2, color: '#d97706', label: 'Ideal', desc: 'Firm, segmented, easy pickup.', status: 'success' },
                                        { score: 3, color: '#fbbf24', label: 'Optimal', desc: 'Log-shaped, slight moisture.', status: 'success' },
                                        { score: 4, color: '#fcd34d', label: 'Soft', desc: 'Soggy, leaves residue.', status: 'caution' },
                                        { score: 5, color: '#a78bfa', label: 'Very Soft', desc: 'Piles, little texture.', status: 'warning' },
                                        { score: 6, color: '#8b5cf6', label: 'Liquid Edge', desc: 'Some liquid, mushy.', status: 'alert' },
                                        { score: 7, color: '#6d28d9', label: 'Watery', desc: 'Pure liquid. See vet!', status: 'danger' },
                                    ].map((item, idx) => (
                                        <div
                                            key={item.score}
                                            className={`relative p-3 rounded-xl border transition-all hover:scale-[1.02] ${item.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                                item.status === 'caution' ? 'bg-amber-500/10 border-amber-500/30' :
                                                    item.status === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
                                                        item.status === 'alert' ? 'bg-violet-500/10 border-violet-500/30' :
                                                            item.status === 'danger' ? 'bg-red-500/10 border-red-500/30' :
                                                                'bg-[var(--bg-muted)]/50 border-[var(--border-color)]'
                                                } ${idx === 6 ? 'col-span-2' : ''}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg"
                                                    style={{ backgroundColor: item.color }}
                                                >
                                                    {item.score}
                                                </div>
                                                <span className="font-bold text-sm text-[var(--text-primary)]">{item.label}</span>
                                            </div>
                                            <p className="text-[10px] text-[var(--text-secondary)] leading-snug">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[10px] text-[var(--text-muted)] italic flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    Source: Purina Fecal Scoring System
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gum Color Guide - Glass Card */}
                <div className="glass-card-interactive overflow-hidden">
                    <button
                        className="w-full text-left p-5 transition-all duration-300"
                        onClick={() => setExpandedId(expandedId === 'gums' ? null : 'gums')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 via-rose-500 to-red-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/30 ring-4 ring-rose-500/20">
                                    <GumIcon />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center ring-2 ring-[var(--bg-card)]">
                                    <Heart className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                                    Gum Color Guide
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                                    Circulation & Oxygenation Status
                                </p>
                            </div>
                            <div className={`text-[var(--text-muted)] transition-transform duration-300 ${expandedId === 'gums' ? 'rotate-180' : 'rotate-0'}`}>
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </button>

                    {expandedId === 'gums' && (
                        <div className="px-5 pb-5 pt-0 animate-slide-down">
                            <div className="glass-panel p-5 space-y-4">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    Gum color is a crucial vital sign indicating blood circulation, oxygen levels, and overall health status.
                                </p>

                                <div className="space-y-2">
                                    {[
                                        { color: '#fda4af', name: 'Healthy Pink', desc: 'Normal circulation. This is what you want to see!', ring: 'ring-pink-300', status: '✓' },
                                        { color: '#f1f5f9', name: 'Pale/White', desc: 'Anemia, blood loss, or shock. Seek immediate care!', ring: 'ring-slate-300', status: '⚠️', textColor: '#334155' },
                                        { color: '#3b82f6', name: 'Blue/Purple', desc: 'Cyanosis - severe oxygen deprivation. EMERGENCY!', ring: 'ring-blue-400', status: '🚨' },
                                        { color: '#dc2626', name: 'Bright Red', desc: 'Overheating, infection, or high blood pressure.', ring: 'ring-red-400', status: '!' },
                                        { color: '#fbbf24', name: 'Yellow', desc: 'Jaundice from liver issues or RBC destruction.', ring: 'ring-amber-400', status: '!', textColor: '#78350f' },
                                    ].map((item) => (
                                        <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-muted)]/50 border border-[var(--border-color)] hover:bg-[var(--bg-muted)] transition-colors">
                                            <div
                                                className={`w-10 h-10 rounded-xl shadow-lg ring-2 ${item.ring} flex items-center justify-center text-lg`}
                                                style={{ backgroundColor: item.color }}
                                            >
                                                <span style={{ color: item.textColor || 'white' }}>{item.status}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-[var(--text-primary)]">{item.name}</p>
                                                <p className="text-[10px] text-[var(--text-secondary)]">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[10px] text-[var(--text-muted)] italic flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    Source: Veterinary Emergency & Critical Care Society
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* CRT Guide - Glass Card */}
                <div className="glass-card-interactive overflow-hidden">
                    <button
                        className="w-full text-left p-5 transition-all duration-300"
                        onClick={() => setExpandedId(expandedId === 'crt' ? null : 'crt')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/30 ring-4 ring-cyan-500/20">
                                    <CRTIcon />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-[var(--bg-card)]">
                                    <Clock className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                                    Capillary Refill Time
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-500" />
                                    Hydration & Blood Flow Check
                                </p>
                            </div>
                            <div className="text-[var(--text-muted)] transition-transform duration-300" style={{ transform: expandedId === 'crt' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </button>

                    {expandedId === 'crt' && (
                        <div className="px-5 pb-5 pt-0 animate-slide-down">
                            <div className="glass-panel p-5 space-y-4">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    CRT measures how quickly blood returns to the capillaries after pressure is applied - a key indicator of circulation.
                                </p>

                                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                                    <p className="text-sm font-bold text-[var(--text-primary)] mb-2">How to Check CRT:</p>
                                    <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
                                        <li>Lift your puppy's upper lip gently</li>
                                        <li>Press firmly on the pink gum until it turns white</li>
                                        <li>Release and count seconds until color returns</li>
                                    </ol>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg">
                                                ✓
                                            </div>
                                            <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">1-2s</span>
                                        </div>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Normal & Healthy</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-500/15 border-2 border-red-500/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-black shadow-lg">
                                                !
                                            </div>
                                            <span className="font-black text-lg text-red-600 dark:text-red-400">&gt;2s</span>
                                        </div>
                                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">Dehydration/Shock</p>
                                    </div>
                                </div>

                                <p className="text-[10px] text-[var(--text-muted)] italic flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    Source: AAHA Canine Life Stage Guidelines
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Official Guidelines - Glass Cards */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 px-1">
                    <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        Official Guidelines
                    </h3>
                </div>

                {resources.map((resource) => {
                    const isExpanded = expandedId === resource.title;
                    const colors = categoryColors[resource.category];

                    return (
                        <div key={resource.title} className="glass-card-interactive overflow-hidden">
                            <button
                                className="w-full text-left p-5 transition-all duration-300"
                                onClick={() => setExpandedId(isExpanded ? null : resource.title)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} text-white flex items-center justify-center shadow-xl ${colors.glow} ring-4 ring-white/10`}>
                                            {categoryIcons[resource.category]}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 ${colors.bg} backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-[var(--bg-card)] border border-[var(--border-color)]`}>
                                            <ExternalLink className="w-2.5 h-2.5 text-[var(--text-primary)]" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight">
                                            {resource.title}
                                        </h3>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                                            {resource.organization}
                                        </p>
                                    </div>
                                    <div className="text-[var(--text-muted)] transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-5 pb-5 pt-0 animate-slide-down">
                                    <div className="glass-panel p-5">
                                        <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
                                            {resource.description}
                                        </p>
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`btn w-full py-4 text-sm font-bold shadow-xl bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90 transition-all rounded-xl flex items-center justify-center gap-2`}
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

            {/* Pro Tips - Collapsible Categories */}
            <ProTipsLibrary />

            {/* Disclaimer - Glass */}
            <div className="glass-card bg-[var(--bg-muted)]/30 border border-[var(--border-color)] p-6">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                        <Info className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <strong className="text-[var(--text-secondary)]">Medical Disclaimer:</strong> This app provides educational information based on
                        published veterinary guidelines. Always consult your veterinarian for personalized
                        medical advice for your puppy.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ResourceHub;
