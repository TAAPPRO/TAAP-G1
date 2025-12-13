
import React, { useState, useEffect } from 'react';
import { License } from '../../types';
import { Search, Loader2, CheckSquare, Square, Edit, Trash2, UserX, UserCheck, Wallet, Calendar, ChevronRight, Inbox, Database, Archive, Check, Copy } from 'lucide-react';
import { CopyToClipboard } from '../CopyToClipboard';

interface UserManagementSectionProps {
    licensesData: { users: License[], total: number };
    loading: boolean;
    error: string | null;
    filters: any;
    setFilters: (f: any) => void;
    selectedIds: number[];
    setSelectedIds: (ids: number[] | ((prev: number[]) => number[])) => void;
    onAction: (action: 'approve' | 'suspend' | 'delete', ids: number[]) => void;
    pagination: { currentPage: number, limit: number };
    setPagination: (p: any) => void;
    setModalState: (s: any) => void;
    refreshCurrentTab: () => void;
    onAdjustBalance: (user: License) => void;
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({ 
    licensesData, loading, error, filters, setFilters, selectedIds, setSelectedIds, 
    onAction, pagination, setPagination, setModalState, onAdjustBalance 
}) => {
    
    // Local state for debounced search
    const [localSearch, setLocalSearch] = useState(filters.searchTerm);

    // Debounce Effect: Only update parent filters after 500ms of inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.searchTerm) {
                setFilters({ ...filters, searchTerm: localSearch });
                setPagination({ ...pagination, currentPage: 1 }); // Reset to page 1 on search
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch]);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev: number[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === licensesData.users.length) setSelectedIds([]);
        else setSelectedIds(licensesData.users.map(u => u.id));
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getExpiryStatus = (dateStr: string | null) => {
        if (!dateStr) return { label: 'Lifetime', color: 'text-green-500' };
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { label: 'Expired', color: 'text-red-500 font-black' };
        if (diffDays <= 3) return { label: `${diffDays} Days Left`, color: 'text-orange-500 font-bold' };
        return { label: formatDate(dateStr), color: 'text-gray-400' };
    };

    // CRM Pipeline Tabs Configuration
    const tabs = [
        { id: 'pending', label: 'In Review', icon: Inbox, color: 'orange', desc: 'New Signups' },
        { id: 'active', label: 'Active Users', icon: Database, color: 'green', desc: 'Operational' },
        { id: 'suspended', label: 'Suspended', icon: Archive, color: 'red', desc: 'Expired/Banned' },
        { id: 'all', label: 'All Records', icon: Search, color: 'blue', desc: 'Search DB' }
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            
            {/* CRM PIPELINE NAV */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tabs.map((tab) => {
                    const isActive = filters.status === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setFilters({ ...filters, status: tab.id }); setPagination({...pagination, currentPage: 1}); setSelectedIds([]); }}
                            className={`
                                relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 transition-all duration-300 group
                                ${isActive 
                                    ? `bg-${tab.color}-900/20 border-${tab.color}-500/50 shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
                                    : 'bg-gray-900 border-gray-800 hover:bg-gray-800 hover:border-gray-700'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 ${isActive ? `text-${tab.color}-400` : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{tab.label}</span>
                            <span className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider hidden sm:block">{tab.desc}</span>
                            
                            {isActive && (
                                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 md:w-12 h-1 bg-${tab.color}-500 rounded-t-full`}></div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ACTION BAR & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40 border border-gray-800 p-3 rounded-xl backdrop-blur-sm sticky top-0 z-20 md:static">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-2 animate-fade-in-up bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-900/50 shrink-0">
                            <span className="text-xs font-bold text-blue-300 whitespace-nowrap">{selectedIds.length} Selected</span>
                            <div className="h-4 w-px bg-blue-800/50 mx-1"></div>
                            {filters.status === 'pending' && (
                                <button onClick={() => onAction('approve', selectedIds)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"><UserCheck className="w-3 h-3"/> Approve</button>
                            )}
                            <button onClick={() => onAction('suspend', selectedIds)} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"><UserX className="w-3 h-3"/> Suspend</button>
                            <button onClick={() => onAction('delete', selectedIds)} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"><Trash2 className="w-3 h-3"/> Delete</button>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 font-medium px-2 whitespace-nowrap hidden md:block">Select users for bulk actions</div>
                    )}
                </div>

                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search emails, names, keys..." 
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder-gray-600"
                    />
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3"/>
                        <p className="text-sm font-bold text-gray-300 animate-pulse">Syncing User Database...</p>
                    </div>
                )}

                {!loading && licensesData.users.length === 0 && (
                    <div className="p-20 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <div className="bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                            {filters.status === 'pending' ? <CheckSquare className="w-8 h-8 text-green-500/50" /> : <Search className="w-8 h-8 text-gray-600" />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-300">No Users Found</h3>
                        <p className="text-sm text-gray-600 mt-1">{filters.status === 'pending' ? 'Great job! Inbox is zero.' : 'Try adjusting your search filters.'}</p>
                    </div>
                )}

                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black text-gray-300 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 w-10 bg-black"><button onClick={toggleSelectAll} className="hover:text-white transition-colors">{selectedIds.length === licensesData.users.length && licensesData.users.length > 0 ? <CheckSquare className="w-4 h-4 text-orange-500"/> : <Square className="w-4 h-4"/>}</button></th>
                                    <th className="p-4 bg-black">User Identity</th>
                                    <th className="p-4 bg-black">Plan & Status</th>
                                    <th className="p-4 bg-black">Credits</th>
                                    <th className="p-4 bg-black">Expiry</th>
                                    <th className="p-4 bg-black">Affiliate</th>
                                    <th className="p-4 text-right bg-black">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {licensesData.users.map((user) => {
                                    const expiry = getExpiryStatus(user.subscription_end_date);
                                    const isSelected = selectedIds.includes(user.id);
                                    return (
                                        <tr key={user.id} className={`group hover:bg-gray-800/30 transition-colors ${isSelected ? 'bg-orange-900/10 border-l-2 border-orange-500' : 'border-l-2 border-transparent'}`}>
                                            <td className="p-4"><button onClick={() => toggleSelect(user.id)} className="hover:text-white transition-colors">{isSelected ? <CheckSquare className="w-4 h-4 text-orange-500"/> : <Square className="w-4 h-4"/>}</button></td>
                                            <td className="p-4">
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {user.user_name || <span className="italic text-gray-600">No Name</span>}
                                                    {user.status === 'pending' && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_orange]"></span>}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{user.user_email}</div>
                                                <div className="flex items-center gap-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                                                        <ChevronRight className="w-3 h-3"/> {user.license_key}
                                                    </div>
                                                    <CopyToClipboard text={user.license_key} className="p-1 hover:bg-gray-800 rounded text-gray-500 !bg-transparent !shadow-none h-auto w-auto" label="" copiedLabel="">
                                                        <Copy className="w-3 h-3"/>
                                                    </CopyToClipboard>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${user.status === 'active' ? 'bg-green-900/20 text-green-400 border-green-900/30' : user.status === 'suspended' ? 'bg-red-900/20 text-red-400 border-red-900/30' : 'bg-orange-900/20 text-orange-400 border-orange-900/30'}`}>{user.status}</span>
                                                <div className="text-[10px] text-gray-400 mt-1 font-bold">{user.plan_type}</div>
                                            </td>
                                            <td className="p-4 font-mono text-white font-bold">{user.credits.toLocaleString()}</td>
                                            <td className="p-4 text-xs">
                                                <div className={`flex items-center gap-1.5 ${expiry.color}`}>
                                                    <Calendar className="w-3 h-3"/> {expiry.label}
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-mono">{user.affiliate_code || '-'}</span>
                                                    <span className="text-[9px] text-gray-600">By: {user.referred_by_code || 'Direct'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {user.status === 'pending' && (
                                                        <button onClick={() => onAction('approve', [user.id])} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors" title="Quick Approve">
                                                            <UserCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => onAdjustBalance(user)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-purple-400 transition-colors border border-gray-700" title="Wallet">
                                                        <Wallet className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setModalState({ manageUser: user })} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="md:hidden space-y-3">
                    {!loading && licensesData.users.map((user) => {
                        const expiry = getExpiryStatus(user.subscription_end_date);
                        const isSelected = selectedIds.includes(user.id);
                        return (
                            <div key={user.id} onClick={() => toggleSelect(user.id)} className={`bg-gray-900 border rounded-xl p-4 transition-all active:scale-[0.98] ${isSelected ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)] bg-orange-900/10' : 'border-gray-800'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div onClick={(e) => { e.stopPropagation(); toggleSelect(user.id); }} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                            {isSelected ? <CheckSquare className="w-5 h-5" /> : user.user_name ? user.user_name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="text-white font-bold text-sm truncate w-40">{user.user_name || 'No Name'}</h4>
                                            <p className="text-xs text-gray-500 font-mono truncate w-40">{user.user_email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${user.status === 'active' ? 'bg-green-900/20 text-green-400 border border-green-900/30' : user.status === 'suspended' ? 'bg-red-900/20 text-red-400 border border-red-900/30' : 'bg-orange-900/20 text-orange-400 border border-orange-900/30'}`}>
                                        {user.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-3 bg-black/30 p-2 rounded-lg border border-gray-800">
                                    <span className="text-[10px] text-gray-500 font-mono">Key:</span>
                                    <span className="text-[10px] text-gray-300 font-mono truncate flex-1">{user.license_key}</span>
                                    <div onClick={e => e.stopPropagation()}>
                                        <CopyToClipboard text={user.license_key} className="p-1 hover:bg-gray-700 rounded text-gray-400 !bg-transparent !shadow-none h-auto w-auto" label="" copiedLabel="">
                                            <Copy className="w-3 h-3"/>
                                        </CopyToClipboard>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-black/40 rounded-lg p-2 border border-gray-800">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold">Plan</p>
                                        <p className="text-xs text-gray-300 font-bold truncate">{user.plan_type}</p>
                                    </div>
                                    <div className="bg-black/40 rounded-lg p-2 border border-gray-800">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold">Credits</p>
                                        <p className="text-xs text-white font-mono font-bold">{user.credits}</p>
                                    </div>
                                </div>

                                {/* MOBILE QUICK ACTION FOR PENDING USERS */}
                                {user.status === 'pending' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onAction('approve', [user.id]); }}
                                        className="w-full mb-3 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Check className="w-4 h-4" /> Approve User
                                    </button>
                                )}

                                <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${expiry.color}`}>
                                        <Calendar className="w-3 h-3"/> {expiry.label}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onAdjustBalance(user); }} 
                                            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-purple-900/30 hover:text-purple-400 transition-colors border border-gray-700"
                                        >
                                            <Wallet className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setModalState({ manageUser: user }); }} 
                                            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-blue-900/30 hover:text-blue-400 transition-colors border border-gray-700"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Modern Pagination */}
                <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-black/40 backdrop-blur-md rounded-b-2xl">
                    <span className="text-xs text-gray-500 font-medium hidden sm:block">
                        Showing {licensesData.users.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.currentPage * pagination.limit, licensesData.total)} of {licensesData.total}
                    </span>
                    <span className="text-xs text-gray-500 font-medium sm:hidden">
                        {licensesData.users.length} Records
                    </span>
                    <div className="flex gap-2">
                        <button disabled={pagination.currentPage === 1} onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg disabled:opacity-30 font-bold transition-all border border-gray-700">Prev</button>
                        <span className="px-3 py-2 text-xs font-bold text-gray-400 bg-gray-900 rounded-lg border border-gray-800 flex items-center">{pagination.currentPage}</span>
                        <button disabled={licensesData.users.length < pagination.limit} onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg disabled:opacity-30 font-bold transition-all border border-gray-700">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
