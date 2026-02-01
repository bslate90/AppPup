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
import { VACCINE_COMPOSITION } from '../types';
import { getAlertStatus } from '../utils/vetFormulas';

interface VaccineManagerProps {
    birthDate: string | null;
    healthSchedule: HealthScheduleEntry[];
    onGenerateSchedule: (birthDate: Date) => void;
    onUpdateEntry: (id: string, updates: Partial<HealthScheduleEntry>) => void;
}

const vaccineColors: Record<VaccineType, string> = {
    DAPP: 'from-blue-500 to-indigo-500',
    DAPP_5: 'from-blue-600 to-indigo-600',
    DAPP_6: 'from-cyan-500 to-blue-500',
    DAPP_8: 'from-teal-500 to-emerald-500',
    DAPP_9: 'from-emerald-600 to-green-600',
    Lepto: 'from-green-500 to-emerald-500',
    Bordetella: 'from-purple-500 to-violet-500',
    Deworming: 'from-amber-500 to-orange-500',
    Rabies: 'from-red-500 to-rose-500',
};

const vaccineEmojis: Record<VaccineType, string> = {
    DAPP: '💉',
    DAPP_5: '🛡️',
    DAPP_6: '🛡️',
    DAPP_8: '🛡️',
    DAPP_9: '🛡️',
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
        shotType: '' as VaccineType | '',
        administeredDate: new Date().toISOString().split('T')[0],
        step: 1, // 1: Quick Select, 2: Smart Dropdown/Details
    });

    const handleGenerateSchedule = () => {
        if (newBirthDate) {
            onGenerateSchedule(new Date(newBirthDate));
        }
    };

    const handleMarkAdministered = (entry: HealthScheduleEntry) => {
        onUpdateEntry(entry.id, {
            administered: true,
            administeredDate: new Date(recordForm.administeredDate).toISOString(),
            administrator: recordForm.administrator,
            lotNumber: recordForm.lotNumber,
            notes: recordForm.notes,
            type: (recordForm.shotType as VaccineType) || entry.type,
        });
        setSelectedEntry(null);
        setRecordForm({
            administrator: '',
            lotNumber: '',
            notes: '',
            shotType: '',
            administeredDate: new Date().toISOString().split('T')[0],
            step: 1
        });
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

    // Group schedule by vaccine type, merging DAPP variants
    const groupedSchedule = healthSchedule.reduce((acc, entry) => {
        let groupType = entry.type;
        if (groupType.startsWith('DAPP')) groupType = 'DAPP';

        if (!acc[groupType]) acc[groupType] = [];
        acc[groupType].push(entry);
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
                            <label className="input-label" htmlFor="vaccine-birthdate">Puppy's Birth Date (or 8-week pickup date)</label>
                            <input
                                id="vaccine-birthdate"
                                type="date"
                                className="input-field"
                                title="Select puppy's birth date or 8-week pickup date"
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
                                        <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                                            {/* Step 1: Quick Select */}
                                            {entry.type === 'DAPP' && recordForm.step === 1 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="input-label mb-0">Step 1: Quick Select</label>
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Common Shots</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {(['DAPP_5', 'DAPP_6', 'DAPP_8', 'DAPP_9'] as VaccineType[]).map((vType) => (
                                                            <button
                                                                key={vType}
                                                                type="button"
                                                                className={`p-3 text-sm rounded-xl border-2 transition-all text-center flex flex-col items-center gap-1 ${recordForm.shotType === vType
                                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                                                                    }`}
                                                                onClick={() => setRecordForm({ ...recordForm, shotType: vType })}
                                                            >
                                                                <span className="text-lg">{vaccineEmojis[vType]}</span>
                                                                <span className="font-bold">{vType.replace('_', ' ')}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button
                                                        className="btn btn-primary w-full py-3 rounded-xl"
                                                        disabled={!recordForm.shotType}
                                                        onClick={() => setRecordForm({ ...recordForm, step: 2 })}
                                                    >
                                                        Next: Add Details
                                                    </button>
                                                </div>
                                            )}

                                            {/* Step 2: Smart Dropdown / Details */}
                                            {(entry.type !== 'DAPP' || recordForm.step === 2) && (
                                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                                    <div className="flex items-center justify-between">
                                                        <label className="input-label mb-0">
                                                            {entry.type === 'DAPP' ? 'Step 2: Record Details' : 'Record Details'}
                                                        </label>
                                                        {entry.type === 'DAPP' && (
                                                            <button
                                                                className="text-[10px] text-blue-600 font-bold hover:underline"
                                                                onClick={() => setRecordForm({ ...recordForm, step: 1 })}
                                                            >
                                                                ← Change Shot
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Smart Dropdown for Vaccine Type */}
                                                    <div className="input-group mb-0">
                                                        <label className="input-label flex items-center gap-1" htmlFor="vaccine-type-select">
                                                            <Syringe className="w-3 h-3" /> Vaccine Type
                                                        </label>
                                                        <select
                                                            id="vaccine-type-select"
                                                            className="input-field"
                                                            title="Select vaccine type"
                                                            aria-label="Select vaccine type"
                                                            value={recordForm.shotType || entry.type}
                                                            onChange={(e) => setRecordForm({ ...recordForm, shotType: e.target.value as VaccineType })}
                                                        >
                                                            <option value="DAPP">DAPP (Standard 4-way)</option>
                                                            <option value="DAPP_5">DAPP 5-way</option>
                                                            <option value="DAPP_6">DAPP 6-way</option>
                                                            <option value="DAPP_8">DAPP 8-way</option>
                                                            <option value="DAPP_9">DAPP 9-way</option>
                                                            <option value="Lepto">Leptospirosis</option>
                                                            <option value="Bordetella">Bordetella</option>
                                                            <option value="Rabies">Rabies</option>
                                                            <option value="Deworming">Deworming</option>
                                                        </select>
                                                    </div>

                                                    {(recordForm.shotType || entry.type) && VACCINE_COMPOSITION[(recordForm.shotType || entry.type) as VaccineType] && (
                                                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                                            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                                                                Components:
                                                            </p>
                                                            <p className="text-[10px] text-blue-600 italic">
                                                                {VACCINE_COMPOSITION[(recordForm.shotType || entry.type) as VaccineType].join(', ')}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <div className="input-group mb-0">
                                                            <label className="input-label flex items-center gap-1" htmlFor="vaccine-admin-date">
                                                                <Calendar className="w-3 h-3" /> Date Administered
                                                            </label>
                                                            <input
                                                                id="vaccine-admin-date"
                                                                type="date"
                                                                className="input-field"
                                                                title="Select date vaccine was administered"
                                                                value={recordForm.administeredDate}
                                                                onChange={(e) => setRecordForm({ ...recordForm, administeredDate: e.target.value })}
                                                            />
                                                        </div>
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
                                                    </div>

                                                    <button
                                                        className="btn btn-success w-full py-3 rounded-xl shadow-lg shadow-emerald-100"
                                                        onClick={() => handleMarkAdministered(entry)}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Complete Record
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Educational Note */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="text-2xl">📚</div>
                        <div>
                            <p className="font-medium text-slate-800 text-sm">Understanding Multi-Way Vaccines</p>
                            <p className="text-xs text-slate-600 mt-1">
                                The number (5-way, 9-way, etc.) refers to how many diseases the shot protects against.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/50 p-2 rounded-lg">
                            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Core Protection (5-Way)</h4>
                            <ul className="text-[10px] text-slate-600 list-disc list-inside mt-1">
                                <li><strong>Distemper:</strong> Severe respiratory/nervous system virus</li>
                                <li><strong>Parvovirus:</strong> Highly fatal GI virus</li>
                                <li><strong>Adenovirus/Hepatitis:</strong> Liver/kidney infection</li>
                                <li><strong>Parainfluenza:</strong> Respiratory infection</li>
                            </ul>
                        </div>
                        <div className="bg-white/50 p-2 rounded-lg">
                            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Expanded Protection</h4>
                            <ul className="text-[10px] text-slate-600 list-disc list-inside mt-1">
                                <li><strong>Leptospirosis:</strong> Bacterial disease from wildlife urine</li>
                                <li><strong>Coronavirus:</strong> Gastrointestinal virus</li>
                                <li><strong>Bordetella:</strong> "Kennel Cough" respiratory bacteria</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-blue-100">
                        <p className="text-[10px] text-slate-500 italic">
                            Maternal antibodies can interfere with early vaccinations. The 16-week
                            booster ensures protection once maternal immunity wanes (AAHA Guidelines).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VaccineManager;
