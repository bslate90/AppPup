import { useState, useEffect } from 'react';
import { X, PawPrint, Calendar, Palette, Tag } from 'lucide-react';
import type { PuppyProfile } from '../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: PuppyProfile | null;
    onSave: (profile: PuppyProfile) => void;
    onGenerateSchedule: (birthDate: Date) => void;
}

const DEFAULT_PROFILE: Omit<PuppyProfile, 'id'> = {
    name: '',
    birthDate: '',
    breed: 'Chihuahua',
    color: '',
    microchipId: '',
    breederName: '',
    notes: '',
};

export function ProfileModal({
    isOpen,
    onClose,
    profile,
    onSave,
    onGenerateSchedule,
}: ProfileModalProps) {
    const [form, setForm] = useState<Omit<PuppyProfile, 'id'>>(
        profile ? { ...profile } : DEFAULT_PROFILE
    );

    // Sync form when profile prop changes (e.g., loaded from database)
    useEffect(() => {
        if (profile) {
            setForm({ ...profile });
        } else {
            setForm(DEFAULT_PROFILE);
        }
    }, [profile]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const savedProfile: PuppyProfile = {
            ...form,
            id: profile?.id || `puppy_${Date.now()}`,
        };

        onSave(savedProfile);

        // Generate schedule if new profile with birth date
        if (!profile && form.birthDate) {
            onGenerateSchedule(new Date(form.birthDate));
        }

        onClose();
    };

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm({ ...form, [field]: value });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <PawPrint className="w-5 h-5" />
                        {profile ? 'Edit Puppy Profile' : 'Add Your Puppy'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        title="Close modal"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Name */}
                    <div className="input-group">
                        <label className="input-label flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Puppy's Name *
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., Luna, Max, Bella"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Birth Date */}
                    <div className="input-group">
                        <label className="input-label flex items-center gap-1" htmlFor="puppy-birthdate">
                            <Calendar className="w-3 h-3" />
                            Birth Date *
                        </label>
                        <input
                            id="puppy-birthdate"
                            type="date"
                            className="input-field"
                            title="Select puppy's birth date"
                            value={form.birthDate}
                            onChange={(e) => handleChange('birthDate', e.target.value)}
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Used to calculate age and vaccine schedule
                        </p>
                    </div>

                    {/* Breed & Color */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="input-group">
                            <label className="input-label">Breed</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Chihuahua"
                                value={form.breed}
                                onChange={(e) => handleChange('breed', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label flex items-center gap-1">
                                <Palette className="w-3 h-3" />
                                Color
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g., Fawn, Black"
                                value={form.color}
                                onChange={(e) => handleChange('color', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Microchip */}
                    <div className="input-group">
                        <label className="input-label">Microchip ID</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Optional"
                            value={form.microchipId}
                            onChange={(e) => handleChange('microchipId', e.target.value)}
                        />
                    </div>

                    {/* Breeder */}
                    <div className="input-group">
                        <label className="input-label">Breeder/Rescue Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Optional"
                            value={form.breederName}
                            onChange={(e) => handleChange('breederName', e.target.value)}
                        />
                    </div>

                    {/* Notes */}
                    <div className="input-group">
                        <label className="input-label">Notes</label>
                        <textarea
                            className="input-field min-h-[80px] resize-none"
                            placeholder="Any special notes about your puppy..."
                            value={form.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={!form.name || !form.birthDate}
                        >
                            <PawPrint className="w-4 h-4" />
                            {profile ? 'Save Changes' : 'Add Puppy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileModal;
