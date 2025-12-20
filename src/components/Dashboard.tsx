import {
    PawPrint,
    Calendar,
    Scale,
    Download,
    Sparkles,
    Plus,
    Bell
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { PuppyProfile, HealthScheduleEntry, WeightUnit } from '../types';
import { WeightConverter } from '../types';
import { getAlertStatus } from '../utils/vetFormulas';

interface DashboardProps {
    profile: PuppyProfile | null;
    currentWeight: number | null;
    ageInWeeks: number | null;
    upcomingAlerts: HealthScheduleEntry[];
    weightUnit: WeightUnit;
    onExport: () => void;
    onSetupProfile: () => void;
    onUnitChange: (unit: WeightUnit) => void;
}

export function Dashboard({
    profile,
    currentWeight,
    ageInWeeks,
    upcomingAlerts,
    weightUnit,
    onExport,
    onSetupProfile,
    onUnitChange,
}: DashboardProps) {
    // If no profile, show setup prompt
    if (!profile) {
        return (
            <div className="animate-fade-in">
                <div className="card text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PawPrint className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        Welcome to AppPup! 🐕
                    </h2>
                    <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                        Let's set up your puppy's profile to get personalized health
                        tracking and nutrition guidance.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={onSetupProfile}
                    >
                        <Plus className="w-4 h-4" />
                        Add Your Puppy
                    </button>
                </div>
            </div>
        );
    }

    const birthDate = new Date(profile.birthDate);
    const ageText = ageInWeeks !== null
        ? ageInWeeks < 52
            ? `${ageInWeeks} weeks old`
            : `${Math.floor(ageInWeeks / 52)} year${Math.floor(ageInWeeks / 52) > 1 ? 's' : ''} old`
        : 'Age unknown';

    const weightDisplay = currentWeight
        ? WeightConverter.format(currentWeight, weightUnit)
        : 'Not recorded';

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Puppy Profile Card */}
            <div className="card">
                <div className="gradient-header flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <PawPrint className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile.name}</h2>
                            <p className="text-sm text-white/80">{profile.breed || 'Chihuahua'}</p>
                        </div>
                    </div>

                    {/* Unit Toggle */}
                    <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm">
                        {(['g', 'oz', 'lbs'] as WeightUnit[]).map((unit) => (
                            <button
                                key={unit}
                                onClick={() => onUnitChange(unit)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${weightUnit === unit
                                        ? 'bg-white text-cyan-600 shadow-sm'
                                        : 'text-white hover:bg-white/10'
                                    }`}
                            >
                                {unit}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="stat-card" style={{ '--stat-bg-start': '#06b6d4', '--stat-bg-end': '#0891b2' } as React.CSSProperties}>
                        <Calendar className="w-5 h-5 mx-auto mb-1 opacity-80" />
                        <div className="stat-value text-lg">{ageText}</div>
                        <div className="stat-label">Age</div>
                    </div>
                    <div className="stat-card" style={{ '--stat-bg-start': '#8b5cf6', '--stat-bg-end': '#7c3aed' } as React.CSSProperties}>
                        <Scale className="w-5 h-5 mx-auto mb-1 opacity-80" />
                        <div className="stat-value text-lg">{weightDisplay}</div>
                        <div className="stat-label">Weight</div>
                    </div>
                </div>
            </div>

            {/* Upcoming Alerts */}
            {upcomingAlerts.length > 0 && (
                <div className="card">
                    <h3 className="card-header">
                        <Bell className="w-5 h-5 text-amber-500" />
                        Upcoming Health Tasks
                    </h3>
                    <div className="space-y-2">
                        {upcomingAlerts.slice(0, 4).map((alert) => {
                            const status = getAlertStatus(alert.dueDate, alert.administered);
                            const dueDate = new Date(alert.dueDate);
                            const daysUntil = differenceInDays(dueDate, new Date());

                            return (
                                <div
                                    key={alert.id}
                                    className={`p-3 rounded-lg flex items-center justify-between ${status === 'overdue' ? 'bg-red-50 border border-red-200' :
                                        status === 'due_now' ? 'bg-emerald-50 border border-emerald-200' :
                                            'bg-amber-50 border border-amber-200'
                                        }`}
                                >
                                    <div>
                                        <p className="font-medium text-sm text-slate-800">{alert.type}</p>
                                        <p className="text-xs text-slate-600">{alert.description}</p>
                                    </div>
                                    <span className={`badge ${status === 'overdue' ? 'badge-overdue' :
                                        status === 'due_now' ? 'badge-due-now' :
                                            'badge-due-soon'
                                        }`}>
                                        {status === 'overdue' ? 'Overdue' :
                                            status === 'due_now' ? 'Today' :
                                                `${daysUntil}d`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <h3 className="card-header">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        className="btn btn-outline w-full text-sm"
                        onClick={onExport}
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                    <button
                        className="btn btn-secondary w-full text-sm"
                        onClick={onSetupProfile}
                    >
                        <PawPrint className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Birthday Info */}
            {profile.birthDate && (
                <div className="card bg-gradient-to-r from-pink-100 to-violet-100">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🎂</div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Birthday</p>
                            <p className="text-slate-600">{format(birthDate, 'MMMM d, yyyy')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
