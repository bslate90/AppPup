import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    Dog,
    BarChart3,
    Download,
    Search,
    ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ClientPup {
    id: string;
    name: string;
    breed: string;
    birthDate: string;
    ownerName: string;
    lastActivity: string;
    vaccineCompliance: number;
    weightTrend: 'up' | 'down' | 'stable';
    latestWeight: number;
    alertCount: number;
}

interface TrainerStats {
    totalClients: number;
    totalPups: number;
    upcomingVaccines: number;
    overdueItems: number;
    avgCompliance: number;
}

export function TrainerDashboard() {
    const { user, userProfile } = useAuth();
    const [clients, setClients] = useState<ClientPup[]>([]);
    const [stats, setStats] = useState<TrainerStats>({
        totalClients: 0,
        totalPups: 0,
        upcomingVaccines: 0,
        overdueItems: 0,
        avgCompliance: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'alerts' | 'compliant'>('all');

    const loadTrainerData = useCallback(async () => {
        if (!user || userProfile?.role !== 'trainer') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Load trainer's clients and their pups
            const { data: trainerClients } = await supabase
                .from('trainer_clients')
                .select(`
                    client_user_id,
                    pup_ids,
                    puppy_profiles!inner (
                        id,
                        name,
                        breed,
                        birth_date,
                        owner_id,
                        user_profiles!inner (display_name)
                    )
                `)
                .eq('trainer_id', user.id);

            if (trainerClients && trainerClients.length > 0) {
                const allPups: ClientPup[] = [];
                let totalUpcoming = 0;
                let totalOverdue = 0;
                let totalCompliance = 0;
                const uniqueOwners = new Set<string>();

                for (const client of trainerClients) {
                    const profiles = Array.isArray(client.puppy_profiles)
                        ? client.puppy_profiles
                        : [client.puppy_profiles];

                    for (const pup of profiles) {
                        if (!pup) continue;

                        // Get health schedule for this pup
                        const { data: healthData } = await supabase
                            .from('health_schedule')
                            .select('*')
                            .eq('profile_id', pup.id);

                        // Get latest weight
                        const { data: weightData } = await supabase
                            .from('weight_log')
                            .select('weight_grams, date')
                            .eq('profile_id', pup.id)
                            .order('date', { ascending: false })
                            .limit(2);

                        // Calculate metrics
                        const totalScheduled = healthData?.length || 0;
                        const completed = healthData?.filter((h: Record<string, unknown>) => h.administered).length || 0;
                        const compliance = totalScheduled > 0 ? (completed / totalScheduled) * 100 : 100;

                        const now = new Date();
                        const upcoming = healthData?.filter((h: Record<string, unknown>) => {
                            const dueDate = new Date(h.due_date as string);
                            const daysUntil = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            return !h.administered && daysUntil <= 7 && daysUntil >= 0;
                        }).length || 0;

                        const overdue = healthData?.filter((h: Record<string, unknown>) => {
                            const dueDate = new Date(h.due_date as string);
                            return !h.administered && dueDate < now;
                        }).length || 0;

                        totalUpcoming += upcoming;
                        totalOverdue += overdue;
                        totalCompliance += compliance;
                        uniqueOwners.add(pup.owner_id);

                        // Weight trend
                        let weightTrend: 'up' | 'down' | 'stable' = 'stable';
                        if (weightData && weightData.length >= 2) {
                            const diff = weightData[0].weight_grams - weightData[1].weight_grams;
                            if (diff > 10) weightTrend = 'up';
                            else if (diff < -10) weightTrend = 'down';
                        }

                        const userProfiles = pup.user_profiles as unknown;
                        const ownerProfile = userProfiles as { display_name: string } | null;

                        allPups.push({
                            id: pup.id,
                            name: pup.name,
                            breed: pup.breed || 'Unknown',
                            birthDate: pup.birth_date,
                            ownerName: ownerProfile?.display_name || 'Unknown',
                            lastActivity: healthData?.[0]?.updated_at as string || new Date().toISOString(),
                            vaccineCompliance: compliance,
                            weightTrend,
                            latestWeight: weightData?.[0]?.weight_grams || 0,
                            alertCount: overdue,
                        });
                    }
                }

                setClients(allPups);
                setStats({
                    totalClients: uniqueOwners.size,
                    totalPups: allPups.length,
                    upcomingVaccines: totalUpcoming,
                    overdueItems: totalOverdue,
                    avgCompliance: allPups.length > 0 ? totalCompliance / allPups.length : 100,
                });
            }
        } catch (err) {
            console.error('Error loading trainer data:', err);
        } finally {
            setLoading(false);
        }
    }, [user, userProfile?.role]);

    useEffect(() => {
        loadTrainerData();
    }, [loadTrainerData]);

    // Filter clients
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch =
                client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.breed.toLowerCase().includes(searchQuery.toLowerCase());

            if (filterStatus === 'alerts') {
                return matchesSearch && client.alertCount > 0;
            } else if (filterStatus === 'compliant') {
                return matchesSearch && client.vaccineCompliance >= 90;
            }

            return matchesSearch;
        });
    }, [clients, searchQuery, filterStatus]);

    if (userProfile?.role !== 'trainer') {
        return (
            <div className="card text-center py-12">
                <Dog className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    Trainer Dashboard
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    This feature is for trainers. Contact support to upgrade your account.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card">
                <div className="gradient-header bg-gradient-to-r from-violet-600 to-purple-600">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Trainer Dashboard
                    </h2>
                    <p className="text-sm text-white/80">Monitor all your client pups in one place</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Total Clients"
                    value={stats.totalClients}
                    color="from-blue-500 to-indigo-500"
                />
                <StatCard
                    icon={<Dog className="w-5 h-5" />}
                    label="Total Pups"
                    value={stats.totalPups}
                    color="from-amber-500 to-orange-500"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Due This Week"
                    value={stats.upcomingVaccines}
                    color="from-yellow-500 to-amber-500"
                />
                <StatCard
                    icon={<AlertCircle className="w-5 h-5" />}
                    label="Overdue Items"
                    value={stats.overdueItems}
                    color="from-red-500 to-rose-500"
                    alert={stats.overdueItems > 0}
                />
            </div>

            {/* Compliance Meter */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 dark:text-white">Overall Compliance</h3>
                    <span className={`text-2xl font-black ${stats.avgCompliance >= 90 ? 'text-emerald-500' :
                        stats.avgCompliance >= 70 ? 'text-amber-500' :
                            'text-red-500'
                        }`}>
                        {stats.avgCompliance.toFixed(0)}%
                    </span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${stats.avgCompliance >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                            stats.avgCompliance >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                'bg-gradient-to-r from-red-500 to-rose-500'
                            }`}
                        style={{ width: `${stats.avgCompliance}%` }}
                    />
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search pups, owners, or breeds..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-violet-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === 'all'
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('alerts')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === 'alerts'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Alerts
                    </button>
                    <button
                        onClick={() => setFilterStatus('compliant')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === 'compliant'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Compliant
                    </button>
                </div>
            </div>

            {/* Client Pup List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white">
                        Client Pups ({filteredClients.length})
                    </h3>
                    <button className="text-xs flex items-center gap-1 text-violet-600 hover:underline">
                        <Download className="w-3 h-3" />
                        Export Report
                    </button>
                </div>

                {filteredClients.length === 0 ? (
                    <div className="card text-center py-8">
                        <Dog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {clients.length === 0
                                ? 'No clients yet. Add clients to start tracking their pups.'
                                : 'No pups match your search criteria.'}
                        </p>
                    </div>
                ) : (
                    filteredClients.map((pup) => (
                        <ClientPupCard key={pup.id} pup={pup} />
                    ))
                )}
            </div>
        </div>
    );
}

// Stat Card
function StatCard({
    icon,
    label,
    value,
    color,
    alert
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    alert?: boolean;
}) {
    return (
        <div className={`card relative overflow-hidden ${alert ? 'ring-2 ring-red-500' : ''}`}>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center mb-2`}>
                {icon}
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

// Client Pup Card
function ClientPupCard({ pup }: { pup: ClientPup }) {
    // Generate avatar color
    const colors = [
        'from-amber-400 to-orange-500',
        'from-blue-400 to-indigo-500',
        'from-emerald-400 to-teal-500',
        'from-rose-400 to-pink-500',
        'from-purple-400 to-violet-500',
    ];
    const colorIndex = (pup.name.charCodeAt(0)) % colors.length;

    return (
        <div className={`card hover:shadow-lg transition-shadow cursor-pointer ${pup.alertCount > 0 ? 'border-l-4 border-l-red-500' : ''
            }`}>
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                    {pup.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 dark:text-white truncate">{pup.name}</h4>
                        {pup.alertCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                {pup.alertCount} overdue
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {pup.breed} • Owner: {pup.ownerName}
                    </p>
                </div>

                {/* Metrics */}
                <div className="hidden sm:flex items-center gap-4">
                    {/* Compliance */}
                    <div className="text-center">
                        <div className={`text-lg font-bold ${pup.vaccineCompliance >= 90 ? 'text-emerald-500' :
                            pup.vaccineCompliance >= 70 ? 'text-amber-500' :
                                'text-red-500'
                            }`}>
                            {pup.vaccineCompliance.toFixed(0)}%
                        </div>
                        <p className="text-[9px] text-slate-400 uppercase">Compliance</p>
                    </div>

                    {/* Weight */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-lg font-bold text-slate-800 dark:text-white">
                                {(pup.latestWeight / 28.35).toFixed(1)}
                            </span>
                            {pup.weightTrend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                            {pup.weightTrend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-[9px] text-slate-400 uppercase">oz</p>
                    </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
        </div>
    );
}

export default TrainerDashboard;
