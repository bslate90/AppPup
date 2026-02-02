import { useState } from 'react';
import {
    ChevronDown,
    Plus,
    Check,
    Users,
    Dog,
    X
} from 'lucide-react';
import { usePups, type PupProfile } from '../../contexts/PupContext';

interface PupSelectorProps {
    onAddPup?: () => void;
}

export function PupSelector({ onAddPup }: PupSelectorProps) {
    const { pups, activePup, setActivePup } = usePups();
    const [isOpen, setIsOpen] = useState(false);

    if (pups.length === 0) {
        return (
            <button
                onClick={onAddPup}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
            >
                <Plus className="w-4 h-4" />
                Add Your First Pup
            </button>
        );
    }

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-sm"
            >
                {/* Pup Avatar */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg shadow-sm">
                    {activePup?.name?.charAt(0).toUpperCase() || '🐕'}
                </div>

                <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                        {activePup?.name || 'Select Pup'}
                    </p>
                    {activePup?.breed && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            {activePup.breed}
                        </p>
                    )}
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-slide-down">
                        {/* Header */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Your Pups</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Close pup selector"
                                aria-label="Close pup selector"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Pup List */}
                        <div className="max-h-64 overflow-y-auto">
                            {pups.map((pup) => (
                                <PupRow
                                    key={pup.id}
                                    pup={pup}
                                    isActive={activePup?.id === pup.id}
                                    onSelect={() => {
                                        setActivePup(pup);
                                        setIsOpen(false);
                                    }}
                                />
                            ))}
                        </div>

                        {/* Add New Pup */}
                        <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onAddPup?.();
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-amber-600">
                                    Add New Pup
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Individual Pup Row
function PupRow({
    pup,
    isActive,
    onSelect
}: {
    pup: PupProfile;
    isActive: boolean;
    onSelect: () => void;
}) {
    // Generate a color based on the pup's name
    const colors = [
        'from-amber-400 to-orange-500',
        'from-blue-400 to-indigo-500',
        'from-emerald-400 to-teal-500',
        'from-rose-400 to-pink-500',
        'from-purple-400 to-violet-500',
    ];
    const colorIndex = (pup.name?.charCodeAt(0) || 0) % colors.length;
    const gradient = colors[colorIndex];

    return (
        <button
            onClick={onSelect}
            className={`w-full flex items-center gap-3 p-3 transition-colors ${isActive
                ? 'bg-amber-50 dark:bg-amber-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
        >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-sm`}>
                {pup.name?.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {pup.name}
                    </p>
                    {pup.isShared && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                            <Users className="w-2.5 h-2.5" />
                            Shared
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {pup.breed || 'Mixed'}
                    {pup.birthDate && ` • ${calculateAge(pup.birthDate)}`}
                </p>
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                </div>
            )}
        </button>
    );
}

// Helper to calculate age
function calculateAge(birthDate: string): string {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

    if (months < 12) {
        return `${months}mo`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
        return `${years}y`;
    }

    return `${years}y ${remainingMonths}mo`;
}

export default PupSelector;
