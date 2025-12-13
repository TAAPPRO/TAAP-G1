
import React, { useState, useEffect } from 'react';
import { X, Users, Share2, Loader2, AlertCircle, TrendingUp, Crown, Percent, Wallet, Info } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { License, SystemSetting } from '../types';

interface AffiliateDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    affiliate: License | null;
    settings: SystemSetting[];
}

export const AffiliateDetailsModal: React.FC<AffiliateDetailsModalProps> = ({ isOpen, onClose, affiliate, settings }) => {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && affiliate) {
            fetchReferrals();
        }
    }, [isOpen, affiliate]);

    const fetchReferrals = async () => {
        if (!affiliate) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.rpc('get_user_referrals', { p_license_key: affiliate.license_key });
            if (error) throw error;
            setReferrals(data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load referrals.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get dynamic rate
    const getRate = (key: string, fallback: number) => {
        const val = settings?.find(s => s.key === key)?.value;
        return val ? parseFloat(val) : fallback;
    };

    const rates = {
        agent: getRate('affiliate_commission_agent', 10),
        super: getRate('affiliate_commission_super', 15),
        partner: getRate('affiliate_commission_partner', 20)
    };

    const getCurrentCommissionRate = () => {
        if (!affiliate) return 0;
        if (affiliate.custom_commission_rate) return affiliate.custom_commission_rate;
        if (affiliate.affiliate_tier === 'Partner') return rates.partner;
        if (affiliate.affiliate_tier === 'Super Agent') return rates.super;
        return rates.agent;
    };

    if (!isOpen || !affiliate) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-purple-500" /> Affiliate Network
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                            User: <span className="text-white font-bold">{affiliate.user_name}</span> • Code: <span className="text-orange-400 font-bold">{affiliate.affiliate_code}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    
                    {/* PERFORMANCE SUMMARY CARD */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4"/> Performance Overview
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Current Tier</span>
                                <div className="flex items-center gap-2">
                                    <Crown className={`w-4 h-4 ${affiliate.affiliate_tier === 'Partner' ? 'text-orange-500' : 'text-blue-500'}`} />
                                    <span className="text-sm font-bold text-white">{affiliate.affiliate_tier}</span>
                                </div>
                            </div>
                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Referrals</span>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-bold text-white">{affiliate.successful_referrals || 0}</span>
                                </div>
                            </div>
                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Comm. Rate</span>
                                <div className="flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-bold text-white">{getCurrentCommissionRate()}%</span>
                                </div>
                            </div>
                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Lifetime Earned</span>
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-bold text-white font-mono">RM {Number(affiliate.total_earnings || 0).toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REFERRAL TABLE */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Referral History</h4>
                        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                            {isLoading ? (
                                <div className="p-12 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center text-red-400 flex flex-col items-center gap-2">
                                    <AlertCircle className="w-8 h-8" />
                                    <p>{error}</p>
                                </div>
                            ) : referrals.length === 0 ? (
                                <div className="p-12 flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <Users className="w-12 h-12 opacity-20" />
                                    <p>No referrals found for this user.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-black/40 text-gray-300 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="p-4">Referred User</th>
                                            <th className="p-4">Plan</th>
                                            <th className="p-4">Join Date</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {referrals.map((ref, idx) => {
                                            // SNAPSHOT CALCULATION
                                            const commission = Number(ref.commission_earned);
                                            let displayComm: React.ReactNode = <span className="font-mono text-gray-600">-</span>;

                                            if (commission > 0) {
                                                displayComm = <span className="font-mono text-green-400 font-bold">+RM {commission.toFixed(2)}</span>;
                                            } else if (ref.status === 'active' || ref.status === 'pending') {
                                                const planPrice = ref.plan_type === 'TAAP PRO' ? 199 : 69;
                                                const discount = ref.snapshot_discount || 0;
                                                const netPrice = planPrice * ((100 - discount) / 100);
                                                
                                                // Dynamic Upline Rate
                                                let rate = getCurrentCommissionRate();
                                                if(ref.snapshot_commission_rate > 0) rate = Number(ref.snapshot_commission_rate);

                                                const est = netPrice * (rate / 100);
                                                
                                                displayComm = (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-mono text-orange-400 font-bold text-[10px]">Est. RM {est.toFixed(2)}</span>
                                                        <span className="text-[9px] text-gray-600">({discount}% Disc Locked)</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                                                    <td className="p-4 font-bold text-white">{ref.user_name || 'Anonymous'}</td>
                                                    <td className="p-4">{ref.plan_type}</td>
                                                    <td className="p-4 font-mono text-xs">{new Date(ref.joined_at).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${ref.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                                            {ref.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {displayComm}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
