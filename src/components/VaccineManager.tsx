import { useState } from 'react';
import {
    Syringe,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    User,
    Hash
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { HealthScheduleEntry, VaccineType } from '../types';
import { getAlertStatus } from '../utils/vetFormulas';

interface VaccineManagerProps {
    birthDate: string | null;
    healthSchedule: HealthScheduleEntry[];
    onGenerateSchedule: (birthDate: Date) => void;
    onUpdateEntry: (id: string, updates: Partial<HealthScheduleEntry>) => void;
}

const vaccineColors: Record<VaccineType, string> = {
    DAPP: 'from-blue-500 to-indigo-500',
    Lepto: 'from-green-500 to-emerald-500',
    Bordetella: 'from-purple-500 to-violet-500',
    Deworming: 'from-amber-500 to-orange-500',
    Rabies: 'from-red-500 to-rose-500',
};

const vaccineEmojis: Record<VaccineType, string> = {
    DAPP: '💉',
    Lepto: '🦠',
    Bordetella: '🫁',
    Deworming: '🪱',
    Rabies: '🐕',
};

export function VaccineManager({
    birthDate,
    healthSchedule,
    onGenerateSchedule,
    onUpdateEntry,
}: VaccineManagerProps) {
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const [newBirthDate, setNewBirthDate] = useState(birthDate || '');
    const [recordForm, setRecordForm] = useState({
        administrator: '',
        lotNumber: '',
        notes: '',
    });

    const handleGenerateSchedule = () => {
        if (newBirthDate) {
            onGenerateSchedule(new Date(newBirthDate));
        }
    };

    const handleMarkAdministered = (entry: HealthScheduleEntry) => {
        onUpdateEntry(entry.id, {
            administered: true,
            administeredDate: new Date().toISOString(),
            administrator: recordForm.administrator,
            lotNumber: recordForm.lotNumber,
            notes: recordForm.notes,
        });
        setSelectedEntry(null);
        setRecordForm({ administrator: '', lotNumber: '', notes: '' });
    };

    const getStatusBadge = (entry: HealthScheduleEntry) => {
        const status = getAlertStatus(entry.dueDate, entry.administered);
        const dueDate = new Date(entry.dueDate);
        const daysUntil = differenceInDays(dueDate, new Date());

        switch (status) {
            case 'completed':
                return <span className="badge badge-completed"><CheckCircle2 className="w-3 h-3" /> Done</span>;
            case 'overdue':
                return <span className="badge badge-overdue"><AlertCircle className="w-3 h-3" /> Overdue</span>;
            case 'due_now':
                return <span className="badge badge-due-now animate-pulse"><Syringe className="w-3 h-3" /> Today</span>;
            case 'due_soon':
                return <span className="badge badge-due-soon"><Clock className="w-3 h-3" /> {daysUntil}d</span>;
            default:
                return <span className="badge badge-upcoming">{format(dueDate, 'MMM d')}</span>;
        }
    };

    // Group schedule by vaccine type
    const groupedSchedule = healthSchedule.reduce((acc, entry) => {
        if (!acc[entry.type]) acc[entry.type] = [];
        acc[entry.type].push(entry);
        return acc;
    }, {} as Record<VaccineType, HealthScheduleEntry[]>);

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="card">
                <div className="gradient-header">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Syringe className="w-5 h-5" />
                        Vaccine Manager
                    </h2>
                    <p className="text-sm text-white/80">AAHA Guidelines</p>
                </div>

                {/* Birth Date Input */}
                {healthSchedule.length === 0 && (
                    <>
                        <div className="input-group">
                            <label className="input-label">Puppy's Birth Date (or 8-week pickup date)</label>
                            <input
                                type="date"
                                className="input-field"
                                value={newBirthDate}
                                onChange={(e) => setNewBirthDate(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary w-full"
                            onClick={handleGenerateSchedule}
                            disabled={!newBirthDate}
                        >
                            <Calendar className="w-4 h-4" />
                            Generate Vaccine Schedule
                        </button>
                    </>
                )}
            </div>

            {/* Schedule by Vaccine Type */}
            {Object.entries(groupedSchedule).map(([type, entries]) => (
                <div key={type} className="card">
                    <div className={`bg-gradient-to-r ${vaccineColors[type as VaccineType]} text-white p-3 rounded-xl mb-3 flex items-center gap-2`}>
                        <span className="text-xl">{vaccineEmojis[type as VaccineType]}</span>
                        <div>
                            <h3 className="font-bold">{type}</h3>
                            <p className="text-xs opacity-80">
                                {entries.filter(e => e.administered).length}/{entries.length} completed
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {entries.map((entry) => {
                            const isExpanded = selectedEntry === entry.id && !entry.administered;
                            const status = getAlertStatus(entry.dueDate, entry.administered);

                            return (
                                <div key={entry.id}>
                                    <button
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${entry.administered
                                            ? 'bg-slate-50 border-slate-200 opacity-60'
                                            : status === 'due_now' || status === 'overdue'
                                                ? 'bg-emerald-50 border-emerald-300'
                                                : status === 'due_soon'
                                                    ? 'bg-amber-50 border-amber-200'
                                                    : 'bg-white border-slate-200 hover:border-cyan-300'
                                            }`}
                                        onClick={() => !entry.administered && setSelectedEntry(isExpanded ? null : entry.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${vaccineColors[type as VaccineType]}`}>
                                                    {entry.weekNumber}w
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-slate-800">
                                                        Week {entry.weekNumber}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {format(new Date(entry.dueDate), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(entry)}
                                                {!entry.administered && (
                                                    isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                        </div>

                                        {entry.administered && entry.administeredDate && (
                                            <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
                                                Administered {format(new Date(entry.administeredDate), 'MMM d, yyyy')}
                                                {entry.administrator && ` by ${entry.administrator}`}
                                            </div>
                                        )}
                                    </button>

                                    {/* Expanded Record Form */}
                                    {isExpanded && (
                                        <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                                            <div className="input-group mb-0">
                                                <label className="input-label flex items-center gap-1">
                                                    <User className="w-3 h-3" /> Administrator
                                                </label>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    placeholder="Vet name or clinic"
                                                    value={recordForm.administrator}
                                                    onChange={(e) => setRecordForm({ ...recordForm, administrator: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-group mb-0">
                                                <label className="input-label flex items-center gap-1">
                                                    <Hash className="w-3 h-3" /> Lot/Serial Number
                                                </label>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    placeholder="Optional"
                                                    value={recordForm.lotNumber}
                                                    onChange={(e) => setRecordForm({ ...recordForm, lotNumber: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                className="btn btn-success w-full"
                                                onClick={() => handleMarkAdministered(entry)}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Mark as Administered
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Educational Note */}
            {healthSchedule.length > 0 && (
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex gap-3">
                        <div className="text-2xl">📚</div>
                        <div>
                            <p className="font-medium text-slate-800 text-sm">Why the 16-week booster?</p>
                            <p className="text-xs text-slate-600 mt-1">
                                Maternal antibodies can interfere with early vaccinations. The 16-week
                                booster ensures protection once maternal immunity wanes (AAHA Guidelines).
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VaccineManager;
