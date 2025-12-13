
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
    LayoutDashboard, Users, CreditCard, Settings, LogOut, 
    Activity, Shield, Megaphone, Crown, Box, Ticket,
    AlertTriangle, CheckCircle, X, Database, Menu, Bell, Search
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
import { GlobalAffiliateMonitorSection } from './admin/GlobalAffiliateMonitorModal'; // Imported as Section
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
    
    // Notifications
    const [notifications, setNotifications] = useState<{count: number, items: string[]}>({ count: 0, items: [] });
    const [showNotifications, setShowNotifications] = useState(false);

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
        fetchNotifications();
        const interval = setInterval(() => {
            refreshCurrentTab();
            fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'payouts') fetchPayouts();
        if (activeTab === 'config' || activeTab === 'packages' || activeTab === 'coupons' || activeTab === 'affiliate') { 
            fetchSettings(); 
            fetchPackages(); 
        }
        if (activeTab === 'affiliate') { fetchLeaderboard(); }
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

    const fetchNotifications = async () => {
        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

            // 1. Pending Payouts
            const { count: payoutCount } = await supabase.from('payout_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // 2. New Registrations (Last 24h)
            const { count: newUsersCount } = await supabase.from('licenses')
                .select('*', { count: 'exact', head: true })
                .gt('created_at', yesterday);

            // 3. Pending Approvals
            const { count: pendingUsersCount } = await supabase.from('licenses')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            const items = [];
            if (payoutCount && payoutCount > 0) items.push(`${payoutCount} Withdrawal Request(s) Pending`);
            if (newUsersCount && newUsersCount > 0) items.push(`${newUsersCount} New Registration(s) in 24h`);
            if (pendingUsersCount && pendingUsersCount > 0) items.push(`${pendingUsersCount} User(s) Awaiting Approval`);

            setNotifications({
                count: items.length,
                items: items
            });

        } catch (e) { console.error("Notif Error", e); }
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
        setError(null);
        
        try {
            const { data, error } = await supabase.rpc('admin_get_licenses_paginated', {
                p_page: userPage.currentPage,
                p_limit: userPage.limit,
                p_search_term: userFilters.searchTerm || null,
                p_sort_by: 'created_at',
                p_sort_dir: 'desc',
                p_ref_filter: null,
                p_status: userFilters.status === 'all' ? null : userFilters.status 
            });
            
            if (error) {
                throw error;
            } else if (data) {
                setLicensesData({ users: data.data, total: data.total });
            } else {
                setLicensesData({ users: [], total: 0 });
            }
        } catch (err: any) {
            console.error("Fetch Users Error:", err);
            let msg = err.message || "Unknown error";
            setError(msg);
            setLicensesData({ users: [], total: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPayouts = async () => {
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

    // --- MODAL HANDLERS ---
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

        setActionConfig({ type: action, title, message, confirmLabel, ids });
    };

    const handleUserActionConfirm = async (note?: string) => {
        if (!actionConfig) return;
        const { type, ids } = actionConfig;

        try {
            const { data, error } = await supabase.rpc('admin_bulk_action', { p_ids: ids, p_action: type });
            if (error) throw error;
            addToast(`Successfully processed ${data.count} users.`, 'success');
            fetchUsers();
            setSelectedUserIds([]);
        } catch (e: any) { addToast(e.message, 'error'); } 
        finally { setActionConfig(null); }
    };

    const openPayoutActionModal = (id: number, type: 'approve' | 'reject') => {
        const isApprove = type === 'approve';
        setActionConfig({
            type: isApprove ? 'approve_payout' : 'reject_payout',
            title: isApprove ? "Approve Payout" : "Reject Payout",
            message: isApprove ? "Confirm transfer of funds? This will mark request as approved." : "Reject this request? Funds will be refunded to user wallet.",
            confirmLabel: isApprove ? "Confirm Transfer" : "Reject Request",
            requiresInput: true,
            inputPlaceholder: isApprove ? "Transaction Ref / Bank Note" : "Reason for rejection",
            ids: [],
            meta: { id }
        });
    };

    const handlePayoutActionConfirm = async (note?: string) => {
        if (!actionConfig?.meta?.id) return;
        const { id } = actionConfig.meta;
        const type = actionConfig.type === 'approve_payout' ? 'approved' : 'rejected';

        try {
            const { data, error } = await supabase.rpc('process_payout', { p_payout_id: id, p_status: type, p_admin_note: note || '' });
            if (error) throw error;
            if (data && data.status === 'error') throw new Error(data.message);
            addToast(`Payout ${type}.`, 'success');
            fetchPayouts();
        } catch (e: any) { addToast(e.message, 'error'); } 
        finally { setActionConfig(null); }
    };

    const executeAction = async (note?: string) => {
        if (actionConfig?.type.includes('payout')) { await handlePayoutActionConfirm(note); } 
        else { await handleUserActionConfirm(note); }
    };

    const handleUpdateSetting = async (key: string, value: string) => {
        try {
            const { error } = await supabase.rpc('admin_update_setting', { p_key: key, p_value: value });
            if (error) throw error;
            addToast("Setting updated", 'success');
            fetchSettings();
        } catch (e: any) { addToast(e.message, 'error'); }
    };

    const handleUpdatePackage = async (id: number, updates: any) => {
        try {
            const { error } = await supabase.rpc('admin_update_package', { p_id: id, p_updates: updates });
            if (error) throw error;
            addToast("Package updated", 'success');
            fetchPackages();
        } catch (e: any) { addToast(e.message, 'error'); }
    };

    // Navigation Items
    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'monitor', label: 'Global Monitor', icon: Activity }, // NEW
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'payouts', label: 'Payout Requests', icon: CreditCard },
        { id: 'packages', label: 'Package Manager', icon: Box }, // NEW
        { id: 'coupons', label: 'Coupon Manager', icon: Ticket }, // NEW
        { id: 'affiliate', label: 'Affiliate Program', icon: Crown },
        { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone },
        { id: 'config', label: 'System Config', icon: Settings },
        { id: 'audit', label: 'Audit Trail', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans flex">
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black/80 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-red-600" />
                        <span className="font-bold text-lg tracking-tight text-white">ADMIN PANEL</span>
                    </div>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5"/></button>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === item.id ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-xl mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-300">System Online</span>
                    </div>
                    <button onClick={onExit} className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors text-sm font-bold justify-center">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-black h-[100dvh] overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-gray-800 bg-gray-900/90 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-400 hover:text-white p-1" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6"/></button>
                        <h1 className="text-sm md:text-lg font-bold text-white uppercase tracking-wider truncate">{menuItems.find(i => i.id === activeTab)?.label}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors border border-gray-700 relative"
                            >
                                <Bell className="w-4 h-4" />
                                {notifications.count > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></span>}
                            </button>
                            
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase">Recent Alerts</div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {notifications.items.length === 0 ? (
                                            <p className="p-4 text-xs text-gray-500 text-center">No new alerts.</p>
                                        ) : (
                                            notifications.items.map((item, i) => (
                                                <div key={i} className="p-3 border-b border-gray-800 text-xs text-white hover:bg-gray-800 transition-colors flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                                                    {item}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setModals({...modals, databaseSetup: true})} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors border border-gray-700" title="Database Setup">
                            <Database className="w-4 h-4" />
                        </button>
                        <button onClick={() => setModals({...modals, createUser: true})} className="bg-white text-black hover:bg-gray-200 px-3 md:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap">
                            <Users className="w-4 h-4" /> <span className="hidden md:inline">New User</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {activeTab === 'overview' && <OverviewTab metrics={metrics} loading={isLoading} error={error} refresh={fetchInitialData} onFix={() => setModals({...modals, databaseSetup: true})} leaderboard={leaderboard} logs={auditLogs} />}
                    
                    {activeTab === 'monitor' && <GlobalAffiliateMonitorSection />} 

                    {activeTab === 'users' && (
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
                            setModalState={setModals}
                            refreshCurrentTab={refreshCurrentTab}
                            onAdjustBalance={(user) => setModals({...modals, adjustBalance: user})}
                        />
                    )}

                    {activeTab === 'payouts' && (
                        <PayoutsSection 
                            payouts={payouts} 
                            loading={isLoading} 
                            filter={payoutFilter} 
                            setFilter={setPayoutFilter} 
                            onAction={openPayoutActionModal}
                            handleExportPayouts={() => {
                                const csv = "Date,Key,Amount,Status,Bank\n" + payouts.map(p => `${p.created_at},${p.license_key},${p.amount},${p.status},"${p.bank_details}"`).join("\n");
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = 'payouts.csv'; a.click();
                            }} 
                        />
                    )}

                    {activeTab === 'packages' && (
                        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Box className="w-6 h-6 text-blue-500"/> Package Manager</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {packages.map(pkg => (
                                    <PackageEditor key={pkg.id} pkg={pkg} onUpdate={(updates) => handleUpdatePackage(pkg.id, updates)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'coupons' && (
                        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Ticket className="w-6 h-6 text-green-500"/> Coupon Manager</h2>
                            </div>
                            <CouponsManager onToast={addToast} />
                        </div>
                    )}

                    {activeTab === 'affiliate' && (
                        <AffiliateProgramTab 
                            onToast={addToast} 
                            leaderboard={leaderboard} 
                            settings={settings} 
                            onUpdateSetting={handleUpdateSetting} 
                            onViewAffiliate={(aff) => setModals({...modals, affiliateDetails: aff})}
                        />
                    )}

                    {activeTab === 'broadcasts' && <BroadcastsTabContent onToast={addToast} />}
                    
                    {activeTab === 'audit' && <AuditTrailTabContent onToast={addToast} />}

                    {activeTab === 'config' && (
                        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-gray-400"/> System Configuration</h2>
                            <GlobalConfigPanel onToast={addToast} />
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[200] animate-slide-up border ${toast.type === 'success' ? 'bg-gray-900 border-green-500 text-green-400' : toast.type === 'error' ? 'bg-gray-900 border-red-500 text-red-400' : 'bg-gray-900 border-blue-500 text-blue-400'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}

            {/* Modals */}
            <CreateUserModal isOpen={modals.createUser} onClose={() => setModals({...modals, createUser: false})} onSuccess={(msg) => { addToast(msg, 'success'); fetchUsers(); }} />
            
            {modals.manageUser && (
                <UserManagementModal user={modals.manageUser} onClose={() => setModals({...modals, manageUser: null})} onUpdate={(success, msg) => { if(success) { addToast(msg, 'success'); fetchUsers(); } else addToast(msg, 'error'); }} />
            )}

            <BalanceAdjustmentModal isOpen={!!modals.adjustBalance} onClose={() => setModals({...modals, adjustBalance: null})} user={modals.adjustBalance} onSuccess={() => { addToast("Balance updated", 'success'); fetchUsers(); }} />
            
            <AffiliateDetailsModal isOpen={!!modals.affiliateDetails} onClose={() => setModals({...modals, affiliateDetails: null})} affiliate={modals.affiliateDetails} settings={settings} />
            
            <DatabaseSetupModal isOpen={modals.databaseSetup} onClose={() => setModals({...modals, databaseSetup: false})} />

            <AdminActionModal 
                isOpen={!!actionConfig} 
                onClose={() => setActionConfig(null)} 
                config={actionConfig} 
                onConfirm={executeAction} 
            />
        </div>
    );
};

export default AdminDashboard;
