import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    UserPlus,
    Copy,
    Check,
    X,
    RefreshCw,
    Crown,
    Shield,
    Eye,
    Trash2,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Household {
    id: string;
    name: string;
    ownerId: string;
    inviteCode: string;
    createdAt: string;
}

interface HouseholdMember {
    id: string;
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: string;
    displayName: string;
    email: string;
}

export function FamilySettings() {
    const { user } = useAuth();
    const [household, setHousehold] = useState<Household | null>(null);
    const [members, setMembers] = useState<HouseholdMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [createName, setCreateName] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Load household and members
    const loadHousehold = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Check if user is in a household
            const { data: memberData } = await supabase
                .from('household_members')
                .select(`
                    household_id,
                    role,
                    households (id, name, owner_id, invite_code, created_at)
                `)
                .eq('user_id', user.id)
                .single();

            if (memberData?.households) {
                const h = memberData.households as unknown as Record<string, unknown>;
                setHousehold({
                    id: h.id as string,
                    name: h.name as string,
                    ownerId: h.owner_id as string,
                    inviteCode: h.invite_code as string,
                    createdAt: h.created_at as string,
                });

                // Load all members
                const { data: allMembers } = await supabase
                    .from('household_members')
                    .select(`
                        id,
                        user_id,
                        role,
                        joined_at,
                        user_profiles (display_name)
                    `)
                    .eq('household_id', h.id);

                if (allMembers) {
                    const formattedMembers: HouseholdMember[] = allMembers.map((m: Record<string, unknown>) => ({
                        id: m.id as string,
                        userId: m.user_id as string,
                        role: m.role as HouseholdMember['role'],
                        joinedAt: m.joined_at as string,
                        displayName: (m.user_profiles as Record<string, unknown>)?.display_name as string || 'Unknown',
                        email: '',
                    }));
                    setMembers(formattedMembers);
                }
            }
        } catch (err) {
            console.error('Error loading household:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadHousehold();
    }, [loadHousehold]);

    // Create a new household
    const createHousehold = async () => {
        if (!user || !createName.trim()) return;

        try {
            // Create the household
            const { data: newHousehold, error: createError } = await supabase
                .from('households')
                .insert({
                    name: createName.trim(),
                    owner_id: user.id,
                })
                .select()
                .single();

            if (createError) throw createError;

            // Add user as owner member
            await supabase
                .from('household_members')
                .insert({
                    household_id: newHousehold.id,
                    user_id: user.id,
                    role: 'owner',
                });

            setShowCreateModal(false);
            setCreateName('');
            loadHousehold();
        } catch (err) {
            console.error('Error creating household:', err);
        }
    };

    // Join a household with invite code
    const joinHousehold = async () => {
        if (!user || !joinCode.trim()) return;

        setJoinError(null);

        try {
            // Find household by invite code
            const { data: houseData, error: findError } = await supabase
                .from('households')
                .select('id')
                .eq('invite_code', joinCode.trim().toLowerCase())
                .single();

            if (findError || !houseData) {
                setJoinError('Invalid invite code. Please check and try again.');
                return;
            }

            // Check if already a member
            const { data: existing } = await supabase
                .from('household_members')
                .select('id')
                .eq('household_id', houseData.id)
                .eq('user_id', user.id)
                .single();

            if (existing) {
                setJoinError('You are already a member of this household.');
                return;
            }

            // Add as member
            const { error: joinError } = await supabase
                .from('household_members')
                .insert({
                    household_id: houseData.id,
                    user_id: user.id,
                    role: 'member',
                });

            if (joinError) throw joinError;

            setShowJoinModal(false);
            setJoinCode('');
            loadHousehold();
        } catch (err) {
            console.error('Error joining household:', err);
            setJoinError('Failed to join household. Please try again.');
        }
    };

    // Copy invite code
    const copyInviteCode = async () => {
        if (!household?.inviteCode) return;

        await navigator.clipboard.writeText(household.inviteCode);
        setInviteCodeCopied(true);
        setTimeout(() => setInviteCodeCopied(false), 2000);
    };

    // Regenerate invite code
    const regenerateInviteCode = async () => {
        if (!household) return;

        try {
            const { data, error } = await supabase
                .from('households')
                .update({ invite_code: crypto.randomUUID().slice(0, 12) })
                .eq('id', household.id)
                .select('invite_code')
                .single();

            if (error) throw error;
            setHousehold({ ...household, inviteCode: data.invite_code });
        } catch (err) {
            console.error('Error regenerating invite code:', err);
        }
    };

    // Remove a member
    const removeMember = async (memberId: string) => {
        try {
            await supabase
                .from('household_members')
                .delete()
                .eq('id', memberId);

            setMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    // Update member role
    const updateMemberRole = async (memberId: string, newRole: HouseholdMember['role']) => {
        try {
            await supabase
                .from('household_members')
                .update({ role: newRole })
                .eq('id', memberId);

            setMembers(prev => prev.map(m =>
                m.id === memberId ? { ...m, role: newRole } : m
            ));
        } catch (err) {
            console.error('Error updating member role:', err);
        }
    };

    const roleIcons: Record<string, React.ReactNode> = {
        owner: <Crown className="w-4 h-4 text-amber-500" />,
        admin: <Shield className="w-4 h-4 text-blue-500" />,
        member: <Users className="w-4 h-4 text-emerald-500" />,
        viewer: <Eye className="w-4 h-4 text-slate-400" />,
    };

    const roleColors: Record<string, string> = {
        owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        member: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    };

    const isOwner = household?.ownerId === user?.id;
    const canManageMembers = isOwner || members.find(m => m.userId === user?.id)?.role === 'admin';

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card">
                <div className="gradient-header bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Family Access
                    </h2>
                    <p className="text-sm text-white/80">Share pup care with family members</p>
                </div>

                {!household ? (
                    /* No Household - Create or Join */
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                            Create or Join a Family
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Share access to your pups with family members or caregivers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Create Family
                            </button>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Join Family
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Has Household - Show Details */
                    <div className="space-y-6">
                        {/* Invite Code Section */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Invite Code
                                </span>
                                {isOwner && (
                                    <button
                                        onClick={regenerateInviteCode}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Regenerate
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg font-mono text-lg tracking-wider text-slate-800 dark:text-white">
                                    {household.inviteCode}
                                </code>
                                <button
                                    onClick={copyInviteCode}
                                    className={`p-2 rounded-lg transition-all ${inviteCodeCopied
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {inviteCodeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Share this code with family members to give them access to your pups.
                            </p>
                        </div>

                        {/* Members List */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Family Members ({members.length})
                            </h3>
                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold">
                                                {member.displayName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-white">
                                                    {member.displayName}
                                                    {member.userId === user?.id && (
                                                        <span className="text-xs text-slate-400 ml-1">(You)</span>
                                                    )}
                                                </p>
                                                <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${roleColors[member.role]}`}>
                                                    {roleIcons[member.role]}
                                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                </div>
                                            </div>
                                        </div>

                                        {canManageMembers && member.userId !== user?.id && member.role !== 'owner' && (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => updateMemberRole(member.id, e.target.value as HouseholdMember['role'])}
                                                    className="text-xs p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                                                    title={`Change role for ${member.displayName}`}
                                                    aria-label={`Change role for ${member.displayName}`}
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="member">Member</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                                <button
                                                    onClick={() => removeMember(member.id)}
                                                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title={`Remove ${member.displayName}`}
                                                    aria-label={`Remove ${member.displayName}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Join Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Join a Family</h3>
                            <button
                                onClick={() => { setShowJoinModal(false); setJoinError(null); }}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Close dialog"
                                aria-label="Close join family dialog"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Enter the invite code shared by a family member.
                        </p>

                        {joinError && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <p className="text-sm text-red-600 dark:text-red-400">{joinError}</p>
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder="Enter invite code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 outline-none font-mono text-lg tracking-wider text-center"
                        />

                        <button
                            onClick={joinHousehold}
                            disabled={!joinCode.trim()}
                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg disabled:opacity-50"
                        >
                            Join Family
                        </button>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create Family</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Close dialog"
                                aria-label="Close create family dialog"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Give your family a name. You'll be able to invite others after creating it.
                        </p>

                        <input
                            type="text"
                            placeholder="e.g., The Smith Family"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 outline-none"
                        />

                        <button
                            onClick={createHousehold}
                            disabled={!createName.trim()}
                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg disabled:opacity-50"
                        >
                            Create Family
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FamilySettings;
