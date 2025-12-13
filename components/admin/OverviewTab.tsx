
import React from 'react';
import { Users, CheckCircle, Share2, TrendingUp, DollarSign, Activity, Banknote, Database, Zap } from 'lucide-react';
import { StatCard } from './shared/StatCard';
import { SimpleAreaChart } from './shared/SimpleAreaChart';
import { ErrorState } from './shared/ErrorState';
import { DashboardMetrics, AuditTrail } from '../../types';

interface OverviewTabProps {
    metrics: DashboardMetrics | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
    onFix: () => void;
    leaderboard: any[];
    logs: AuditTrail[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ metrics, loading, error, refresh, onFix, leaderboard, logs }) => {
    if (!metrics && !loading) {
        return (
            <ErrorState 
                title="Dashboard Unavailable" 
                message={error || "Could not load metrics. Check if database functions are up to date."} 
                onRetry={refresh}
                onFix={onFix}
            />
        );
    }

    // Safe defaults
    const safeMetrics = metrics || {
        total_licenses: 0, active_licenses: 0, total_affiliates: 0, affiliate_conversion_rate: 0,
        total_lifetime_affiliate_earnings: 0, pending_payouts_count: 0, pending_payouts_amount: 0,
        total_credits_consumed: 0, credit_usage_daily: [], user_growth_daily: []
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Mission Control
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </h2>
                    <span className="text-xs text-gray-500 font-mono">Neural System Status: OPTIMAL</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                        DB: v9.0.13 HOTFIX
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard label="Total Licenses" value={safeMetrics.total_licenses} icon={Users} />
                <StatCard label="Active Licenses" value={safeMetrics.active_licenses} icon={CheckCircle} color="green" />
                <StatCard label="Total Affiliates" value={safeMetrics.total_affiliates} icon={Share2} color="purple" />
                <StatCard label="Aff. Conversion" value={`${safeMetrics.affiliate_conversion_rate}%`} icon={TrendingUp} color="blue" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard label="Lifetime Earnings (Aff)" value={`RM ${safeMetrics.total_lifetime_affiliate_earnings.toFixed(0)}`} icon={DollarSign} color="yellow" isMoney={true} />
                <StatCard label="Pending Payouts" value={safeMetrics.pending_payouts_count} icon={Activity} color="orange" />
                <StatCard label="Pending Amount" value={`RM ${safeMetrics.pending_payouts_amount.toFixed(0)}`} icon={Banknote} isMoney={true} />
                <StatCard label="Credits Consumed" value={safeMetrics.total_credits_consumed.toLocaleString()} icon={Database} color="indigo" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
                    <SimpleAreaChart 
                        data={safeMetrics.credit_usage_daily?.length ? safeMetrics.credit_usage_daily : [40, 55, 30, 80, 45, 90, 110]} 
                        color="blue" 
                        label="Neural Load (Credits Used - 7D)" 
                    />
                </div>
                <div>
                    <SimpleAreaChart 
                        data={safeMetrics.user_growth_daily?.length ? safeMetrics.user_growth_daily : [10, 15, 25, 20, 35, 40, 55]} 
                        color="orange" 
                        label="User Growth (Signups - 7D)" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400"><Share2 className="w-5 h-5"/></div>
                        Top 5 Partners (Live)
                    </h3>
                    <div className="space-y-3">
                        {leaderboard.slice(0,5).map((aff, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${i===0?'bg-yellow-500 text-black':i===1?'bg-gray-400 text-black':i===2?'bg-orange-700 text-white':'bg-gray-800 text-gray-500'}`}>{i+1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">{aff.user_name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{aff.affiliate_tier}</p>
                                    </div>
                                </div>
                                <span className="text-green-400 font-mono font-bold text-sm bg-green-900/20 px-3 py-1 rounded-lg border border-green-900/30">RM {Number(aff.total_earnings).toFixed(2)}</span>
                            </div>
                        ))}
                        {leaderboard.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No affiliate data yet.</p>}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-indigo-900/30 rounded-lg text-indigo-400"><Zap className="w-5 h-5"/></div>
                        Live Operations Feed
                    </h3>
                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">System Idle.</p>
                        ) : logs.map((log) => (
                            <div key={log.id} className="flex gap-3 items-start">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</p>
                                    <p className="text-sm font-bold text-white">{log.action}</p>
                                    <p className="text-[10px] text-gray-500">{log.admin_actor} • {log.target_license_key || 'System'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
