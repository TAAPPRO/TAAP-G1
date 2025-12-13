
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Network, FileText, Activity, UserCheck, Calendar, Crown, CreditCard, Lock } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

// Renamed to Section as it is no longer a modal
export const GlobalAffiliateMonitorSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'network' | 'ledger'>('network');
    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [search, setSearch] = useState('');
    const [ledgerType, setLedgerType] = useState('all');
    const [networkValue, setNetworkValue] = useState(0);

    useEffect(() => {
        setPage(1);
        fetchData();
    }, [activeTab, ledgerType]);

    useEffect(() => {
        if (page > 1) fetchData();
    }, [page]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let result;
            if (activeTab === 'network') {
                result = await supabase.rpc('admin_get_global_referrals', {
                    p_page: page,
                    p_limit: limit,
                    p_search: search || null
                });
            } else {
                result = await supabase.rpc('admin_get_global_ledger', {
                    p_page: page,
                    p_limit: limit,
                    p_search: search || null,
                    p_type: ledgerType === 'all' ? null : ledgerType
                });
            }

            if (result.data) {
                setData(result.data.data);
                setTotalCount(result.data.total);
                
                // Calculate visible network value
                if (activeTab === 'network') {
                    const sum = result.data.data.reduce((acc: number, row: any) => {
                        return acc + Number(row.admin_net_profit);
                    }, 0);
                    setNetworkValue(sum);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in space-y-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-orange-600" /> Super Admin Monitor
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">Real-time Global Network Visualization & Ledger.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="flex bg-black rounded-lg border border-gray-800 p-1">
                        <button 
                            onClick={() => setActiveTab('network')} 
                            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'network' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Network className="w-4 h-4"/> Network
                        </button>
                        <button 
                            onClick={() => setActiveTab('ledger')} 
                            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'ledger' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FileText className="w-4 h-4"/> Ledger
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'network' ? "Search Referrer/Referee..." : "Search User/Desc..."} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:border-orange-500 outline-none"
                    />
                </div>
                {activeTab === 'ledger' && (
                    <select 
                        value={ledgerType} 
                        onChange={(e) => setLedgerType(e.target.value)} 
                        className="bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-xl p-2.5 focus:border-orange-500 outline-none"
                    >
                        <option value="all">All Types</option>
                        <option value="commission">Commission</option>
                        <option value="payout_request">Payouts</option>
                        <option value="bonus">Bonus</option>
                        <option value="refund">Refunds</option>
                    </select>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 overflow-auto">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                        </div>
                    )}

                    {data.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 p-8">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>No records found matching criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black text-gray-300 uppercase font-bold text-xs sticky top-0 z-10 shadow-md">
                                {activeTab === 'network' ? (
                                    <tr>
                                        <th className="p-4 w-40">Join Date</th>
                                        <th className="p-4">Referee (Subscriber)</th>
                                        <th className="p-4">Referrer (Upline)</th>
                                        <th className="p-4 text-right">Gross Sale</th>
                                        <th className="p-4 text-right">Commission</th>
                                        <th className="p-4 text-right">Net Profit</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="p-4 w-48">Timestamp</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4 text-right">Amount</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {data.map((row, i) => {
                                    if (activeTab === 'network') {
                                        const isPaid = Number(row.commission_paid) > 0 || row.commission_processed;
                                        const isEst = !isPaid && (row.status === 'active' || row.status === 'pending');
                                        return (
                                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-gray-600"/>
                                                        <span className="font-mono text-xs">{new Date(row.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1 inline-block ${row.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        <UserCheck className="w-3 h-3 text-green-500"/> {row.referee_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3"/> {row.plan_type} 
                                                        {row.snapshot_discount > 0 && <span className="text-purple-400 font-bold">(-{row.snapshot_discount}%)</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-orange-400 flex items-center gap-2">
                                                        <Crown className="w-3 h-3"/> {row.referrer_name}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-gray-500 mt-1">
                                                        {row.referrer_code} • {row.referrer_tier}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right font-mono text-white font-bold">RM {Number(row.final_sale_amount).toFixed(2)}</td>
                                                <td className="p-4 text-right font-mono font-bold">
                                                    {isPaid ? (
                                                        <span className="text-green-400">RM {Number(row.commission_paid).toFixed(2)}</span>
                                                    ) : isEst ? (
                                                        <span className="text-orange-400">Est. {Number(row.estimated_commission).toFixed(2)}</span>
                                                    ) : <span className="text-gray-600">-</span>}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`font-mono font-black px-2 py-1 rounded ${Number(row.admin_net_profit) >= 0 ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
                                                        RM {Number(row.admin_net_profit).toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    } else {
                                        return (
                                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4 text-xs font-mono text-gray-500">{new Date(row.created_at).toLocaleString()}</td>
                                                <td className="p-4"><div className="font-bold text-white">{row.user_name}</div><div className="text-[10px] font-mono text-gray-600">{row.license_key}</div></td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border bg-gray-800 border-gray-700`}>{row.type}</span></td>
                                                <td className="p-4 text-xs text-gray-400 max-w-xs truncate">{row.description}</td>
                                                <td className={`p-4 text-right font-mono font-bold ${Number(row.amount) > 0 ? 'text-green-400' : 'text-red-400'}`}>{Number(row.amount) > 0 ? '+' : ''}RM {Math.abs(row.amount).toFixed(2)}</td>
                                            </tr>
                                        );
                                    }
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Footer Pagination */}
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">
                        Total Records: <strong className="text-white">{totalCount}</strong>
                    </span>
                    {activeTab === 'network' && (
                        <span className="text-[10px] text-gray-500 mt-0.5">
                            Network Profit: <span className="text-blue-400 font-bold">RM {networkValue.toFixed(2)}</span>
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 bg-black border border-gray-700 rounded text-xs text-white hover:bg-gray-800 disabled:opacity-50">Previous</button>
                    <span className="px-3 py-1.5 bg-gray-800 rounded text-xs text-white font-bold">{page}</span>
                    <button disabled={data.length < limit} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-black border border-gray-700 rounded text-xs text-white hover:bg-gray-800 disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};
