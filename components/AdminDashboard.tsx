
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
    LayoutDashboard, Users, CreditCard, Settings, LogOut, 
    Activity, Shield, Megaphone, Crown, Save, Box, Ticket, Clock,
    AlertTriangle, CheckCircle, X, Database, Menu, ChevronLeft
} from 'lucide-react';
import { OverviewTab } from './admin/OverviewTab';
import { UserManagementSection } from './admin/UserManagementSection';
import { PayoutsSection } from './admin/PayoutsSection';
import { AffiliateProgramTab } from './admin/AffiliateProgramTab';
import { BroadcastsTabContent } from './BroadcastsTabContent';
import { AuditTrailTabContent } from './AuditTrailTabContent';
import { GlobalConfigPanel } from './admin/config/GlobalConfigPanel';
import { PackageEditor } from './admin/config/PackageEditor';
import { CouponsManager } from './admin/config/CouponsManager';
import { CreateUserModal } from './CreateUserModal';
import { UserManagementModal } from './admin/UserManagementModal';
import { BalanceAdjustmentModal } from './BalanceAdjustmentModal';
import { AffiliateDetailsModal } from './AffiliateDetailsModal';
import { DatabaseSetupModal } from './DatabaseSetupModal';
import { AdminActionModal, ActionConfig } from './admin/shared/AdminActionModal';
import { License, PayoutRequest, DashboardMetrics, SystemSetting, AuditTrail, Package } from '../types';

interface AdminDashboardProps {
    onExit: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Sidebar State

    // Data
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [licensesData, setLicensesData] = useState<{users: License[], total: number}>({ users: [], total: 0 });
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditTrail[]>([]);

    // Filters & Pagination
    const [userFilters, setUserFilters] = useState({ searchTerm: '', status: 'all' });
    const [userPage, setUserPage] = useState({ currentPage: 1, limit: 20 });
    const [payoutFilter, setPayoutFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    // Modals
    const [modals, setModals] = useState({
        createUser: false,
        manageUser: null as License | null,
        adjustBalance: null as License | null,
        affiliateDetails: null as License | null,
        databaseSetup: false
    });
    
    // Action Modal State
    const [actionConfig, setActionConfig] = useState<ActionConfig | null>(null);

    // --- EFFECTS ---
    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(refreshCurrentTab, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'payouts') fetchPayouts();
        if (activeTab === 'config') { fetchSettings(); fetchPackages(); }
        if (activeTab === 'affiliate') { fetchLeaderboard(); fetchSettings(); }
    }, [activeTab, userPage, userFilters, payoutFilter]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [activeTab]);

    // --- DATA FETCHING ---
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([fetchMetrics(), fetchLeaderboard(), fetchRecentLogs()]);
        } catch (e: any) { setError(e.message); }
        finally { setIsLoading(false); }
    };

    const refreshCurrentTab = () => {
        if (activeTab === 'overview') fetchMetrics();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'payouts') fetchPayouts();
    };

    const fetchMetrics = async () => {
        const { data, error } = await supabase.rpc('admin_get_dashboard_metrics');
        if (!error && data) setMetrics(data);
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('admin_get_licenses_paginated', {
            p_page: userPage.currentPage,
            p_limit: userPage.limit,
            p_search_term: userFilters.searchTerm || null,
            p_sort_by: 'created_at',
            p_sort_dir: 'desc',
            p_ref_filter: null 
        });
        
        if (error) {
            console.error("Fetch Users Error:", error);
            setError(error.message);
            setLicensesData({ users: [], total: 0 });
        } else if (data) {
            setLicensesData({ users: data.data, total: data.total });
            setError(null);
        } else {
            setLicensesData({ users: [], total: 0 });
        }
        setIsLoading(false);
    };

    const fetchPayouts = async () => {
        // Silent update (no loading spinner) to avoid UI flicker
        const { data } = await supabase.from('payout_requests').select('*').order('created_at', { ascending: false });
        if (data) setPayouts(data);
    };

    const fetchSettings = async () => {
        const { data } = await supabase.from('system_settings').select('*').order('key');
        if (data) setSettings(data);
    };

    const fetchPackages = async () => {
        const { data } = await supabase.from('packages').select('*').order('price');
        if (data) setPackages(data);
    };

    const fetchLeaderboard = async () => {
        const { data } = await supabase.rpc('admin_get_affiliate_leaderboard');
        if (data) setLeaderboard(data);
    };

    const fetchRecentLogs = async () => {
        const { data } = await supabase.rpc('admin_get_audit_trail', { p_page: 1, p_limit: 10 });
        if (data?.data) setAuditLogs(data.data);
    };

    // --- ACTIONS ---
    const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- NEW MODAL HANDLERS ---

    const openUserActionModal = (action: 'approve' | 'suspend' | 'delete', ids: number[]) => {
        if (!ids.length) { addToast("No users selected", 'error'); return; }
        
        let title = "";
        let message = "";
        let confirmLabel = "";
        
        switch(action) {
            case 'approve':
                title = "Approve Users";
                message = `Are you sure you want to approve ${ids.length} user(s)? This will activate their accounts and grant 30 days subscription.`;
                confirmLabel = "Approve & Activate";
                break;
            case 'suspend':
                title = "Suspend Users";
                message = `Are you sure you want to suspend ${ids.length} user(s)? They will lose access immediately.`;
                confirmLabel = "Suspend Accounts";
                break;
            case 'delete':
                title = "Delete Users";
                message = `WARNING: This action is permanent. Delete ${ids.length} user(s)?`;
                confirmLabel = "Delete Permanently";
                break;
        }

        setActionConfig({
            type: action,
            title,
            message,
            confirmLabel,
            ids,
            requiresInput: false
        });
    };

    const openPayoutModal = (id: number, type: 'approve' | 'reject') => {
        // Use specific action types for payouts to distinguish from user bulk actions
        const actionType = type === 'approve' ? 'approve_payout' : 'reject_payout';
        
        setActionConfig({
            type: actionType,
            title: type === 'approve' ? "Approve Payout" : "Reject Payout",
            message: type === 'approve' 
                ? "Confirm that you have transferred the funds. Enter transaction reference below." 
                : "Rejecting this request will refund the amount to the user's wallet.",
            confirmLabel: type === 'approve' ? "Confirm Transfer" : "Reject Request",
            ids: [id],
            requiresInput: true,
            inputPlaceholder: type === 'approve' ? "Transaction Reference / Bank Receipt ID" : "Reason for rejection (e.g. Invalid Bank Details)"
        });
    };

    const executeAction = async (note?: string) => {
        if (!actionConfig) return;

        // OPTIMISTIC UPDATE: Update UI immediately before DB call for better UX
        const previousPayouts = [...payouts];
        
        // Payout Optimistic Update
        if (['approve_payout', 'reject_payout'].includes(actionConfig.type)) {
             const status = actionConfig.type === 'approve_payout' ? 'approved' : 'rejected';
             setPayouts(prev => prev.map(p => 
                 p.id === actionConfig.ids[0] ? { ...p, status: status as any, admin_note: note || '' } : p
             ));
        }

        try {
            // USER ACTIONS (Bulk)
            if (['approve', 'suspend', 'delete'].includes(actionConfig.type)) {
                const { data, error } = await supabase.rpc('admin_bulk_action', { 
                    p_ids: actionConfig.ids, 
                    p_action: actionConfig.type 
                });
                if (error) throw error;
                addToast(`Users ${actionConfig.type}d successfully`, 'success');
                fetchUsers();
                setSelectedUserIds([]); // Clear selection
            }
            // PAYOUT ACTIONS (Single)
            else if (['approve_payout', 'reject_payout'].includes(actionConfig.type)) {
                const status = actionConfig.type === 'approve_payout' ? 'approved' : 'rejected';
                const finalNote = note || (status === 'approved' ? 'Processed' : 'Rejected by Admin');
                
                const { data, error } = await supabase.rpc('process_payout', { 
                    p_payout_id: actionConfig.ids[0], 
                    p_status: status, 
                    p_admin_note: finalNote 
                });
                
                if (error) {
                    console.error("RPC Error:", error);
                    throw error;
                }
                
                if (data && data.status === 'error') {
                    console.error("DB Function Error:", data.message);
                    throw new Error(data.message || "Action Failed");
                }
                
                // CRITICAL CHECK: Verify DB actually updated
                if (data && data.new_status !== status) {
                     setPayouts(previousPayouts); // Revert optimistic
                     throw new Error(`DB Error: Status reverted to '${data.new_status}'. Check DB constraints.`);
                }
                
                addToast(`Payout ${status}`, 'success');
            }
        } catch (e: any) {
            // Revert Optimistic Update on Error
            if (['approve_payout', 'reject_payout'].includes(actionConfig.type)) {
                setPayouts(previousPayouts);
            }
            console.error("ExecuteAction Exception:", e);
            addToast(e.message || "Action Failed", 'error');
        } finally {
            setActionConfig(null);
        }
    };

    // --- OTHER HANDLERS ---

    const handleUpdatePackage = async (id: number, updates: any) => {
        try {
            // FIX: Use RPC instead of direct update to avoid RLS issues
            const { error } = await supabase.rpc('admin_update_package', { 
                p_id: id, 
                p_updates: updates 
            });
            if (error) throw error;
            addToast("Package updated", 'success');
            fetchPackages();
        } catch (e: any) { addToast(e.message, 'error'); }
    };

    const handleSaveSetting = async (key: string, value: string) => {
        try {
            // FIX: Use RPC instead of direct update to avoid RLS issues
            const { error } = await supabase.rpc('admin_update_setting', { p_key: key, p_value: value });
            if (error) throw error;
            addToast("Setting saved", 'success');
            fetchSettings();
        } catch (e: any) { addToast(e.message, 'error'); }
    };

    const handleRunExpiryCheck = async () => {
        try {
            const { error } = await supabase.rpc('check_expired_subscriptions');
            if (error) throw error;
            addToast("Expiry check completed", 'success');
        } catch (e: any) { addToast(e.message, 'error'); }
    };

    const handleExportPayouts = () => {
        const headers = ['Date', 'License Key', 'Amount', 'Bank Details', 'Status', 'Note'];
        const csvContent = [
            headers.join(','),
            ...payouts.map(p => [
                new Date(p.created_at).toLocaleDateString(),
                p.license_key,
                p.amount,
                `"${p.bank_details}"`,
                p.status,
                `"${p.admin_note || ''}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payouts-${new Date().toISOString()}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col md:flex-row relative">
            
            {/* MOBILE HEADER */}
            <div className="md:hidden bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-white">TAAP ADMIN</span>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* SIDEBAR (Responsive) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:relative md:w-64 md:flex
            `}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-orange-600" /> TAAP ADMIN
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">Enterprise Control v7.0</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'users', icon: Users, label: 'User Management' },
                        { id: 'payouts', icon: CreditCard, label: 'Financial Requests' },
                        { id: 'affiliate', icon: Crown, label: 'Affiliate Program' },
                        { id: 'config', icon: Settings, label: 'System Config' },
                        { id: 'broadcasts', icon: Megaphone, label: 'Broadcasts' },
                        { id: 'logs', icon: Activity, label: 'Audit Trail' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <item.icon className="w-4 h-4" /> {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={() => setModals({ ...modals, databaseSetup: true })} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-gray-800 transition-all mb-2">
                        <Database className="w-4 h-4" /> DB Installer
                    </button>
                    <button onClick={onExit} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/40 font-bold text-sm transition-all">
                        <LogOut className="w-4 h-4" /> Exit Panel
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] md:h-screen bg-black">
                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border ${toast.type === 'success' ? 'bg-green-900/90 border-green-700 text-white' : toast.type === 'error' ? 'bg-red-900/90 border-red-700 text-white' : 'bg-blue-900/90 border-blue-700 text-white'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : toast.type === 'error' ? <AlertTriangle className="w-5 h-5"/> : <Activity className="w-5 h-5"/>}
                        <span className="font-bold text-sm">{toast.msg}</span>
                    </div>
                )}

                {/* Content Render */}
                {activeTab === 'overview' && (
                    <OverviewTab 
                        metrics={metrics} 
                        loading={isLoading} 
                        error={error} 
                        refresh={fetchInitialData} 
                        onFix={() => setModals({...modals, databaseSetup: true})}
                        leaderboard={leaderboard}
                        logs={auditLogs}
                    />
                )}

                {activeTab === 'users' && (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-white">User Management</h2>
                            <button onClick={() => setModals({...modals, createUser: true})} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 w-full md:w-auto justify-center">
                                <Users className="w-4 h-4" /> Create User
                            </button>
                        </div>
                        <UserManagementSection 
                            licensesData={licensesData}
                            loading={isLoading}
                            error={error}
                            filters={userFilters}
                            setFilters={setUserFilters}
                            selectedIds={selectedUserIds}
                            setSelectedIds={setSelectedUserIds}
                            onAction={openUserActionModal}
                            pagination={userPage}
                            setPagination={setUserPage}
                            setModalState={(u: any) => setModals(prev => ({ ...prev, ...u }))}
                            refreshCurrentTab={fetchUsers}
                            onAdjustBalance={(u) => setModals({...modals, adjustBalance: u})}
                        />
                    </>
                )}

                {activeTab === 'payouts' && (
                    <PayoutsSection 
                        payouts={payouts}
                        loading={isLoading}
                        filter={payoutFilter}
                        setFilter={setPayoutFilter}
                        onAction={openPayoutModal}
                        handleExportPayouts={handleExportPayouts}
                    />
                )}

                {activeTab === 'affiliate' && (
                    <AffiliateProgramTab 
                        onToast={addToast}
                        leaderboard={leaderboard}
                        settings={settings}
                        onUpdateSetting={handleSaveSetting}
                        onViewAffiliate={(u) => setModals({...modals, affiliateDetails: u})}
                    />
                )}

                {activeTab === 'config' && (
                    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-3xl font-black text-white tracking-tight">Business Command Center</h2>
                            <button onClick={handleRunExpiryCheck} className="px-5 py-2.5 bg-gray-900 border border-red-900/50 hover:bg-red-900/20 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all w-full md:w-auto justify-center"><Clock className="w-4 h-4"/> Run Expiry Check</button>
                        </div>

                        {/* NEW GLOBAL CONFIG SECTION */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3 border-b border-gray-800 pb-3"><Activity className="w-5 h-5 text-blue-500" /> Global Configuration</h3>
                            <GlobalConfigPanel onToast={addToast} />
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3 border-b border-gray-800 pb-3"><Box className="w-5 h-5 text-orange-500" /> Subscription Plans</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {packages.map(pkg => (<PackageEditor key={pkg.id} pkg={pkg} onUpdate={(updates) => handleUpdatePackage(pkg.id, updates)} />))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3 border-b border-gray-800 pb-3"><Ticket className="w-5 h-5 text-green-500" /> Coupon Management</h3>
                            <CouponsManager onToast={addToast} />
                        </div>
                        
                        {/* EXISTING NEURAL ECONOMY COSTS (Keep generic editor for fallbacks) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-3 border-b border-gray-800 pb-3"><Activity className="w-5 h-5 text-purple-500" /> Advanced Cost Settings</h3>
                                <div className="space-y-4">
                                    {settings.filter(s => s.key.startsWith('cost_')).map(s => (
                                        <div key={s.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                                            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.key.replace('cost_per_', '').replace(/_/g, ' ')}</p><p className="text-[10px] text-gray-600">{s.description}</p></div>
                                            <div className="flex items-center gap-2"><input type="number" defaultValue={s.value} id={`setting-${s.key}`} className="w-20 bg-black border border-gray-700 rounded-lg py-2 px-3 text-white text-sm font-mono text-center focus:border-blue-500 outline-none" /><button onClick={() => handleSaveSetting(s.key, (document.getElementById(`setting-${s.key}`) as HTMLInputElement).value)} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"><Save className="w-4 h-4"/></button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'broadcasts' && <BroadcastsTabContent onToast={addToast} />}
                
                {activeTab === 'logs' && <AuditTrailTabContent onToast={addToast} />}
            </main>

            {/* Modals */}
            <AdminActionModal isOpen={!!actionConfig} onClose={() => setActionConfig(null)} config={actionConfig} onConfirm={executeAction} />
            <DatabaseSetupModal isOpen={modals.databaseSetup} onClose={() => setModals({...modals, databaseSetup: false})} />
            <CreateUserModal isOpen={modals.createUser} onClose={() => setModals({...modals, createUser: false})} onSuccess={(msg) => { addToast(msg, 'success'); fetchUsers(); }} />
            {modals.manageUser && <UserManagementModal user={modals.manageUser} onClose={() => setModals({...modals, manageUser: null})} onUpdate={(success, msg) => { if(success) { addToast(msg, 'success'); fetchUsers(); } }} />}
            {modals.adjustBalance && <BalanceAdjustmentModal isOpen={!!modals.adjustBalance} onClose={() => setModals({...modals, adjustBalance: null})} user={modals.adjustBalance} onSuccess={() => { addToast("Balance updated", 'success'); fetchUsers(); }} />}
            {modals.affiliateDetails && <AffiliateDetailsModal isOpen={!!modals.affiliateDetails} onClose={() => setModals({...modals, affiliateDetails: null})} affiliate={modals.affiliateDetails} settings={settings} />}
        </div>
    );
};

export default AdminDashboard;
