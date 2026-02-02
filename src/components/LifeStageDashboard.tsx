import { useState } from 'react';
import {
    Calendar,
    Heart,
    Activity,
    Clock,
    Syringe,
    ChevronRight,
    ChevronDown,
    CheckCircle2,
    TrendingUp,
    Star,
    Sparkles,
    Info
} from 'lucide-react';
import {
    getLifeStage,
    getNextLifeStageTransition,
    getEstimatedRemainingYears,
    getWellnessSchedule,
    SENIOR_HEALTH_CHECKS,
    QOL_CATEGORIES,
    interpretQoLScore,
    getQoLInterpretationInfo
} from '../utils/lifeStageData';
import {
    generateAdultBoosterSchedule,
    getLifeStageVaccineRecommendations,
    SENIOR_WELLNESS_EXAMS,
    type BoosterScheduleEntry
} from '../utils/adultVaccineSchedule';
import type { HealthScheduleEntry } from '../types';

interface LifeStageDashboardProps {
    breed: string;
    birthDate: string;
    healthSchedule: HealthScheduleEntry[];
}

export function LifeStageDashboard({ breed, birthDate, healthSchedule }: LifeStageDashboardProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('overview');
    const [qolScores, setQolScores] = useState<Record<string, number>>({
        hurt: 5,
        hunger: 5,
        hydration: 5,
        hygiene: 5,
        happiness: 5,
        mobility: 5,
        moreBadThanGood: 5,
    });

    // Calculate age in months
    const birth = new Date(birthDate);
    const today = new Date();
    const ageMonths = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const ageYears = Math.floor(ageMonths / 12);
    const remainingMonths = ageMonths % 12;

    // Get life stage info
    const lifeStage = getLifeStage(breed, ageMonths);
    const nextTransition = getNextLifeStageTransition(breed, ageMonths);
    const remainingYears = getEstimatedRemainingYears(breed, ageMonths);
    const wellnessSchedule = getWellnessSchedule(lifeStage);
    const vaccineRecommendations = getLifeStageVaccineRecommendations(lifeStage);

    // Generate adult booster schedule
    const adultBoosters = lifeStage.stage !== 'puppy'
        ? generateAdultBoosterSchedule(healthSchedule, breed, ageMonths)
        : [];

    // Calculate QoL total score
    const qolTotalScore = Object.values(qolScores).reduce((sum, val) => sum + val, 0);
    const qolInterpretation = interpretQoLScore(qolTotalScore);
    const qolInfo = getQoLInterpretationInfo(qolInterpretation);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const isSeniorOrGeriatric = lifeStage.stage === 'senior' || lifeStage.stage === 'geriatric';

    return (
        <div className="space-y-6">
            {/* Life Stage Header Card */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${lifeStage.gradient} p-6 text-white shadow-2xl`}>
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl shadow-lg">
                            {lifeStage.emoji}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Current Life Stage</p>
                            <h2 className="text-3xl font-black tracking-tight">{lifeStage.label}</h2>
                            <p className="text-sm opacity-90 mt-1">
                                {ageYears} years{remainingMonths > 0 ? `, ${remainingMonths} months` : ''} old
                            </p>
                        </div>
                    </div>

                    <p className="text-sm opacity-90 leading-relaxed mb-4">
                        {lifeStage.description}
                    </p>

                    {/* Next Transition Info */}
                    {nextTransition && (
                        <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Next Stage: <strong>{nextTransition.nextStage?.label}</strong> in ~{Math.round(nextTransition.monthsUntil / 12)} years
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Key Focus Areas */}
            <div className="card">
                <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleSection('focus')}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${lifeStage.gradient} flex items-center justify-center text-white shadow-lg`}>
                            <Star className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-[var(--text-primary)]">Key Focus Areas</h3>
                            <p className="text-xs text-[var(--text-muted)]">Priority health tasks for {lifeStage.label.toLowerCase()} dogs</p>
                        </div>
                    </div>
                    {expandedSection === 'focus' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                </button>

                {expandedSection === 'focus' && (
                    <div className="mt-4 space-y-2 animate-slide-down">
                        {lifeStage.keyFocusAreas.map((area, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-muted)]/50 border border-[var(--border-color)]"
                            >
                                <CheckCircle2 className={`w-5 h-5 ${lifeStage.color}`} />
                                <span className="text-sm text-[var(--text-secondary)]">{area}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Wellness Exam Schedule */}
            <div className="card">
                <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleSection('wellness')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                            <Heart className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-[var(--text-primary)]">Wellness Exams</h3>
                            <p className="text-xs text-[var(--text-muted)]">{wellnessSchedule.frequency}</p>
                        </div>
                    </div>
                    {expandedSection === 'wellness' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                </button>

                {expandedSection === 'wellness' && (
                    <div className="mt-4 space-y-4 animate-slide-down">
                        <p className="text-sm text-[var(--text-secondary)]">
                            {wellnessSchedule.description}
                        </p>

                        {isSeniorOrGeriatric && (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                    Recommended Senior Wellness Tests
                                </p>
                                {SENIOR_WELLNESS_EXAMS.map((exam, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-[var(--bg-muted)]/50 border border-[var(--border-color)]">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-sm text-[var(--text-primary)]">{exam.examType}</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                                {exam.frequency}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] mb-2">{exam.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {exam.tests.slice(0, 4).map((test, tidx) => (
                                                <span key={tidx} className="text-[9px] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                                    {test}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Vaccine Schedule (Adult Boosters) */}
            {lifeStage.stage !== 'puppy' && (
                <div className="card">
                    <button
                        className="w-full flex items-center justify-between"
                        onClick={() => toggleSection('vaccines')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                                <Syringe className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-[var(--text-primary)]">Adult Vaccine Boosters</h3>
                                <p className="text-xs text-[var(--text-muted)]">{adultBoosters.length} vaccines tracked</p>
                            </div>
                        </div>
                        {expandedSection === 'vaccines' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                    </button>

                    {expandedSection === 'vaccines' && (
                        <div className="mt-4 space-y-4 animate-slide-down">
                            <p className="text-sm text-[var(--text-secondary)]">
                                {vaccineRecommendations.generalAdvice}
                            </p>

                            {adultBoosters.length > 0 ? (
                                <div className="space-y-3">
                                    {adultBoosters.map((booster) => (
                                        <BoosterCard key={booster.id} booster={booster} />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                        <Info className="w-4 h-4" />
                                        <p className="text-sm font-medium">No vaccine history found</p>
                                    </div>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                        Record completed vaccines to track adult booster schedules.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Quality of Life Assessment (Senior/Geriatric only) */}
            {isSeniorOrGeriatric && (
                <div className="card">
                    <button
                        className="w-full flex items-center justify-between"
                        onClick={() => toggleSection('qol')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white shadow-lg">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-[var(--text-primary)]">Quality of Life Assessment</h3>
                                <p className="text-xs text-[var(--text-muted)]">HHHHHMM Scale by Dr. Villalobos</p>
                            </div>
                        </div>
                        {expandedSection === 'qol' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                    </button>

                    {expandedSection === 'qol' && (
                        <div className="mt-4 space-y-4 animate-slide-down">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Rate each area from 0-10 (10 being best) to assess your senior dog's quality of life.
                            </p>

                            <div className="space-y-4">
                                {QOL_CATEGORIES.map((category) => (
                                    <div key={category.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{category.emoji}</span>
                                                <span className="font-bold text-sm text-[var(--text-primary)]">{category.label}</span>
                                            </div>
                                            <span className="text-lg font-black text-[var(--text-primary)]">
                                                {qolScores[category.id]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-[var(--text-muted)] w-16">{category.lowLabel}</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                value={qolScores[category.id]}
                                                onChange={(e) => setQolScores({
                                                    ...qolScores,
                                                    [category.id]: parseInt(e.target.value)
                                                })}
                                                className="flex-1 accent-purple-500"
                                                aria-label={`Rate ${category.label} from 0 to 10`}
                                                title={category.description}
                                            />
                                            <span className="text-[9px] text-[var(--text-muted)] w-16 text-right">{category.highLabel}</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-muted)] italic">{category.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* QoL Score Result */}
                            <div className={`p-4 rounded-2xl border-2 ${qolInterpretation === 'excellent' ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700' :
                                qolInterpretation === 'good' ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700' :
                                    qolInterpretation === 'acceptable' ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700' :
                                        qolInterpretation === 'concerning' ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700' :
                                            'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">{qolInfo.emoji}</span>
                                    <div>
                                        <p className={`font-bold text-lg ${qolInfo.color}`}>{qolTotalScore}/70</p>
                                        <p className={`text-sm font-medium ${qolInfo.color}`}>{qolInfo.label}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] mb-2">{qolInfo.description}</p>
                                <p className="text-xs text-[var(--text-muted)] italic">
                                    <strong>Recommendation:</strong> {qolInfo.recommendation}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Senior Health Checklist */}
            {isSeniorOrGeriatric && (
                <div className="card">
                    <button
                        className="w-full flex items-center justify-between"
                        onClick={() => toggleSection('checklist')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-[var(--text-primary)]">Senior Health Checklist</h3>
                                <p className="text-xs text-[var(--text-muted)]">Weekly monitoring guide</p>
                            </div>
                        </div>
                        {expandedSection === 'checklist' ? <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
                    </button>

                    {expandedSection === 'checklist' && (
                        <div className="mt-4 space-y-4 animate-slide-down">
                            {SENIOR_HEALTH_CHECKS.map((category) => (
                                <div key={category.id} className="p-3 rounded-xl bg-[var(--bg-muted)]/50 border border-[var(--border-color)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{category.emoji}</span>
                                        <h4 className="font-bold text-sm text-[var(--text-primary)]">{category.category}</h4>
                                    </div>
                                    <div className="space-y-1">
                                        {category.checks.map((check, idx) => (
                                            <label key={idx} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded accent-amber-500" />
                                                <span>{check}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Life Expectancy Info */}
            <div className="card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-[var(--text-muted)]" />
                    <h4 className="font-bold text-[var(--text-primary)]">Life Expectancy</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{remainingYears.minYears.toFixed(1)}</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase">Min Years Left</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{remainingYears.avgYears.toFixed(1)}</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase">Avg Years Left</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{remainingYears.maxYears.toFixed(1)}</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase">Max Years Left</p>
                    </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] text-center mt-3 italic">
                    Based on breed size averages. Individual dogs may vary based on genetics, care, and health history.
                </p>
            </div>
        </div>
    );
}

// Booster Card Component
function BoosterCard({ booster }: { booster: BoosterScheduleEntry }) {
    const statusColors = {
        overdue: 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700',
        due_soon: 'bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700',
        upcoming: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
        completed: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700',
    };

    const statusLabels = {
        overdue: { label: 'Overdue', emoji: '🚨', color: 'text-red-700 dark:text-red-300' },
        due_soon: { label: 'Due Soon', emoji: '⏰', color: 'text-amber-700 dark:text-amber-300' },
        upcoming: { label: 'Upcoming', emoji: '📅', color: 'text-blue-700 dark:text-blue-300' },
        completed: { label: 'Completed', emoji: '✅', color: 'text-emerald-700 dark:text-emerald-300' },
    };

    const status = statusLabels[booster.status];

    return (
        <div className={`p-3 rounded-xl border ${statusColors[booster.status]}`}>
            <div className="flex items-start justify-between mb-1">
                <div>
                    <p className="font-bold text-sm text-[var(--text-primary)]">{booster.type}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{booster.name}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.color} bg-white/50 dark:bg-black/20`}>
                    <span>{status.emoji}</span>
                    <span>{status.label}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-secondary)]">
                    Due: {booster.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)]">
                    {booster.frequency}
                </span>
            </div>
            {booster.seniorNote && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 italic">
                    ⚠️ {booster.seniorNote}
                </p>
            )}
        </div>
    );
}

export default LifeStageDashboard;
