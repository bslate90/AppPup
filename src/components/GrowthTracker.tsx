import { useState } from 'react';
import {
    TrendingUp,
    Scale,
    Plus,
    Trash2,
    Activity,
    Heart,
    Clock,
    AlertTriangle
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
import type { WeightEntry, VitalsEntry, GumColor } from '../types';
import { getTargetWeight } from '../utils/vetFormulas';

interface GrowthTrackerProps {
    birthDate: string | null;
    weightLog: WeightEntry[];
    vitalsLog: VitalsEntry[];
    onAddWeight: (entry: Omit<WeightEntry, 'id'>) => void;
    onDeleteWeight: (id: string) => void;
    onAddVitals: (entry: Omit<VitalsEntry, 'id'>) => void;
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
    weightLog,
    vitalsLog,
    onAddWeight,
    onDeleteWeight,
    onAddVitals,
}: GrowthTrackerProps) {
    const [showWeightForm, setShowWeightForm] = useState(false);
    const [showVitalsForm, setShowVitalsForm] = useState(false);
    const [weightInput, setWeightInput] = useState({ date: format(new Date(), 'yyyy-MM-dd'), grams: '' });
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
        const target = getTargetWeight(weeks);

        return {
            week: weeks,
            date: format(entryDate, 'MMM d'),
            weight: entry.weightGrams,
            minTarget: target?.min || 0,
            idealTarget: target?.ideal || 0,
            maxTarget: target?.max || 0,
        };
    }).sort((a, b) => a.week - b.week);

    // Waltham reference data is incorporated into chartData via getTargetWeight

    const handleAddWeight = () => {
        if (weightInput.grams) {
            onAddWeight({
                date: new Date(weightInput.date).toISOString(),
                weightGrams: parseInt(weightInput.grams),
            });
            setWeightInput({ date: format(new Date(), 'yyyy-MM-dd'), grams: '' });
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
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="card">
                <div className="gradient-header">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Growth Tracker
                    </h2>
                    <p className="text-sm text-white/80">Waltham & WSAVA Standards</p>
                </div>

                {/* Current Weight Display */}
                {latestWeight && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white text-center mb-4">
                        <Scale className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-2xl font-bold">
                            {latestWeight.weightGrams >= 1000
                                ? `${(latestWeight.weightGrams / 1000).toFixed(2)} kg`
                                : `${latestWeight.weightGrams} g`
                            }
                        </div>
                        <div className="text-sm opacity-80">
                            Last recorded {format(new Date(latestWeight.date), 'MMM d')}
                        </div>
                    </div>
                )}

                {/* Add Weight Button */}
                {!showWeightForm ? (
                    <button
                        className="btn btn-primary w-full"
                        onClick={() => setShowWeightForm(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Log Weight
                    </button>
                ) : (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
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
                                <label className="input-label">Weight (grams)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="e.g., 500"
                                    value={weightInput.grams}
                                    onChange={(e) => setWeightInput({ ...weightInput, grams: e.target.value })}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="btn btn-outline flex-1"
                                onClick={() => setShowWeightForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success flex-1"
                                onClick={handleAddWeight}
                                disabled={!weightInput.grams}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Weight Chart */}
            {weightLog.length > 0 && (
                <div className="card">
                    <h3 className="card-header">
                        <Activity className="w-5 h-5 text-cyan-500" />
                        Growth Chart
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                        Shaded area shows Waltham Toy Breed target zone
                    </p>

                    <div className="chart-container">
                        <ResponsiveContainer>
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="week"
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Age (weeks)', position: 'bottom', offset: -5, fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value, name) => {
                                        if (value === undefined) return ['-', name];
                                        if (name === 'weight') return [`${value}g`, 'Actual Weight'];
                                        if (name === 'idealTarget') return [`${value}g`, 'Target'];
                                        return [value, name];
                                    }}
                                />
                                <Legend />

                                {/* Target Zone */}
                                <Area
                                    type="monotone"
                                    dataKey="maxTarget"
                                    stackId="1"
                                    stroke="none"
                                    fill="#99f6e4"
                                    fillOpacity={0.3}
                                    name="Max Target"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="minTarget"
                                    stackId="2"
                                    stroke="none"
                                    fill="#ffffff"
                                    name="Min Target"
                                />

                                {/* Ideal Line */}
                                <Line
                                    type="monotone"
                                    dataKey="idealTarget"
                                    stroke="#14b8a6"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Ideal"
                                />

                                {/* Actual Weight */}
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                    name="Actual"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Weight History */}
            {weightLog.length > 0 && (
                <div className="card">
                    <h3 className="card-header">
                        <Scale className="w-5 h-5 text-violet-500" />
                        Weight History
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...weightLog]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                    <div>
                                        <span className="font-medium text-sm">{entry.weightGrams}g</span>
                                        <span className="text-slate-500 text-xs ml-2">
                                            ({(entry.weightGrams / 1000).toFixed(2)}kg)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">
                                            {format(new Date(entry.date), 'MMM d, yyyy')}
                                        </span>
                                        <button
                                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            onClick={() => onDeleteWeight(entry.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Vitals Section */}
            <div className="card">
                <h3 className="card-header">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Vitals Log
                </h3>

                {!showVitalsForm ? (
                    <button
                        className="btn btn-secondary w-full"
                        onClick={() => setShowVitalsForm(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Log Vitals Check
                    </button>
                ) : (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-4">
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
                            <label className="input-label mb-2">Fecal Score (Purina 1-7 Scale)</label>
                            <div className="fecal-scale">
                                {[1, 2, 3, 4, 5, 6, 7].map((score) => (
                                    <button
                                        key={score}
                                        className={`fecal-dot ${vitalsInput.fecalScore === score ? 'selected' : ''}`}
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
                            <p className="text-xs text-slate-500 mt-1">
                                {vitalsInput.fecalScore === 4 ? '✓ Ideal consistency' :
                                    vitalsInput.fecalScore && vitalsInput.fecalScore < 4 ? 'Too firm' :
                                        vitalsInput.fecalScore && vitalsInput.fecalScore > 4 ? 'Too soft' :
                                            'Tap to select'}
                            </p>
                        </div>

                        {/* Gum Color */}
                        <div>
                            <label className="input-label mb-2">Gum Color</label>
                            <div className="gum-options">
                                {gumColorOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`gum-option ${option.value} ${vitalsInput.gumColor === option.value ? 'selected' : ''}`}
                                        onClick={() => setVitalsInput({ ...vitalsInput, gumColor: option.value })}
                                        type="button"
                                    >
                                        {option.emoji} {option.label}
                                    </button>
                                ))}
                            </div>
                            {vitalsInput.gumColor === 'blue' && (
                                <div className="alert alert-danger mt-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm">Blue gums indicate oxygen deprivation. Seek emergency care immediately!</span>
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
                            <p className="text-xs text-slate-500 mt-1">
                                Normal: &lt; 2 seconds. Press gum, time until pink returns.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="btn btn-outline flex-1"
                                onClick={() => setShowVitalsForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success flex-1"
                                onClick={handleAddVitals}
                            >
                                Save Vitals
                            </button>
                        </div>
                    </div>
                )}

                {/* Vitals History */}
                {vitalsLog.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {vitalsLog.slice(0, 5).map((entry) => (
                            <div key={entry.id} className="p-3 bg-slate-50 rounded-lg text-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {entry.fecalScore && (
                                        <span
                                            className="px-2 py-1 rounded-full text-white"
                                            style={{ backgroundColor: fecalScoreColors[entry.fecalScore - 1] }}
                                        >
                                            Fecal: {entry.fecalScore}
                                        </span>
                                    )}
                                    {entry.gumColor && (
                                        <span className={`gum-option ${entry.gumColor} px-2 py-1`}>
                                            Gums: {entry.gumColor}
                                        </span>
                                    )}
                                    {entry.crtSeconds && (
                                        <span className="px-2 py-1 rounded-full bg-slate-200">
                                            CRT: {entry.crtSeconds}s
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GrowthTracker;
