import { useState, useMemo } from 'react';
import { Clock, Utensils, Check, Trash2, Plus, Cookie, ChevronDown } from 'lucide-react';
import type { FeedingEntry, WeightUnit, FoodAnalysis } from '../types';
import { WeightConverter } from '../types';

interface FeedTrackerProps {
    todayFeedings: FeedingEntry[];
    recommendedMealsPerDay: number;
    gramsPerMeal: number;
    weightUnit: WeightUnit;
    foodBrands: FoodAnalysis[];
    onLogFeeding: (entry: Omit<FeedingEntry, 'id'>) => void;
    onDeleteFeeding: (id: string) => void;
    onUnitChange: (unit: WeightUnit) => void;
}

export function FeedTracker({
    todayFeedings,
    recommendedMealsPerDay,
    gramsPerMeal,
    weightUnit,
    foodBrands,
    onLogFeeding,
    onDeleteFeeding,
    onUnitChange,
}: FeedTrackerProps) {
    const [showDetails, setShowDetails] = useState(false);

    // Separate food and treat brands
    const foodItems = useMemo(() => foodBrands.filter(b => b.type === 'food'), [foodBrands]);
    const treatItems = useMemo(() => foodBrands.filter(b => b.type === 'treat'), [foodBrands]);

    const [selectedFoodId, setSelectedFoodId] = useState<string>(
        foodItems.find(b => b.isDefault)?.id || foodItems[0]?.id || ''
    );
    const [selectedTreatId, setSelectedTreatId] = useState<string>(
        treatItems.find(b => b.isDefault)?.id || treatItems[0]?.id || ''
    );

    const [showFoodSelector, setShowFoodSelector] = useState(false);
    const [showTreatSelector, setShowTreatSelector] = useState(false);

    const handleLogMeal = () => {
        onLogFeeding({
            fedAt: new Date().toISOString(),
            amountGrams: gramsPerMeal,
            mealType: 'regular',
            foodBrandId: selectedFoodId || undefined,
        });
    };

    const handleLogTreat = () => {
        onLogFeeding({
            fedAt: new Date().toISOString(),
            mealType: 'treat',
            foodBrandId: selectedTreatId || undefined,
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

    const getBrandName = (id?: string) => {
        if (!id) return null;
        return foodBrands.find(b => b.id === id)?.brandName;
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
                            // Dynamic width value requires inline style
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Meal Logging Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Regular Meal</span>
                        {foodItems.length > 1 && (
                            <button
                                onClick={() => {
                                    setShowFoodSelector(!showFoodSelector);
                                    setShowTreatSelector(false);
                                }}
                                className="text-xs text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700"
                            >
                                Change Brand <ChevronDown className={`w-3 h-3 transition-transform ${showFoodSelector ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>

                    {showFoodSelector && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden animate-slide-down">
                            {foodItems.map(brand => (
                                <button
                                    key={brand.id}
                                    onClick={() => {
                                        setSelectedFoodId(brand.id);
                                        setShowFoodSelector(false);
                                    }}
                                    className={`w-full text-left p-3 text-sm hover:bg-emerald-50 transition-colors flex items-center justify-between ${selectedFoodId === brand.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
                                >
                                    {brand.brandName}
                                    {selectedFoodId === brand.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleLogMeal}
                        disabled={foodItems.length === 0}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-6 h-6" />
                        Log Meal ({formatAmount(gramsPerMeal)})
                        {foodItems.length > 0 && (
                            <span className="text-xs font-normal opacity-80 block ml-2">
                                — {getBrandName(selectedFoodId)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Treat Logging Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Treats & Snacks</span>
                        {treatItems.length > 1 && (
                            <button
                                onClick={() => {
                                    setShowTreatSelector(!showTreatSelector);
                                    setShowFoodSelector(false);
                                }}
                                className="text-xs text-amber-600 font-medium flex items-center gap-1 hover:text-amber-700"
                            >
                                Change Brand <ChevronDown className={`w-3 h-3 transition-transform ${showTreatSelector ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>

                    {showTreatSelector && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden animate-slide-down">
                            {treatItems.map(brand => (
                                <button
                                    key={brand.id}
                                    onClick={() => {
                                        setSelectedTreatId(brand.id);
                                        setShowTreatSelector(false);
                                    }}
                                    className={`w-full text-left p-3 text-sm hover:bg-amber-50 transition-colors flex items-center justify-between ${selectedTreatId === brand.id ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600'}`}
                                >
                                    {brand.brandName}
                                    {selectedTreatId === brand.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleLogTreat}
                        className="w-full py-3 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200 transition-all flex items-center justify-center gap-2 font-bold active:scale-98"
                    >
                        <Cookie className="w-5 h-5" />
                        Log Treat
                        {treatItems.length > 0 && (
                            <span className="text-xs font-normal opacity-80 ml-1">
                                — {getBrandName(selectedTreatId)}
                            </span>
                        )}
                    </button>
                </div>

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
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {formatTime(feeding.fedAt)}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${feeding.mealType === 'regular'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : feeding.mealType === 'snack'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-amber-500 text-white'
                                                        }`}>
                                                        {feeding.mealType}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                                                    {feeding.amountGrams && (
                                                        <span>{formatAmount(feeding.amountGrams)}</span>
                                                    )}
                                                    {feeding.amountGrams && feeding.foodBrandId && <span>•</span>}
                                                    {feeding.foodBrandId && (
                                                        <span className="truncate">{getBrandName(feeding.foodBrandId)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDeleteFeeding(feeding.id)}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            title="Delete feeding entry"
                                            aria-label="Delete feeding entry"
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
