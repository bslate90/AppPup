import { useState, useMemo } from 'react';
import {
    Syringe,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    User,
    Hash,
    Search,
    Sparkles,
    X,
    BookOpen,
    Info,
    ExternalLink
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { HealthScheduleEntry, VaccineType, VaccineBrandMapping } from '../types';
import { VACCINE_COMPOSITION, findVaccineMatches } from '../types';
import { getAlertStatus } from '../utils/vetFormulas';
import { DiseaseInfoModal } from './DiseaseInfoModal';
import { LifeStageDashboard } from './LifeStageDashboard';
import { getDiseasesByVaccineType, getDiseaseById, type DiseaseInfo } from '../data/diseaseInfo';

interface VaccineManagerProps {
    birthDate: string | null;
    breed: string;
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
    breed,
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

    // Smart Entry state
    const [smartEntrySearch, setSmartEntrySearch] = useState('');
    const [showSmartEntry, setShowSmartEntry] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<VaccineBrandMapping | null>(null);
    const [smartEntryDate, setSmartEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [smartEntryAdmin, setSmartEntryAdmin] = useState('');
    const [smartEntryLot, setSmartEntryLot] = useState('');

    // Disease Info Modal state
    const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);
    const [showDiseaseModal, setShowDiseaseModal] = useState(false);

    // Handle clicking on a disease to show info modal
    const handleDiseaseClick = (diseaseId: string) => {
        const disease = getDiseaseById(diseaseId);
        if (disease) {
            setSelectedDisease(disease);
            setShowDiseaseModal(true);
        }
    };

    // Navigate to Learn page with disease section
    const handleLearnMore = (diseaseId: string) => {
        // This will scroll to the disease section on the Learn page
        // We dispatch a custom event that the App can listen to
        const event = new CustomEvent('navigateToDisease', { detail: { diseaseId } });
        window.dispatchEvent(event);
        setShowDiseaseModal(false);
    };

    // Filter vaccine matches based on search input
    const vaccineMatches = useMemo(() => {
        if (!smartEntrySearch.trim()) return [];
        return findVaccineMatches(smartEntrySearch).slice(0, 8); // Limit to 8 results
    }, [smartEntrySearch]);

    // Find the next pending entry for a given vaccine type
    const findNextPendingEntry = (type: VaccineType): HealthScheduleEntry | null => {
        // For DAPP variants, search in DAPP group
        const searchTypes: VaccineType[] = type.startsWith('DAPP')
            ? ['DAPP', 'DAPP_5', 'DAPP_6', 'DAPP_8', 'DAPP_9']
            : [type];

        const pending = healthSchedule
            .filter(e => searchTypes.includes(e.type) && !e.administered)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return pending[0] || null;
    };

    // Handle smart entry submission
    const handleSmartEntrySubmit = () => {
        if (!selectedBrand) return;

        const nextEntry = findNextPendingEntry(selectedBrand.type);
        if (!nextEntry) {
            alert(`No pending ${selectedBrand.type} entries found in schedule.`);
            return;
        }

        // Update the entry with the selected brand info
        onUpdateEntry(nextEntry.id, {
            administered: true,
            administeredDate: new Date(smartEntryDate).toISOString(),
            administrator: smartEntryAdmin || undefined,
            lotNumber: smartEntryLot || undefined,
            type: selectedBrand.type,
            notes: `Vaccine: ${selectedBrand.brandName}${selectedBrand.manufacturer ? ` (${selectedBrand.manufacturer})` : ''}`,
        });

        // Reset smart entry form
        setSmartEntrySearch('');
        setSelectedBrand(null);
        setSmartEntryAdmin('');
        setSmartEntryLot('');
        setShowSmartEntry(false);
    };

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

            {/* Life Stage Dashboard - Shows for all dogs with birth dates */}
            {birthDate && healthSchedule.length > 0 && (
                <LifeStageDashboard
                    breed={breed}
                    birthDate={birthDate}
                    healthSchedule={healthSchedule}
                />
            )}

            {/* Smart Vaccine Entry */}
            {healthSchedule.length > 0 && (
                <div className="card">
                    <button
                        onClick={() => setShowSmartEntry(!showSmartEntry)}
                        className="w-full flex items-center justify-between p-2 -m-2"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-800">Smart Vaccine Entry</h3>
                                <p className="text-xs text-slate-500">Enter vaccine label name to auto-record</p>
                            </div>
                        </div>
                        {showSmartEntry ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {showSmartEntry && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4 animate-in slide-in-from-top-2">
                            {/* Search Input */}
                            <div className="relative">
                                <div className="input-group mb-0">
                                    <label className="input-label flex items-center gap-1">
                                        <Search className="w-3 h-3" />
                                        Vaccine Label Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="input-field pr-10"
                                            placeholder="e.g., Nobivac, Vanguard Plus 5, Spectra 9..."
                                            value={smartEntrySearch}
                                            onChange={(e) => {
                                                setSmartEntrySearch(e.target.value);
                                                setSelectedBrand(null);
                                            }}
                                        />
                                        {smartEntrySearch && (
                                            <button
                                                onClick={() => {
                                                    setSmartEntrySearch('');
                                                    setSelectedBrand(null);
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                aria-label="Clear search"
                                                title="Clear search"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Search Results Dropdown */}
                                {vaccineMatches.length > 0 && !selectedBrand && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                                        {vaccineMatches.map((brand, idx) => (
                                            <button
                                                key={`${brand.brandName}-${idx}`}
                                                className="w-full text-left p-3 hover:bg-violet-50 transition-colors border-b border-slate-100 last:border-b-0"
                                                onClick={() => {
                                                    setSelectedBrand(brand);
                                                    setSmartEntrySearch(brand.brandName);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{brand.brandName}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {brand.manufacturer} • {brand.type.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${vaccineColors[brand.type]}`}>
                                                        {brand.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Brand Details */}
                            {selectedBrand && (
                                <div className="space-y-4 animate-in fade-in">
                                    {/* Brand Info Card */}
                                    <div className={`p-4 rounded-xl text-white bg-gradient-to-r ${vaccineColors[selectedBrand.type]}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{vaccineEmojis[selectedBrand.type]}</span>
                                            <div>
                                                <h4 className="font-bold">{selectedBrand.brandName}</h4>
                                                <p className="text-sm opacity-90">{selectedBrand.manufacturer}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vaccine Components - Interactive Disease Cards */}
                                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-bold text-violet-800 dark:text-violet-300 uppercase tracking-wider">
                                                Protects Against:
                                            </p>
                                            <span className="text-[9px] text-violet-600 dark:text-violet-400 flex items-center gap-1">
                                                <Info className="w-3 h-3" />
                                                Tap for details
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {getDiseasesByVaccineType(selectedBrand.type).map((disease) => (
                                                <button
                                                    key={disease.id}
                                                    onClick={() => handleDiseaseClick(disease.id)}
                                                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-medium text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/40 transition-all hover:scale-[1.02] cursor-pointer"
                                                >
                                                    <span>{disease.emoji}</span>
                                                    <span>{disease.name}</span>
                                                    <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-violet-500 dark:text-violet-500 mt-2 italic">
                                            Learn about symptoms, transmission, and survival rates
                                        </p>
                                    </div>

                                    {/* Next pending entry info */}
                                    {(() => {
                                        const nextEntry = findNextPendingEntry(selectedBrand.type);
                                        if (!nextEntry) {
                                            return (
                                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                                    <p className="text-sm text-amber-800 font-medium">
                                                        ⚠️ No pending {selectedBrand.type.replace('_', ' ')} entries in schedule.
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                                                    Will Mark Complete:
                                                </p>
                                                <p className="text-sm text-emerald-700 font-medium">
                                                    Week {nextEntry.weekNumber} • Due {format(new Date(nextEntry.dueDate), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        );
                                    })()}

                                    {/* Additional Details */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="input-group mb-0">
                                            <label className="input-label flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Date Given
                                            </label>
                                            <input
                                                type="date"
                                                className="input-field"
                                                value={smartEntryDate}
                                                onChange={(e) => setSmartEntryDate(e.target.value)}
                                                title="Date vaccine was administered"
                                                aria-label="Date vaccine was administered"
                                            />
                                        </div>
                                        <div className="input-group mb-0">
                                            <label className="input-label flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                Vet/Clinic
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Optional"
                                                value={smartEntryAdmin}
                                                onChange={(e) => setSmartEntryAdmin(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group mb-0">
                                        <label className="input-label flex items-center gap-1">
                                            <Hash className="w-3 h-3" />
                                            Lot/Serial Number
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Optional"
                                            value={smartEntryLot}
                                            onChange={(e) => setSmartEntryLot(e.target.value)}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        className="btn btn-success w-full py-4 rounded-xl shadow-lg text-base font-bold"
                                        onClick={handleSmartEntrySubmit}
                                        disabled={!findNextPendingEntry(selectedBrand.type)}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Record Vaccine
                                    </button>
                                </div>
                            )}

                            {/* Quick Tips */}
                            {!selectedBrand && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        💡 Tips
                                    </p>
                                    <ul className="text-xs text-slate-500 space-y-1">
                                        <li>• Type the vaccine name from the label (e.g., "Nobivac", "Vanguard")</li>
                                        <li>• Search by manufacturer (e.g., "Zoetis", "Merck")</li>
                                        <li>• Or by vaccine type (e.g., "5-way", "DHPP")</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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

            {/* Interactive Disease Guide */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="text-2xl">📚</div>
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">Understanding Multi-Way Vaccines</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                The number (5-way, 9-way, etc.) refers to how many diseases the shot protects against.
                                <span className="text-blue-600 dark:text-blue-400 font-medium"> Tap any disease for detailed info.</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/60 dark:bg-slate-800/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Core Protection (5-Way)</h4>
                            </div>
                            <div className="space-y-1.5">
                                {['distemper', 'parvovirus', 'adenovirus', 'parainfluenza'].map((diseaseId) => {
                                    const disease = getDiseaseById(diseaseId);
                                    if (!disease) return null;
                                    return (
                                        <button
                                            key={diseaseId}
                                            onClick={() => handleDiseaseClick(diseaseId)}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-600 transition-all text-left group"
                                        >
                                            <span className="text-sm">{disease.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{disease.name}</p>
                                                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{disease.shortDescription.substring(0, 50)}...</p>
                                            </div>
                                            <Info className="w-3 h-3 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-800/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Expanded Protection</h4>
                            </div>
                            <div className="space-y-1.5">
                                {['leptospirosis', 'coronavirus', 'bordetella', 'rabies'].map((diseaseId) => {
                                    const disease = getDiseaseById(diseaseId);
                                    if (!disease) return null;
                                    return (
                                        <button
                                            key={diseaseId}
                                            onClick={() => handleDiseaseClick(diseaseId)}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-slate-600 transition-all text-left group"
                                        >
                                            <span className="text-sm">{disease.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{disease.name}</p>
                                                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{disease.shortDescription.substring(0, 50)}...</p>
                                            </div>
                                            <Info className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 flex-shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-blue-100 dark:border-blue-800">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                            Maternal antibodies can interfere with early vaccinations. The 16-week
                            booster ensures protection once maternal immunity wanes (AAHA Guidelines).
                        </p>
                    </div>
                </div>
            </div>

            {/* Disease Info Modal */}
            {selectedDisease && (
                <DiseaseInfoModal
                    disease={selectedDisease}
                    isOpen={showDiseaseModal}
                    onClose={() => {
                        setShowDiseaseModal(false);
                        setSelectedDisease(null);
                    }}
                    onLearnMore={handleLearnMore}
                />
            )}
        </div>
    );
}

export default VaccineManager;
