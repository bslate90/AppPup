import { useState, useEffect } from 'react';
import {
    Apple,
    Calculator,
    AlertTriangle,
    Info,
    Utensils,
    Flame
} from 'lucide-react';
import type { FoodAnalysis, NutritionResult, FeedingEntry, WeightUnit } from '../types';
import { calculateNutrition } from '../utils/vetFormulas';
import FeedTracker from './FeedTracker';

interface NutritionEngineProps {
    currentWeight: number | null; // in grams
    ageInWeeks: number | null;
    foodSettings: FoodAnalysis | null;
    weightUnit: WeightUnit;
    todayFeedings: FeedingEntry[];
    onUpdateFood: (food: FoodAnalysis) => void;
    onLogFeeding: (entry: Omit<FeedingEntry, 'id'>) => void;
    onDeleteFeeding: (id: string) => void;
    onUnitChange: (unit: WeightUnit) => void;
}

const DEFAULT_FOOD: FoodAnalysis = {
    brandName: '',
    protein: 28,
    fat: 15,
    fiber: 4,
    moisture: 10,
    ash: 7,
};

export function NutritionEngine({
    currentWeight,
    ageInWeeks,
    foodSettings,
    weightUnit,
    todayFeedings,
    onUpdateFood,
    onLogFeeding,
    onDeleteFeeding,
    onUnitChange,
}: NutritionEngineProps) {
    const [food, setFood] = useState<FoodAnalysis>(foodSettings || DEFAULT_FOOD);
    const [result, setResult] = useState<NutritionResult | null>(null);

    // Calculate nutrition when inputs change
    useEffect(() => {
        if (currentWeight && ageInWeeks !== null && currentWeight > 0) {
            const weightKg = currentWeight / 1000;
            const calculated = calculateNutrition(food, weightKg, ageInWeeks);
            setResult(calculated);
        } else {
            setResult(null);
        }
    }, [food, currentWeight, ageInWeeks]);

    const handleInputChange = (field: keyof FoodAnalysis, value: string) => {
        const numValue = parseFloat(value) || 0;
        const updated = { ...food, [field]: field === 'brandName' ? value : numValue };
        setFood(updated);
        onUpdateFood(updated);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Feed Tracker - Only show if we have nutrition results */}
            {result && (
                <FeedTracker
                    todayFeedings={todayFeedings}
                    recommendedMealsPerDay={result.mealsPerDay}
                    gramsPerMeal={result.gramsPerMeal}
                    weightUnit={weightUnit}
                    onLogFeeding={onLogFeeding}
                    onDeleteFeeding={onDeleteFeeding}
                    onUnitChange={onUnitChange}
                />
            )}

            {/* Header */}
            <div className="card">
                <div className="gradient-header">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Apple className="w-5 h-5" />
                        Nutrition Engine
                    </h2>
                    <p className="text-sm text-white/80">WSAVA & NRC Standards</p>
                </div>

                {/* Weight Warning */}
                {!currentWeight && (
                    <div className="alert alert-info">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">
                            Add your puppy's weight in the Growth tab to calculate daily food requirements.
                        </p>
                    </div>
                )}

                {/* Food Brand */}
                <div className="input-group">
                    <label className="input-label">Food Brand Name</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g., Royal Canin Puppy"
                        value={food.brandName}
                        onChange={(e) => handleInputChange('brandName', e.target.value)}
                    />
                </div>
            </div>

            {/* Guaranteed Analysis Form */}
            <div className="card">
                <h3 className="card-header">
                    <Calculator className="w-5 h-5 text-cyan-500" />
                    Guaranteed Analysis
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    Enter values from your food bag label
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="input-group">
                        <label className="input-label">Protein</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input-field"
                                value={food.protein}
                                onChange={(e) => handleInputChange('protein', e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className="input-unit">%</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Fat</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input-field"
                                value={food.fat}
                                onChange={(e) => handleInputChange('fat', e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className="input-unit">%</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Fiber</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input-field"
                                value={food.fiber}
                                onChange={(e) => handleInputChange('fiber', e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className="input-unit">%</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Moisture</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input-field"
                                value={food.moisture}
                                onChange={(e) => handleInputChange('moisture', e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className="input-unit">%</span>
                        </div>
                    </div>

                    <div className="input-group col-span-2">
                        <label className="input-label">
                            Ash <span className="text-slate-400">(default 7% if not listed)</span>
                        </label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input-field"
                                value={food.ash}
                                onChange={(e) => handleInputChange('ash', e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className="input-unit">%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculation Results */}
            {result && (
                <div className="card">
                    <h3 className="card-header">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Daily Requirements
                    </h3>

                    {/* Warnings */}
                    {result.warnings.map((warning, idx) => (
                        <div key={idx} className="alert alert-warning mb-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{warning}</p>
                        </div>
                    ))}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="stat-card" style={{ '--stat-bg-start': '#f59e0b', '--stat-bg-end': '#d97706' } as React.CSSProperties}>
                            <div className="stat-value">{result.kcalPerKg}</div>
                            <div className="stat-label">kcal/kg Food</div>
                        </div>
                        <div className="stat-card" style={{ '--stat-bg-start': '#10b981', '--stat-bg-end': '#059669' } as React.CSSProperties}>
                            <div className="stat-value">{result.der}</div>
                            <div className="stat-label">kcal/day Needed</div>
                        </div>
                    </div>

                    {/* Main Result */}
                    <div className="bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl p-4 text-white text-center mb-4">
                        <Utensils className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{result.dailyGrams}g</div>
                        <div className="text-sm opacity-90">Total Food Per Day</div>
                    </div>

                    {/* Meal Breakdown */}
                    <div className="bg-slate-100 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-800">
                                    {result.mealsPerDay} meals per day
                                </p>
                                <p className="text-sm text-slate-600">
                                    {result.gramsPerMeal}g per meal
                                </p>
                            </div>
                            <div className="text-3xl">🍽️</div>
                        </div>
                    </div>

                    {/* Energy Breakdown */}
                    <div className="mt-4 text-sm text-slate-600 space-y-1">
                        <div className="flex justify-between">
                            <span>Resting Energy (RER):</span>
                            <span className="font-medium">{result.rer} kcal</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Daily Energy (DER):</span>
                            <span className="font-medium">{result.der} kcal</span>
                        </div>
                        <div className="flex justify-between">
                            <span>NFE (Carbs):</span>
                            <span className="font-medium">{result.nfe}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NutritionEngine;
