import { useState } from 'react';
import {
    TrendingUp,
    Scale,
    Plus,
    Trash2,
    Activity,
    Heart,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Calculator
} from 'lucide-react';
import { format, differenceInWeeks } from 'date-fns';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Legend
} from 'recharts';
import type { WeightEntry, VitalsEntry, GumColor, WeightUnit } from '../types';
import { WeightConverter } from '../types';
import { getBreedTargetWeight, getBreedSizeInfo } from '../utils/breedData';

interface GrowthTrackerProps {
    birthDate: string | null;
    breed: string;
    weightLog: WeightEntry[];
    vitalsLog: VitalsEntry[];
    weightUnit: WeightUnit;
    onAddWeight: (entry: Omit<WeightEntry, 'id'>) => void;
    onDeleteWeight: (id: string) => void;
    onAddVitals: (entry: Omit<VitalsEntry, 'id'>) => void;
    onUnitChange: (unit: WeightUnit) => void;
}

const fecalScoreColors = [
    '#7c2d12', // 1 - Very hard
    '#b45309', // 2 - Hard
    '#ca8a04', // 3 - Firm
    '#65a30d', // 4 - Ideal
    '#16a34a', // 5 - Soft but formed
    '#0891b2', // 6 - Soft
    '#7c3aed', // 7 - Liquid
];

const gumColorOptions: { value: GumColor; label: string; emoji: string }[] = [
    { value: 'pink', label: 'Pink (Normal)', emoji: '💗' },
    { value: 'pale', label: 'Pale (Concern)', emoji: '⚪' },
    { value: 'blue', label: 'Blue (Emergency)', emoji: '🔵' },
    { value: 'red', label: 'Bright Red', emoji: '🔴' },
    { value: 'yellow', label: 'Yellow', emoji: '🟡' },
];

export function GrowthTracker({
    birthDate,
    breed,
    weightLog,
    vitalsLog,
    weightUnit,
    onAddWeight,
    onDeleteWeight,
    onAddVitals,
    onUnitChange,
}: GrowthTrackerProps) {
    const breedSizeInfo = getBreedSizeInfo(breed);
    const [showWeightForm, setShowWeightForm] = useState(false);
    const [showVitalsForm, setShowVitalsForm] = useState(false);
    const [showVitalsHistory, setShowVitalsHistory] = useState(false);
    const [showWeightCalc, setShowWeightCalc] = useState(false);
    const [weightInput, setWeightInput] = useState({ date: format(new Date(), 'yyyy-MM-dd'), value: '' });
    const [vitalsInput, setVitalsInput] = useState<{
        date: string;
        fecalScore: number | null;
        gumColor: GumColor | null;
        crt: string;
    }>({
        date: format(new Date(), 'yyyy-MM-dd'),
        fecalScore: null,
        gumColor: null,
        crt: '',
    });

    // Prepare chart data
    const chartData = weightLog.map((entry) => {
        const entryDate = new Date(entry.date);
        const weeks = birthDate ? differenceInWeeks(entryDate, new Date(birthDate)) : 0;
        const target = getBreedTargetWeight(breed, weeks);

        return {
            week: weeks,
            date: format(entryDate, 'MMM d'),
            weight: entry.weightGrams,
            minTarget: target?.min || 0,
            idealTarget: target?.ideal || 0,
            maxTarget: target?.max || 0,
        };
    }).sort((a, b) => a.week - b.week);

    const handleAddWeight = () => {
        if (weightInput.value) {
            const grams = WeightConverter.toGrams(parseFloat(weightInput.value), weightUnit);
            onAddWeight({
                date: new Date(weightInput.date).toISOString(),
                weightGrams: grams,
            });
            setWeightInput({ date: format(new Date(), 'yyyy-MM-dd'), value: '' });
            setShowWeightForm(false);
        }
    };

    const handleAddVitals = () => {
        onAddVitals({
            date: new Date(vitalsInput.date).toISOString(),
            fecalScore: vitalsInput.fecalScore || undefined,
            gumColor: vitalsInput.gumColor || undefined,
            crtSeconds: vitalsInput.crt ? parseFloat(vitalsInput.crt) : undefined,
        });
        setVitalsInput({
            date: format(new Date(), 'yyyy-MM-dd'),
            fecalScore: null,
            gumColor: null,
            crt: '',
        });
        setShowVitalsForm(false);
    };

    const latestWeight = weightLog.length > 0
        ? [...weightLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Header */}
            <div className="card p-6">
                <div className="gradient-header flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <TrendingUp className="w-6 h-6" />
                            Growth Tracker
                        </h2>
                        <p className="text-sm text-white/90 mt-1">Waltham & WSAVA Standards</p>
                    </div>

                    {/* Unit Toggle */}
                    <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm">
                        {(['g', 'oz', 'lbs'] as WeightUnit[]).map((unit) => (
                            <button
                                key={unit}
                                onClick={() => onUnitChange(unit)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${weightUnit === unit
                                    ? 'bg-white text-cyan-600 shadow-sm'
                                    : 'text-white hover:bg-white/10'
                                    }`}
                            >
                                {unit}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Current Weight Display */}
                {latestWeight && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white text-center mb-6 shadow-lg">
                        <Scale className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-3xl font-bold">
                            {WeightConverter.format(latestWeight.weightGrams, weightUnit)}
                        </div>
                        <div className="text-sm opacity-80 mt-1">
                            Last recorded {format(new Date(latestWeight.date), 'MMM d')}
                        </div>
                    </div>
                )}

                {/* Add Weight Button */}
                {!showWeightForm ? (
                    <button
                        className="btn btn-primary w-full py-4 text-base font-bold shadow-md"
                        onClick={() => setShowWeightForm(true)}
                    >
                        <Plus className="w-5 h-5" />
                        Log Weight
                    </button>
                ) : (
                    <div className="bg-[var(--bg-muted)]/50 border border-[var(--border-color)] rounded-2xl p-5 space-y-4 animate-slide-down">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="input-group mb-0">
                                <label className="input-label">Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={weightInput.date}
                                    onChange={(e) => setWeightInput({ ...weightInput, date: e.target.value })}
                                />
                            </div>
                            <div className="input-group mb-0">
                                <label className="input-label">Weight ({WeightConverter.labels[weightUnit]})</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder={`e.g., ${weightUnit === 'g' ? '500' : weightUnit === 'oz' ? '16' : '1.1'}`}
                                    value={weightInput.value}
                                    onChange={(e) => setWeightInput({ ...weightInput, value: e.target.value })}
                                    autoFocus
                                    step="any"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="btn btn-outline flex-1 py-3"
                                onClick={() => setShowWeightForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success flex-1 py-3"
                                onClick={handleAddWeight}
                                disabled={!weightInput.value}
                            >
                                Save Weight
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Weight Chart */}
            {weightLog.length > 0 && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-500" />
                        Growth Chart
                        <span className="ml-auto text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full font-medium">
                            {breedSizeInfo.label}
                        </span>
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">
                        Shaded area shows WALTHAM {breedSizeInfo.label} target zone • Expected adult: {WeightConverter.format(breedSizeInfo.adultWeightIdeal, weightUnit)}
                    </p>

                    <div className="chart-container">
                        <ResponsiveContainer>
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="week"
                                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                                    label={{ value: 'Age (weeks)', position: 'bottom', offset: -5, fontSize: 11, fill: 'var(--text-muted)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                                    label={{ value: `Weight (${weightUnit})`, angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--text-muted)' }}
                                    tickFormatter={(value) => WeightConverter.fromGrams(value, weightUnit).toString()}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-card)',
                                        color: 'var(--text-primary)',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ fontSize: '12px' }}
                                    formatter={(value, name) => {
                                        if (value === undefined) return ['-', name];
                                        const converted = WeightConverter.fromGrams(Number(value), weightUnit);
                                        const label = `${converted}${weightUnit}`;
                                        if (name === 'weight') return [label, 'Actual Weight'];
                                        if (name === 'idealTarget') return [label, 'Target'];
                                        return [label, name];
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />

                                {/* Target Zone */}
                                <Area
                                    type="monotone"
                                    dataKey="maxTarget"
                                    stackId="1"
                                    stroke="none"
                                    fill="var(--color-primary)"
                                    fillOpacity={0.15}
                                    name="Max Target"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="minTarget"
                                    stackId="2"
                                    stroke="none"
                                    fill="var(--bg-card)"
                                    name="Min Target"
                                />

                                {/* Ideal Line */}
                                <Line
                                    type="monotone"
                                    dataKey="idealTarget"
                                    stroke="var(--color-success)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Ideal"
                                />

                                {/* Actual Weight */}
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="var(--color-secondary)"
                                    strokeWidth={3}
                                    dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Actual"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Expected Adult Weight Calculation Breakdown */}
                    <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                        <button
                            onClick={() => setShowWeightCalc(!showWeightCalc)}
                            className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors w-full"
                        >
                            <Calculator className="w-4 h-4" />
                            Expected Adult Weight Calculation
                            {showWeightCalc ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                        </button>

                        {showWeightCalc && (() => {
                            // Calculate current age in weeks
                            const currentAgeWeeks = birthDate
                                ? differenceInWeeks(new Date(), new Date(birthDate))
                                : 0;

                            // Get the latest weight
                            const currentWeight = latestWeight?.weightGrams || 0;

                            // Get target weight for current age
                            const currentTarget = getBreedTargetWeight(breed, currentAgeWeeks);

                            // Calculate growth ratio (actual vs ideal at current age)
                            const growthRatio = currentTarget && currentTarget.ideal > 0
                                ? currentWeight / currentTarget.ideal
                                : 1;

                            // Project adult weight based on ratio
                            const projectedAdultWeight = Math.round(breedSizeInfo.adultWeightIdeal * growthRatio);

                            // Percentage of maturity reached
                            const maturityPercent = currentTarget && breedSizeInfo.adultWeightIdeal > 0
                                ? Math.round((currentTarget.ideal / breedSizeInfo.adultWeightIdeal) * 100)
                                : 0;

                            // Current vs target percentage
                            const targetPercent = currentTarget && currentTarget.ideal > 0
                                ? Math.round((currentWeight / currentTarget.ideal) * 100)
                                : 100;

                            return (
                                <div className="mt-4 space-y-4 animate-slide-down">
                                    {/* Breed Classification */}
                                    <div className="bg-[var(--bg-muted)]/30 border border-[var(--border-color)] rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                                            1. Breed Classification
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-muted)]">Breed Entered:</span>
                                                <span className="font-medium text-[var(--text-primary)]">{breed || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-muted)]">Size Category:</span>
                                                <span className="font-medium text-cyan-600">{breedSizeInfo.label}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-muted)]">Maturity Timeline:</span>
                                                <span className="font-medium text-[var(--text-primary)]">{breedSizeInfo.maturityWeeks} weeks</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Standard Weights */}
                                    <div className="bg-[var(--bg-muted)]/30 border border-[var(--border-color)] rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                                            2. Category Standard Weights (WALTHAM)
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-muted)]">Min Adult Weight:</span>
                                                <span className="font-medium text-[var(--text-primary)]">{WeightConverter.format(breedSizeInfo.adultWeightMin, weightUnit)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-muted)]">Ideal Adult Weight:</span>
                                                <span className="font-bold text-emerald-600">{WeightConverter.format(breedSizeInfo.adultWeightIdeal, weightUnit)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-muted)]">Max Adult Weight:</span>
                                                <span className="font-medium text-[var(--text-primary)]">{WeightConverter.format(breedSizeInfo.adultWeightMax, weightUnit)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Growth Analysis */}
                                    {currentWeight > 0 && currentTarget && birthDate && (
                                        <div className="bg-[var(--bg-muted)]/30 border border-[var(--border-color)] rounded-xl p-4">
                                            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                                                3. Your Puppy's Growth Analysis
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">Current Age:</span>
                                                    <span className="font-medium text-[var(--text-primary)]">{currentAgeWeeks} weeks</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">Current Weight:</span>
                                                    <span className="font-medium text-[var(--text-primary)]">{WeightConverter.format(currentWeight, weightUnit)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">Target at {currentAgeWeeks} wks:</span>
                                                    <span className="font-medium text-[var(--text-primary)]">{WeightConverter.format(currentTarget.ideal, weightUnit)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">vs Target:</span>
                                                    <span className={`font-bold ${targetPercent >= 90 && targetPercent <= 110 ? 'text-emerald-600' : targetPercent < 90 ? 'text-amber-600' : 'text-blue-600'}`}>
                                                        {targetPercent}% of target
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">Maturity Progress:</span>
                                                    <span className="font-medium text-[var(--text-primary)]">{maturityPercent}% of growth curve</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Projected Adult Weight */}
                                    {currentWeight > 0 && birthDate && (
                                        <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-300 dark:border-violet-700 rounded-xl p-4">
                                            <h4 className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-3">
                                                4. Projected Adult Weight
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[var(--text-muted)]">Formula:</span>
                                                    <span className="font-mono text-xs bg-[var(--bg-muted)] px-2 py-1 rounded">
                                                        Ideal × Growth Ratio
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-muted)]">Calculation:</span>
                                                    <span className="font-mono text-xs">
                                                        {WeightConverter.format(breedSizeInfo.adultWeightIdeal, weightUnit)} × {growthRatio.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-violet-200 dark:border-violet-700">
                                                    <span className="font-bold text-[var(--text-primary)]">Projected Result:</span>
                                                    <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                                                        {WeightConverter.format(projectedAdultWeight, weightUnit)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] mt-3 italic">
                                                * Projection assumes your puppy maintains current growth trajectory relative to the WALTHAM standard curve.
                                            </p>
                                        </div>
                                    )}

                                    {/* Note about WALTHAM data */}
                                    <div className="text-xs text-[var(--text-muted)] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                                        <strong className="text-amber-700 dark:text-amber-400">📊 About this data:</strong> The "Ideal" weights are based on WALTHAM Puppy Growth Charts, which represent typical breed category averages. Individual breeds within a category may vary. For example, a French Bulldog (small breed) will typically be heavier than a Cavalier King Charles Spaniel (also small breed).
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Weight History */}
            {weightLog.length > 0 && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-violet-500" />
                        Weight History
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {[...weightLog]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-4 bg-[var(--bg-muted)]/30 border border-[var(--border-color)] rounded-2xl transition-colors hover:bg-[var(--bg-muted)]/50">
                                    <div>
                                        <span className="font-bold text-base text-[var(--text-primary)]">
                                            {WeightConverter.format(entry.weightGrams, weightUnit)}
                                        </span>
                                        {weightUnit !== 'g' && (
                                            <span className="text-[var(--text-muted)] text-xs ml-2 font-medium">
                                                ({entry.weightGrams}g)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-[var(--text-muted)] font-medium">
                                            {format(new Date(entry.date), 'MMM d, yyyy')}
                                        </span>
                                        <button
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                            onClick={() => onDeleteWeight(entry.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Vitals Section */}
            <div className="card p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Vitals Log
                </h3>

                {!showVitalsForm ? (
                    <button
                        className="btn btn-secondary w-full py-4 text-base font-bold shadow-md"
                        onClick={() => setShowVitalsForm(true)}
                    >
                        <Plus className="w-5 h-5" />
                        Log Vitals Check
                    </button>
                ) : (
                    <div className="bg-[var(--bg-muted)]/50 border border-[var(--border-color)] rounded-2xl p-5 space-y-5 animate-slide-down">
                        {/* Date */}
                        <div className="input-group mb-0">
                            <label className="input-label">Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={vitalsInput.date}
                                onChange={(e) => setVitalsInput({ ...vitalsInput, date: e.target.value })}
                            />
                        </div>

                        {/* Fecal Score */}
                        <div>
                            <label className="input-label mb-3">Fecal Score (Purina 1-7 Scale)</label>
                            <div className="fecal-scale justify-between">
                                {[1, 2, 3, 4, 5, 6, 7].map((score) => (
                                    <button
                                        key={score}
                                        className={`fecal-dot w-9 h-9 text-sm ${vitalsInput.fecalScore === score ? 'selected ring-2 ring-offset-2 ring-cyan-500' : ''}`}
                                        style={{
                                            backgroundColor: fecalScoreColors[score - 1],
                                            color: 'white'
                                        }}
                                        onClick={() => setVitalsInput({ ...vitalsInput, fecalScore: score })}
                                        type="button"
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">
                                {vitalsInput.fecalScore === 4 ? '✓ Ideal consistency' :
                                    vitalsInput.fecalScore && vitalsInput.fecalScore < 4 ? 'Too firm' :
                                        vitalsInput.fecalScore && vitalsInput.fecalScore > 4 ? 'Too soft' :
                                            'Tap to select'}
                            </p>
                        </div>

                        {/* Gum Color */}
                        <div>
                            <label className="input-label mb-3">Gum Color</label>
                            <div className="gum-options gap-2">
                                {gumColorOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`gum-option ${option.value} py-2 px-3 text-xs font-bold ${vitalsInput.gumColor === option.value ? 'selected ring-2 ring-offset-2 ring-cyan-500' : ''}`}
                                        onClick={() => setVitalsInput({ ...vitalsInput, gumColor: option.value })}
                                        type="button"
                                    >
                                        {option.emoji} {option.label}
                                    </button>
                                ))}
                            </div>
                            {vitalsInput.gumColor === 'blue' && (
                                <div className="alert alert-danger mt-3">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm font-bold">Blue gums indicate oxygen deprivation. Seek emergency care immediately!</span>
                                </div>
                            )}
                        </div>

                        {/* CRT */}
                        <div className="input-group mb-0">
                            <label className="input-label flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                CRT (Capillary Refill Time)
                            </label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="e.g., 1.5"
                                    step="0.5"
                                    value={vitalsInput.crt}
                                    onChange={(e) => setVitalsInput({ ...vitalsInput, crt: e.target.value })}
                                />
                                <span className="input-unit">sec</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">
                                Normal: &lt; 2 seconds. Press gum, time until pink returns.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                className="btn btn-outline flex-1 py-3"
                                onClick={() => setShowVitalsForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success flex-1 py-3 font-bold"
                                onClick={handleAddVitals}
                            >
                                Save Vitals
                            </button>
                        </div>
                    </div>
                )}

                {/* Vitals History Toggle */}
                {vitalsLog.length > 0 && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowVitalsHistory(!showVitalsHistory)}
                            className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                        >
                            <Clock className="w-4 h-4" />
                            {showVitalsHistory ? 'Hide' : 'Show'} Vitals History ({vitalsLog.length})
                            {showVitalsHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showVitalsHistory && (
                            <div className="mt-4 space-y-3 animate-slide-down">
                                {vitalsLog.map((entry) => (
                                    <div key={entry.id} className="p-4 bg-[var(--bg-muted)]/30 border border-[var(--border-color)] rounded-2xl transition-colors hover:bg-[var(--bg-muted)]/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-[var(--text-primary)]">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {entry.fecalScore && (
                                                <span
                                                    className="px-3 py-1.5 rounded-xl text-white text-[10px] font-bold shadow-sm"
                                                    style={{ backgroundColor: fecalScoreColors[entry.fecalScore - 1] }}
                                                >
                                                    Fecal: {entry.fecalScore}
                                                </span>
                                            )}
                                            {entry.gumColor && (
                                                <span className={`gum-option ${entry.gumColor} px-3 py-1.5 text-[10px] font-bold shadow-sm`}>
                                                    Gums: {entry.gumColor}
                                                </span>
                                            )}
                                            {entry.crtSeconds && (
                                                <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-bold shadow-sm">
                                                    CRT: {entry.crtSeconds}s
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GrowthTracker;
