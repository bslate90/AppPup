import { useState } from 'react';
import { Clock, Utensils, Check, Trash2, Plus } from 'lucide-react';
import type { FeedingEntry, WeightUnit } from '../types';
import { WeightConverter } from '../types';

interface FeedTrackerProps {
    todayFeedings: FeedingEntry[];
    recommendedMealsPerDay: number;
    gramsPerMeal: number;
    weightUnit: WeightUnit;
    onLogFeeding: (entry: Omit<FeedingEntry, 'id'>) => void;
    onDeleteFeeding: (id: string) => void;
    onUnitChange: (unit: WeightUnit) => void;
}

export function FeedTracker({
    todayFeedings,
    recommendedMealsPerDay,
    gramsPerMeal,
    weightUnit,
    onLogFeeding,
    onDeleteFeeding,
    onUnitChange,
}: FeedTrackerProps) {
    const [showDetails, setShowDetails] = useState(false);

    const handleQuickLog = () => {
        onLogFeeding({
            fedAt: new Date().toISOString(),
            amountGrams: gramsPerMeal,
            mealType: 'regular',
        });
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatAmount = (grams?: number) => {
        if (!grams) return '';
        return WeightConverter.format(grams, weightUnit);
    };

    const mealsComplete = todayFeedings.filter(f => f.mealType === 'regular').length;
    const progress = Math.min((mealsComplete / recommendedMealsPerDay) * 100, 100);

    return (
        <div className="card mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Utensils className="w-5 h-5" />
                        Feed Tracker
                    </h3>
                    {/* Unit Toggle */}
                    <div className="flex gap-1 bg-white/20 rounded-lg p-1">
                        {(['g', 'oz', 'lbs'] as WeightUnit[]).map(unit => (
                            <button
                                key={unit}
                                onClick={() => onUnitChange(unit)}
                                className={`px-2 py-1 text-xs rounded ${weightUnit === unit
                                        ? 'bg-white text-emerald-600 font-bold'
                                        : 'text-white/80 hover:bg-white/20'
                                    }`}
                            >
                                {unit}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                        <span>{mealsComplete} of {recommendedMealsPerDay} meals today</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Log Button */}
            <div className="p-4">
                <button
                    onClick={handleQuickLog}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl active:scale-98"
                >
                    <Plus className="w-6 h-6" />
                    Log Feeding ({formatAmount(gramsPerMeal)})
                </button>

                {/* Today's Feedings */}
                {todayFeedings.length > 0 && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                            <Clock className="w-4 h-4" />
                            {showDetails ? 'Hide' : 'Show'} today's feedings ({todayFeedings.length})
                        </button>

                        {showDetails && (
                            <div className="mt-2 space-y-2">
                                {todayFeedings.map(feeding => (
                                    <div
                                        key={feeding.id}
                                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-medium">
                                                {formatTime(feeding.fedAt)}
                                            </span>
                                            {feeding.amountGrams && (
                                                <span className="text-xs text-slate-500">
                                                    {formatAmount(feeding.amountGrams)}
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded ${feeding.mealType === 'regular'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : feeding.mealType === 'snack'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {feeding.mealType}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onDeleteFeeding(feeding.id)}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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

export default FeedTracker;
