import { useState, useEffect, useMemo } from 'react';
import {
    AlertTriangle,
    Utensils,
    Flame,
    Plus,
    Trash2,
    Star,
    ChevronDown,
    ChevronUp,
    Edit2,
    Cookie
} from 'lucide-react';
import type { FoodAnalysis, NutritionResult, FeedingEntry, WeightUnit } from '../types';
import { calculateNutrition } from '../utils/vetFormulas';
import FeedTracker from './FeedTracker';

interface NutritionEngineProps {
    currentWeight: number | null; // in grams
    ageInWeeks: number | null;
    foodBrands: FoodAnalysis[];
    weightUnit: WeightUnit;
    todayFeedings: FeedingEntry[];
    onAddFood: (food: Omit<FoodAnalysis, 'id'>) => void;
    onUpdateFood: (id: string, food: Partial<FoodAnalysis>) => void;
    onDeleteFood: (id: string) => void;
    onSetDefaultFood: (id: string) => void;
    onLogFeeding: (entry: Omit<FeedingEntry, 'id'>) => void;
    onDeleteFeeding: (id: string) => void;
    onUnitChange: (unit: WeightUnit) => void;
}

const DEFAULT_FOOD_TEMPLATE: Omit<FoodAnalysis, 'id'> = {
    brandName: '',
    protein: 28,
    fat: 15,
    fiber: 4,
    moisture: 10,
    ash: 7,
    type: 'food'
};

export function NutritionEngine({
    currentWeight,
    ageInWeeks,
    foodBrands,
    weightUnit,
    todayFeedings,
    onAddFood,
    onUpdateFood,
    onDeleteFood,
    onSetDefaultFood,
    onLogFeeding,
    onDeleteFeeding,
    onUnitChange,
}: NutritionEngineProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<FoodAnalysis, 'id'>>(DEFAULT_FOOD_TEMPLATE);
    const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);

    // Filter brands by type
    const foodItems = useMemo(() => foodBrands.filter(b => b.type === 'food'), [foodBrands]);
    const treatItems = useMemo(() => foodBrands.filter(b => b.type === 'treat'), [foodBrands]);

    // Get default food brand
    const activeFoodBrand = useMemo(() => {
        return foodItems.find(b => b.isDefault) || foodItems[0] || null;
    }, [foodItems]);

    const [result, setResult] = useState<NutritionResult | null>(null);

    // Calculate nutrition for active food brand
    useEffect(() => {
        if (activeFoodBrand && currentWeight && ageInWeeks !== null && currentWeight > 0) {
            const weightKg = currentWeight / 1000;
            const calculated = calculateNutrition(activeFoodBrand, weightKg, ageInWeeks);
            setResult(calculated);
        } else {
            setResult(null);
        }
    }, [activeFoodBrand, currentWeight, ageInWeeks]);

    const handleFormChange = (field: keyof Omit<FoodAnalysis, 'id'>, value: string) => {
        if (field === 'brandName' || field === 'type') {
            setFormData(prev => ({ ...prev, [field]: value as any }));
        } else {
            const numValue = parseFloat(value) || 0;
            setFormData(prev => ({ ...prev, [field]: numValue }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdateFood(editingId, formData);
            setEditingId(null);
        } else {
            onAddFood(formData);
        }
        setFormData(DEFAULT_FOOD_TEMPLATE);
        setShowAddForm(false);
    };

    const startEdit = (brand: FoodAnalysis) => {
        const { id, isDefault, ...data } = brand;
        setFormData(data);
        setEditingId(id);
        setShowAddForm(true);
    };

    const renderBrandList = (items: FoodAnalysis[], title: string, icon: React.ReactNode) => (
        <div className="card">
            <div className="gradient-header flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    {icon}
                    {title}
                </h2>
                {title === 'Food Brands' && (
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setEditingId(null);
                            setFormData({ ...DEFAULT_FOOD_TEMPLATE, type: 'food' });
                        }}
                        className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Add new food brand"
                        aria-label="Add new food brand"
                    >
                        <Plus className={`w-5 h-5 transition-transform ${showAddForm && formData.type === 'food' ? 'rotate-45' : ''}`} />
                    </button>
                )}
                {title === 'Treat Brands' && (
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setEditingId(null);
                            setFormData({ ...DEFAULT_FOOD_TEMPLATE, type: 'treat' });
                        }}
                        className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Add new treat brand"
                        aria-label="Add new treat brand"
                    >
                        <Plus className={`w-5 h-5 transition-transform ${showAddForm && formData.type === 'treat' ? 'rotate-45' : ''}`} />
                    </button>
                )}
            </div>

            <div className="divide-y divide-slate-100">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <div className="opacity-20 mb-2 flex justify-center">{icon}</div>
                        <p>No {title.toLowerCase()} added yet.</p>
                    </div>
                ) : (
                    items.map(brand => (
                        <div key={brand.id} className={`p-3 transition-colors ${brand.isDefault ? 'bg-cyan-50/30' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setExpandedBrandId(expandedBrandId === brand.id ? null : brand.id)}>
                                    <div className={`p-2 rounded-lg ${brand.isDefault ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {brand.type === 'food' ? <Utensils className="w-4 h-4" /> : <Cookie className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            {brand.brandName}
                                            {brand.isDefault && <Star className="w-3 h-3 fill-current text-amber-500" />}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            {brand.protein}% Protein • {brand.fat}% Fat
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {!brand.isDefault && (
                                        <button
                                            onClick={() => onSetDefaultFood(brand.id)}
                                            className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                                            title="Set as active"
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => startEdit(brand)}
                                        className="p-2 text-slate-400 hover:text-cyan-500 transition-colors"
                                        title="Edit brand"
                                        aria-label="Edit brand"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteFood(brand.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Delete brand"
                                        aria-label="Delete brand"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setExpandedBrandId(expandedBrandId === brand.id ? null : brand.id)}
                                        className="p-2 text-slate-400"
                                    >
                                        {expandedBrandId === brand.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {expandedBrandId === brand.id && (
                                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Fiber:</span>
                                            <span className="font-medium">{brand.fiber}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Moisture:</span>
                                            <span className="font-medium">{brand.moisture}%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Ash:</span>
                                            <span className="font-medium">{brand.ash}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Feed Tracker */}
            <FeedTracker
                todayFeedings={todayFeedings}
                recommendedMealsPerDay={result?.mealsPerDay || 4}
                gramsPerMeal={result?.gramsPerMeal || 0}
                weightUnit={weightUnit}
                foodBrands={foodBrands}
                onLogFeeding={onLogFeeding}
                onDeleteFeeding={onDeleteFeeding}
                onUnitChange={onUnitChange}
            />

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="card animate-slide-up">
                    <form onSubmit={handleSubmit} className="p-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            {formData.type === 'food' ? <Utensils className="w-4 h-4" /> : <Cookie className="w-4 h-4" />}
                            {editingId ? 'Edit' : 'Add New'} {formData.type === 'food' ? 'Food' : 'Treat'} Brand
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="input-group col-span-2">
                                    <label className="input-label">Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleFormChange('type', 'food')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${formData.type === 'food' ? 'bg-cyan-500 border-cyan-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            Food
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleFormChange('type', 'treat')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${formData.type === 'treat' ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            Treat
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group col-span-2">
                                    <label className="input-label">Brand Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder={formData.type === 'food' ? "e.g., Royal Canin Puppy" : "e.g., Zuke's Mini Naturals"}
                                        value={formData.brandName}
                                        onChange={(e) => handleFormChange('brandName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="nutrition-protein">Protein (%)</label>
                                    <input
                                        id="nutrition-protein"
                                        type="number"
                                        className="input-field"
                                        placeholder="e.g., 28"
                                        value={formData.protein}
                                        onChange={(e) => handleFormChange('protein', e.target.value)}
                                        step="0.1"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="nutrition-fat">Fat (%)</label>
                                    <input
                                        id="nutrition-fat"
                                        type="number"
                                        className="input-field"
                                        placeholder="e.g., 15"
                                        value={formData.fat}
                                        onChange={(e) => handleFormChange('fat', e.target.value)}
                                        step="0.1"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="nutrition-fiber">Fiber (%)</label>
                                    <input
                                        id="nutrition-fiber"
                                        type="number"
                                        className="input-field"
                                        placeholder="e.g., 4"
                                        value={formData.fiber}
                                        onChange={(e) => handleFormChange('fiber', e.target.value)}
                                        step="0.1"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="nutrition-moisture">Moisture (%)</label>
                                    <input
                                        id="nutrition-moisture"
                                        type="number"
                                        className="input-field"
                                        placeholder="e.g., 10"
                                        value={formData.moisture}
                                        onChange={(e) => handleFormChange('moisture', e.target.value)}
                                        step="0.1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editingId ? 'Update' : 'Save'} Brand
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Food Brands List */}
            {renderBrandList(foodItems, 'Food Brands', <Utensils className="w-5 h-5" />)}

            {/* Treat Brands List */}
            {renderBrandList(treatItems, 'Treat Brands', <Cookie className="w-5 h-5" />)}

            {/* Calculation Results for Active Food Brand */}
            {result && activeFoodBrand && (
                <div className="card">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            Daily Requirements
                        </h3>
                        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-medium">
                            {activeFoodBrand.brandName}
                        </span>
                    </div>

                    <div className="p-4">
                        {/* Warnings */}
                        {result.warnings.map((warning, idx) => (
                            <div key={idx} className="alert alert-warning mb-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{warning}</p>
                            </div>
                        ))}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="stat-card stat-card-amber">
                                <div className="stat-value">{result.kcalPerKg}</div>
                                <div className="stat-label">kcal/kg Food</div>
                            </div>
                            <div className="stat-card stat-card-emerald">
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
                </div>
            )}

            {/* Scientific Formula Card */}
            {result && currentWeight && ageInWeeks !== null && (
                <div className="card overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-xl">🔬</span>
                            Nutrition Science
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">Peer-Reviewed Veterinary Formulas</p>
                    </div>

                    <div className="p-4 bg-slate-50 space-y-4">
                        {/* RER Formula */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                                <h4 className="font-bold text-slate-800">Resting Energy Requirement (RER)</h4>
                            </div>
                            <div className="font-mono text-sm bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                                <span className="text-slate-500">RER = </span>
                                70 × ({(currentWeight / 1000).toFixed(2)} kg)<sup className="text-xs">0.75</sup>
                                <span className="text-slate-500"> = </span>
                                <span className="text-cyan-400 font-bold">{result.rer} kcal</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Baseline calories needed at rest</p>
                        </div>

                        {/* DER Formula */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">2</div>
                                <h4 className="font-bold text-slate-800">Daily Energy Requirement (DER)</h4>
                            </div>
                            <div className="font-mono text-sm bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                                <span className="text-slate-500">DER = </span>
                                {result.rer} × {(result.der / result.rer).toFixed(1)}
                                <span className="text-yellow-400 text-xs ml-1">(age multiplier)</span>
                                <span className="text-slate-500"> = </span>
                                <span className="text-cyan-400 font-bold">{result.der} kcal</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {ageInWeeks < 16 ? '🐕 Growing puppy needs 2-3× adult energy' :
                                    ageInWeeks < 26 ? '🐕 Adolescent puppy needs 1.5-2× adult energy' :
                                        '🐕 Adult maintenance energy'}
                            </p>
                        </div>

                        {/* Caloric Density Formula */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">3</div>
                                <h4 className="font-bold text-slate-800">Food Energy Density</h4>
                            </div>
                            <div className="font-mono text-sm bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                                <span className="text-slate-500">ME = </span>
                                10 × [(3.5 × P) + (8.5 × F) + (3.5 × NFE)]
                                <span className="text-slate-500"> = </span>
                                <span className="text-cyan-400 font-bold">{result.kcalPerKg} kcal/kg</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Modified Atwater factors for pet food</p>
                        </div>

                        {/* Daily Food Amount */}
                        <div className="bg-white rounded-xl p-4 border-2 border-cyan-500 shadow-md">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-sm">4</div>
                                <h4 className="font-bold text-slate-800">Daily Food Amount</h4>
                            </div>
                            <div className="font-mono text-sm bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                                <span className="text-slate-500">Food = </span>
                                ({result.der} ÷ {result.kcalPerKg}) × 1000
                                <span className="text-slate-500"> = </span>
                                <span className="text-cyan-400 font-bold text-lg">{result.dailyGrams}g/day</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between bg-cyan-50 rounded-lg p-2">
                                <span className="text-sm font-medium text-cyan-800">
                                    ÷ {result.mealsPerDay} meals
                                </span>
                                <span className="text-lg font-bold text-cyan-600">
                                    = {result.gramsPerMeal}g per meal
                                </span>
                            </div>
                        </div>

                        {/* Age-Based Multiplier Reference */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <h4 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                📊 DER Multipliers by Age
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className={`p-2 rounded-lg ${ageInWeeks < 16 ? 'bg-cyan-100 border-2 border-cyan-400' : 'bg-slate-100'}`}>
                                    <span className="font-bold">0-16 wks:</span> 3.0×
                                </div>
                                <div className={`p-2 rounded-lg ${ageInWeeks >= 16 && ageInWeeks < 26 ? 'bg-cyan-100 border-2 border-cyan-400' : 'bg-slate-100'}`}>
                                    <span className="font-bold">4-6 mo:</span> 2.0×
                                </div>
                                <div className={`p-2 rounded-lg ${ageInWeeks >= 26 && ageInWeeks < 52 ? 'bg-cyan-100 border-2 border-cyan-400' : 'bg-slate-100'}`}>
                                    <span className="font-bold">6-12 mo:</span> 1.6×
                                </div>
                                <div className={`p-2 rounded-lg ${ageInWeeks >= 52 ? 'bg-cyan-100 border-2 border-cyan-400' : 'bg-slate-100'}`}>
                                    <span className="font-bold">Adult:</span> 1.0×
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default NutritionEngine;
