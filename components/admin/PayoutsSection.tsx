
import React from 'react';
import { PayoutRequest } from '../../types';
import { FileSpreadsheet, Loader2, Check, X, Clock, Banknote, CreditCard, ChevronDown } from 'lucide-react';

interface PayoutsSectionProps {
    payouts: PayoutRequest[];
    loading: boolean;
    filter: 'all' | 'pending' | 'approved' | 'rejected';
    setFilter: (f: 'all' | 'pending' | 'approved' | 'rejected') => void;
    onAction: (id: number, type: 'approve' | 'reject') => void;
    handleExportPayouts: () => void;
}

export const PayoutsSection: React.FC<PayoutsSectionProps> = ({ 
    payouts, loading, filter, setFilter, onAction, handleExportPayouts 
}) => {
    const filteredPayouts = payouts.filter((p: PayoutRequest) => filter === 'all' || p.status === filter);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Financial Requests <span className="text-gray-500 text-lg ml-2 font-medium">({payouts.length})</span></h2>
                <div className="flex gap-3 w-full md:w-auto">
                   <button onClick={handleExportPayouts} className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-700 transition-all w-full justify-center md:w-auto"><FileSpreadsheet className="w-4 h-4"/> Export CSV</button>
                </div>
             </div>
             
             <div className="space-y-4">
                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)} 
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap border ${filter === f ? 'bg-orange-600 text-white border-orange-500' : 'bg-gray-900 text-gray-500 hover:bg-gray-800 border-gray-800'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="p-12 text-center bg-gray-900/50 rounded-2xl border border-gray-800"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500"/></div>
                ) : filteredPayouts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <Banknote className="w-10 h-10 mx-auto mb-3 opacity-30"/>
                        <p>No payout requests found.</p>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-black text-gray-300 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">User Key</th>
                                            <th className="p-4 text-right">Amount</th>
                                            <th className="p-4">Bank Details</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {filteredPayouts.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="p-4 font-mono text-xs">{formatDate(p.created_at)}</td>
                                                <td className="p-4 font-mono text-white text-xs">{p.license_key}</td>
                                                <td className="p-4 text-right font-bold text-white">RM {p.amount.toFixed(2)}</td>
                                                <td className="p-4 text-xs max-w-xs truncate" title={p.bank_details}>{p.bank_details}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'approved' ? 'bg-green-900/30 text-green-400' : p.status === 'rejected' ? 'bg-red-900/30 text-red-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                                            {p.status}
                                                        </span>
                                                        {p.admin_note && <span className="text-[10px] text-gray-600 mt-1">{p.admin_note}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {p.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => onAction(p.id, 'approve')} className="p-1.5 bg-green-900/20 hover:bg-green-900/40 text-green-500 rounded-lg transition-colors border border-green-900/30" title="Approve"><Check className="w-4 h-4"/></button>
                                                            <button onClick={() => onAction(p.id, 'reject')} className="p-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg transition-colors border border-red-900/30" title="Reject"><X className="w-4 h-4"/></button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* MOBILE CARD LIST */}
                        <div className="md:hidden space-y-4">
                            {filteredPayouts.map((p: any) => (
                                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${p.status === 'approved' ? 'bg-green-900/50 text-green-400' : p.status === 'rejected' ? 'bg-red-900/50 text-red-400' : 'bg-orange-900/50 text-orange-400'}`}>
                                        {p.status}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Amount Requested</p>
                                        <h3 className="text-3xl font-black text-white flex items-baseline gap-1"><span className="text-lg text-gray-500 font-sans">RM</span>{p.amount.toFixed(2)}</h3>
                                    </div>

                                    <div className="bg-black/30 rounded-xl p-3 border border-gray-800 mb-4">
                                        <div className="flex items-start gap-2 mb-2">
                                            <CreditCard className="w-3 h-3 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Bank Details</p>
                                                <p className="text-xs text-gray-300 font-medium break-all">{p.bank_details}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-gray-500" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Requested On</p>
                                                <p className="text-xs text-gray-300 font-mono">{formatDate(p.created_at)} <span className="text-gray-600">{formatTime(p.created_at)}</span></p>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-800">
                                            <p className="text-[10px] text-gray-500">License: <span className="font-mono text-gray-400">{p.license_key}</span></p>
                                        </div>
                                    </div>

                                    {p.admin_note && (
                                        <div className="mb-4 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                                            <p className="text-[10px] text-gray-400 italic">Note: {p.admin_note}</p>
                                        </div>
                                    )}

                                    {p.status === 'pending' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => onAction(p.id, 'approve')} className="py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"><Check className="w-4 h-4"/> Approve</button>
                                            <button onClick={() => onAction(p.id, 'reject')} className="py-3 bg-gray-800 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-gray-700 hover:border-red-900/50"><X className="w-4 h-4"/> Reject</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
             </div>
        </div>
    );
};