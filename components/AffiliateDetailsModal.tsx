
import React, { useState, useEffect } from 'react';
import { X, Users, Share2, Loader2, AlertCircle } from 'lucide-react';
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

    if (!isOpen || !affiliate) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-purple-500" /> Affiliate Network
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Network for <span className="text-white font-bold">{affiliate.user_name}</span> ({affiliate.affiliate_code})
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-400 flex flex-col items-center gap-2">
                            <AlertCircle className="w-8 h-8" />
                            <p>{error}</p>
                        </div>
                    ) : referrals.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                            <Users className="w-12 h-12 opacity-20" />
                            <p>No referrals found for this user.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-gray-800 text-gray-300 font-bold uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="p-4">Referred User</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Join Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
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
                                        let rate = rates.agent;
                                        if (affiliate.custom_commission_rate) rate = affiliate.custom_commission_rate;
                                        else if (affiliate.affiliate_tier === 'Super Agent') rate = rates.super;
                                        else if (affiliate.affiliate_tier === 'Partner') rate = rates.partner;

                                        const est = netPrice * (rate / 100);
                                        
                                        displayComm = (
                                            <div className="flex flex-col items-end">
                                                <span className="font-mono text-orange-400 font-bold text-[10px]">Est. RM {est.toFixed(2)}</span>
                                                <span className="text-[9px] text-gray-600">({discount}% Disc Locked)</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4 font-bold text-white">{ref.user_name || 'Anonymous'}</td>
                                            <td className="p-4">{ref.plan_type}</td>
                                            <td className="p-4 font-mono text-xs">{new Date(ref.joined_at).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${ref.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
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
                
                <div className="p-4 bg-gray-900 border-t border-gray-800 text-right">
                    <span className="text-gray-500 text-xs font-bold uppercase mr-2">Total Earnings</span>
                    <span className="text-white font-mono font-bold text-xl">RM {affiliate.total_earnings?.toFixed(2) || '0.00'}</span>
                </div>
            </div>
        </div>
    );
};
