
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuditTrail } from '../types';
import { Shield, Search, Loader2, ChevronRight, ChevronDown } from 'lucide-react';

interface AuditTrailTabContentProps {
    onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuditTrailTabContent: React.FC<AuditTrailTabContentProps> = ({ onToast }) => {
    const [logs, setLogs] = useState<AuditTrail[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchAction, setSearchAction] = useState('');

    useEffect(() => { fetchLogs(); }, [searchAction]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.rpc('admin_get_audit_trail', { 
                p_page: 1, 
                p_limit: 100, 
                p_search_action: searchAction || null 
            });
            if (data?.data) setLogs(data.data);
        } catch (e: any) { onToast(e.message, 'error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-purple-500"/> Audit Trail</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Filter by Action..." 
                        value={searchAction}
                        onChange={(e) => setSearchAction(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-black border border-gray-700 rounded-lg text-sm text-white focus:border-purple-500 outline-none w-full"
                    />
                </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900 text-gray-200 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4 w-40">Timestamp</th>
                                <th className="p-4 w-32">Actor</th>
                                <th className="p-4 w-40">Action</th>
                                <th className="p-4 w-48">Target Key</th>
                                <th className="p-4">Technical Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No logs found.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-900/50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs font-bold border border-purple-900/50">
                                            {log.admin_actor}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-white">{log.action}</td>
                                    <td className="p-4 font-mono text-xs text-gray-500">{log.target_license_key || '-'}</td>
                                    <td className="p-4">
                                        <details className="group">
                                            <summary className="text-xs text-blue-400 cursor-pointer list-none flex items-center gap-1 hover:text-blue-300 transition-colors w-fit">
                                                <span className="group-open:rotate-90 transition-transform duration-200"><ChevronRight className="w-3 h-3"/></span>
                                                <span className="group-open:hidden">View Payload</span>
                                                <span className="hidden group-open:inline">Hide Payload</span>
                                            </summary>
                                            <div className="mt-2 bg-gray-950 p-3 rounded-lg border border-gray-800 shadow-inner">
                                                <pre className="text-[10px] font-mono text-green-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </div>
                                        </details>
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
