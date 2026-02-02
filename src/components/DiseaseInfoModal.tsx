import { useState } from 'react';
import {
    X,
    AlertTriangle,
    Clock,
    Shield,
    Heart,
    Activity,
    Syringe,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    BookOpen,
    Bug
} from 'lucide-react';
import type { DiseaseInfo } from '../data/diseaseInfo';

interface DiseaseInfoModalProps {
    disease: DiseaseInfo;
    isOpen: boolean;
    onClose: () => void;
    onLearnMore?: (diseaseId: string) => void;
}

const urgencyColors = {
    critical: {
        bg: 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700',
        border: 'border-red-500/30',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        glow: 'shadow-red-500/30'
    },
    high: {
        bg: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600',
        border: 'border-orange-500/30',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
        glow: 'shadow-orange-500/30'
    },
    moderate: {
        bg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600',
        border: 'border-blue-500/30',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        glow: 'shadow-blue-500/30'
    }
};

const typeIcons = {
    virus: '🦠',
    bacteria: '🔬',
    parasite: '🪱'
};

export function DiseaseInfoModal({ disease, isOpen, onClose, onLearnMore }: DiseaseInfoModalProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('symptoms');
    const colors = urgencyColors[disease.urgencyLevel];

    if (!isOpen) return null;

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-[var(--bg-card)] shadow-2xl animate-scale-in border border-[var(--border-color)]">
                {/* Header with gradient */}
                <div className={`${colors.bg} p-6 text-white relative overflow-hidden`}>
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Disease info */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-4xl">{disease.emoji}</span>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{disease.name}</h2>
                                {disease.scientificName && (
                                    <p className="text-sm opacity-80 italic">{disease.scientificName}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                                <AlertTriangle className="w-3 h-3" />
                                {disease.urgencyLevel.toUpperCase()} RISK
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                                {typeIcons[disease.type]} {disease.type.charAt(0).toUpperCase() + disease.type.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
                    {/* Short Description */}
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {disease.shortDescription}
                    </p>

                    {/* Symptoms Section */}
                    <div className={`rounded-2xl border ${colors.border} overflow-hidden`}>
                        <button
                            onClick={() => toggleSection('symptoms')}
                            className="w-full flex items-center justify-between p-4 bg-[var(--bg-muted)]/50 hover:bg-[var(--bg-muted)] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-white`}>
                                    <Activity className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-[var(--text-primary)]">Symptoms</span>
                            </div>
                            {expandedSection === 'symptoms' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                        </button>

                        {expandedSection === 'symptoms' && (
                            <div className="p-4 space-y-4 animate-slide-down border-t border-[var(--border-color)]">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                                        ⚠️ Early Signs
                                    </h4>
                                    <ul className="space-y-1">
                                        {disease.symptoms.early.map((symptom, idx) => (
                                            <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                <span className="text-amber-500 mt-1">•</span>
                                                {symptom}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                                        🚨 Severe Signs
                                    </h4>
                                    <ul className="space-y-1">
                                        {disease.symptoms.severe.map((symptom, idx) => (
                                            <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                <span className="text-red-500 mt-1">•</span>
                                                {symptom}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prognosis Section */}
                    <div className={`rounded-2xl border ${colors.border} overflow-hidden`}>
                        <button
                            onClick={() => toggleSection('prognosis')}
                            className="w-full flex items-center justify-between p-4 bg-[var(--bg-muted)]/50 hover:bg-[var(--bg-muted)] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-white`}>
                                    <Heart className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-[var(--text-primary)]">Prognosis & Survival</span>
                            </div>
                            {expandedSection === 'prognosis' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                        </button>

                        {expandedSection === 'prognosis' && (
                            <div className="p-4 space-y-3 animate-slide-down border-t border-[var(--border-color)]">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 mb-1">Without Treatment</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{disease.prognosis.untreated}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">With Treatment</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{disease.prognosis.treated}</p>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg-muted)] text-center">
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Survival Rate</p>
                                    <p className="text-lg font-black text-[var(--text-primary)]">{disease.prognosis.survivalRate}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Duration & Long-term Effects */}
                    <div className={`rounded-2xl border ${colors.border} overflow-hidden`}>
                        <button
                            onClick={() => toggleSection('longevity')}
                            className="w-full flex items-center justify-between p-4 bg-[var(--bg-muted)]/50 hover:bg-[var(--bg-muted)] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-white`}>
                                    <Clock className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-[var(--text-primary)]">Duration & Long-term Effects</span>
                            </div>
                            {expandedSection === 'longevity' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                        </button>

                        {expandedSection === 'longevity' && (
                            <div className="p-4 space-y-3 animate-slide-down border-t border-[var(--border-color)]">
                                <div className="p-3 rounded-xl bg-[var(--bg-muted)]">
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Illness Duration</p>
                                    <p className="text-sm text-[var(--text-secondary)]">{disease.longevity.duration}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-2">Long-term Effects</p>
                                    <ul className="space-y-1">
                                        {disease.longevity.longTermEffects.map((effect, idx) => (
                                            <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                <span className="text-[var(--text-muted)] mt-1">•</span>
                                                {effect}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transmission & Prevention */}
                    <div className={`rounded-2xl border ${colors.border} overflow-hidden`}>
                        <button
                            onClick={() => toggleSection('prevention')}
                            className="w-full flex items-center justify-between p-4 bg-[var(--bg-muted)]/50 hover:bg-[var(--bg-muted)] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-white`}>
                                    <Shield className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-[var(--text-primary)]">Transmission & Prevention</span>
                            </div>
                            {expandedSection === 'prevention' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                        </button>

                        {expandedSection === 'prevention' && (
                            <div className="p-4 space-y-3 animate-slide-down border-t border-[var(--border-color)]">
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 mb-1">How It Spreads</p>
                                    <p className="text-sm text-[var(--text-secondary)]">{disease.transmission}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg-muted)]">
                                    <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Incubation Period</p>
                                    <p className="text-sm text-[var(--text-secondary)]">{disease.incubationPeriod}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2">
                                        ✓ Prevention Methods
                                    </p>
                                    <ul className="space-y-1">
                                        {disease.prevention.map((method, idx) => (
                                            <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                <span className="text-emerald-500 mt-1">•</span>
                                                {method}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Vaccine Effectiveness</p>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)]">{disease.vaccineEffectiveness}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Who's At Risk */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <Bug className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            <h4 className="font-bold text-[var(--text-primary)]">Who's At Risk?</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {disease.atRisk.map((risk, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30"
                                >
                                    {risk}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-muted)]/30">
                    {onLearnMore && (
                        <button
                            onClick={() => onLearnMore(disease.id)}
                            className={`w-full py-4 rounded-xl font-bold text-white ${colors.bg} shadow-lg ${colors.glow} hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                        >
                            <BookOpen className="w-5 h-5" />
                            Learn More in Resources
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Compact card version for inline display
interface DiseaseCardProps {
    disease: DiseaseInfo;
    onClick: () => void;
    compact?: boolean;
}

export function DiseaseCard({ disease, onClick, compact = false }: DiseaseCardProps) {
    const colors = urgencyColors[disease.urgencyLevel];

    if (compact) {
        return (
            <button
                onClick={onClick}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-muted)]/50 hover:bg-[var(--bg-muted)] border ${colors.border} transition-all hover:scale-[1.02]`}
            >
                <span className="text-lg">{disease.emoji}</span>
                <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                    {disease.name}
                </span>
                <ChevronRight className="w-3 h-3 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`group w-full text-left p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-muted)]/80 to-[var(--bg-card)] border-2 ${colors.border} hover:border-[var(--color-primary)] transition-all hover:scale-[1.01] hover:shadow-lg`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-white text-2xl shadow-lg ${colors.glow} flex-shrink-0`}>
                    {disease.emoji}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                            {disease.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${colors.badge}`}>
                            {disease.urgencyLevel}
                        </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {disease.shortDescription}
                    </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
        </button>
    );
}

export default DiseaseInfoModal;
