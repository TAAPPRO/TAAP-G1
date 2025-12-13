
import React from 'react';
import { Crown, Ticket, Save, Users2, Star, Trophy, TrendingUp, Layers, Target, CheckCircle, DollarSign, Wallet } from 'lucide-react';
import { SystemSetting, License } from '../../types';
import { StatCard } from './shared/StatCard';

interface AffiliateProgramTabProps {
    onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    leaderboard: any[];
    settings: SystemSetting[];
    onUpdateSetting: (key: string, value: string) => void;
    onViewAffiliate: (affiliate: License) => void;
}

export const AffiliateProgramTab: React.FC<AffiliateProgramTabProps> = ({ 
    onToast, leaderboard, settings, onUpdateSetting, onViewAffiliate 
}) => {
    const getSettingVal = (key: string) => settings?.find((s: any) => s.key === key)?.value || '0';

    // Calculate Aggregate Stats
    const totalEarnings = leaderboard.reduce((acc, curr) => acc + Number(curr.total_earnings), 0);
    const activeAffiliates = leaderboard.filter(l => l.referral_count > 0).length;
    const topEarner = leaderboard.length > 0 ? Number(leaderboard[0].total_earnings) : 0;

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Crown className="w-8 h-8 text-orange-500" /> Affiliate Ecosystem
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Control Global Acquisition Strategy & Tiering Logic.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800 text-xs text-gray-400 font-mono flex items-center">
                        System Mode: DYNAMIC_TIER_V2
                    </div>
                </div>
            </div>

            {/* PROGRAM STATISTICS OVERVIEW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Payouts" value={`RM ${totalEarnings.toFixed(0)}`} icon={DollarSign} color="green" isMoney={true} />
                <StatCard label="Active Affiliates" value={activeAffiliates} icon={Users2} color="blue" />
                <StatCard label="Top Earner" value={`RM ${topEarner.toFixed(0)}`} icon={Trophy} color="yellow" isMoney={true} />
                <StatCard label="Avg. Commission" value={`RM ${(activeAffiliates > 0 ? totalEarnings / activeAffiliates : 0).toFixed(0)}`} icon={Wallet} color="purple" isMoney={true} />
            </div>
            
            {/* CONFIGURATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* 1. ACQUISITION STRATEGY */}
                <div className="md:col-span-3 bg-gradient-to-br from-green-900/20 to-green-950/20 border border-green-900/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-green-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Ticket className="w-20 h-20 text-green-500" /></div>
                    <div>
                        <h4 className="text-green-400 font-bold uppercase text-xs tracking-widest mb-1 flex items-center gap-2"><Ticket className="w-3 h-3"/> Acquisition Strategy</h4>
                        <h3 className="text-white font-bold text-lg mb-4">Member Code Discount</h3>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Global discount given to <strong>New Subscribers</strong> when they use any affiliate's referral code.
                        </p>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl p-3 border border-green-900/30 flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input 
                                type="number" 
                                id="setting-referral_discount_percent" 
                                defaultValue={getSettingVal('referral_discount_percent')} 
                                className="w-full bg-transparent text-2xl font-black text-white text-center outline-none"
                            />
                            <span className="absolute right-2 top-2 text-xs font-bold text-gray-600">% OFF</span>
                        </div>
                        <button 
                            onClick={() => onUpdateSetting('referral_discount_percent', (document.getElementById('setting-referral_discount_percent') as HTMLInputElement).value)}
                            className="bg-green-600 hover:bg-green-500 text-white p-2.5 rounded-lg shadow-lg"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 2. TIER CONFIGURATION LADDER */}
                <div className="md:col-span-9 bg-gray-900 border border-gray-800 rounded-2xl p-6 relative">
                    <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><Layers className="w-3 h-3"/> Tier Progression Logic</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10 transform -translate-y-1/2"></div>

                        {[
                            { 
                                key: 'affiliate_commission_agent', 
                                label: 'Agent', 
                                sub: 'Level 1', 
                                reqKey: null, 
                                reqLabel: 'Open to All',
                                color: 'blue', 
                                icon: Users2 
                            },
                            { 
                                key: 'affiliate_commission_super', 
                                label: 'Super Agent', 
                                sub: 'Level 2', 
                                reqKey: 'tier_req_super_agent', 
                                reqLabel: 'Unlock Requirement',
                                color: 'purple', 
                                icon: Star 
                            },
                            { 
                                key: 'affiliate_commission_partner', 
                                label: 'Partner', 
                                sub: 'Level 3 (Elite)', 
                                reqKey: 'tier_req_partner', 
                                reqLabel: 'Unlock Requirement',
                                color: 'orange', 
                                icon: Crown 
                            },
                        ].map((tier, idx) => (
                            <div key={tier.key} className={`bg-black rounded-xl border-2 border-gray-800 p-4 relative overflow-hidden group hover:border-${tier.color}-500/50 transition-all hover:-translate-y-1 shadow-lg`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg bg-${tier.color}-900/20 text-${tier.color}-400 ring-1 ring-${tier.color}-900/30`}>
                                        <tier.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black text-gray-600 bg-gray-900 px-2 py-0.5 rounded">{tier.sub}</span>
                                </div>
                                
                                <h3 className={`text-lg font-bold text-${tier.color}-400`}>{tier.label}</h3>
                                
                                <div className="space-y-4 mt-4">
                                    {/* COMMISSION RATE */}
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Commission Rate</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 flex items-center px-3 py-2 group-hover:border-gray-700 transition-colors">
                                                <input 
                                                    type="number" 
                                                    id={`tier-${tier.key}`} 
                                                    defaultValue={getSettingVal(tier.key)} 
                                                    className="w-full bg-transparent text-white font-bold text-lg outline-none"
                                                />
                                                <span className="text-gray-500 font-bold text-xs">%</span>
                                            </div>
                                            <button 
                                                onClick={() => onUpdateSetting(tier.key, (document.getElementById(`tier-${tier.key}`) as HTMLInputElement).value)}
                                                className="bg-gray-800 hover:bg-white hover:text-black text-gray-400 p-3 rounded-lg transition-colors"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* THRESHOLD REQUIREMENT */}
                                    {tier.reqKey ? (
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1 flex items-center gap-1"><Target className="w-3 h-3"/> {tier.reqLabel}</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 flex items-center px-3 py-2 group-hover:border-gray-700 transition-colors">
                                                    <input 
                                                        type="number" 
                                                        id={`req-${tier.reqKey}`} 
                                                        defaultValue={getSettingVal(tier.reqKey)} 
                                                        className="w-full bg-transparent text-gray-300 font-bold text-sm outline-none"
                                                    />
                                                    <span className="text-[9px] text-gray-600 ml-1">REFS</span>
                                                </div>
                                                <button 
                                                    onClick={() => onUpdateSetting(tier.reqKey!, (document.getElementById(`req-${tier.reqKey}`) as HTMLInputElement).value)}
                                                    className="bg-gray-800 hover:bg-white hover:text-black text-gray-400 p-2.5 rounded-lg transition-colors"
                                                >
                                                    <Save className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-[52px] flex items-end">
                                            <div className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800 w-full text-center flex items-center justify-center gap-1">
                                                <CheckCircle className="w-3 h-3"/> Default Entry
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. LEADERBOARD */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" /> Performance Leaderboard
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3"/> LIVE METRICS
                        </span>
                    </div>
                </div>
                
                <div className="overflow-hidden rounded-xl border border-gray-800">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-black text-gray-300 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-16 text-center">Rank</th>
                                <th className="p-4">Partner Name</th>
                                <th className="p-4">Tier Level</th>
                                <th className="p-4">Referrals</th>
                                <th className="p-4 text-right">Total Earnings</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50 bg-gray-900/50">
                            {leaderboard.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No data available.</td></tr>
                            ) : leaderboard.map((l: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-800/50 transition-colors group cursor-pointer" onClick={() => onViewAffiliate(l)}>
                                    <td className="p-4 text-center">
                                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black ${i===0?'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20':i===1?'bg-gray-400 text-black':i===2?'bg-orange-700 text-white':'bg-gray-800 text-gray-500'}`}>{i+1}</div>
                                    </td>
                                    <td className="p-4 font-bold text-white group-hover:text-orange-400 transition-colors">
                                        {l.user_name}
                                        <div className="text-[10px] text-gray-600 font-mono mt-0.5 group-hover:text-gray-500">{l.license_key}</div>
                                    </td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${l.affiliate_tier === 'Partner' ? 'text-purple-400 bg-purple-900/20 border-purple-900/50' : l.affiliate_tier === 'Super Agent' ? 'text-blue-400 bg-blue-900/20 border-blue-900/50' : 'text-gray-400 bg-gray-800 border-gray-700'}`}>{l.affiliate_tier}</span></td>
                                    <td className="p-4 text-white font-mono">{l.referral_count}</td>
                                    <td className="p-4 text-right font-mono text-green-400 font-bold">RM {Number(l.total_earnings).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="p-4 text-right">
                                        {/* Updated to not need Eye Icon as row is clickable */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
