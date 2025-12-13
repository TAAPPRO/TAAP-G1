
import React, { useState } from 'react';
import { License } from '../../types';
import { X, Save, AlertTriangle, Loader2, Crown, Wallet, Calendar, Lock } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface UserManagementModalProps {
    user: License;
    onClose: () => void;
    onUpdate: (updated: boolean, msg: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState<License>(user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Ensure numeric values are sent as numbers or null, not empty strings
            const safeFloat = (val: any) => val === '' || val === null ? null : parseFloat(val);
            const safeInt = (val: any) => val === '' || val === null ? 0 : parseInt(val);

            const { error } = await supabase.rpc('admin_update_user', {
                p_id: user.id,
                p_name: formData.user_name,
                p_email: formData.user_email,
                p_phone: formData.phone_number,
                p_plan: formData.plan_type,
                p_status: formData.status,
                p_credits: safeInt(formData.credits),
                p_tier: formData.affiliate_tier,
                p_custom_rate: safeFloat(formData.custom_commission_rate),
                p_bank_name: formData.bank_name,
                p_bank_acc: formData.bank_details,
                p_bank_holder: formData.bank_holder,
                p_balance: safeFloat(formData.affiliate_balance),
                p_expiry: formData.subscription_end_date || null,
                p_affiliate_code: formData.affiliate_code,
                p_referred_by_code: formData.referred_by_code,
                p_snapshot_discount: safeFloat(formData.snapshot_discount),
                p_snapshot_commission_rate: safeFloat(formData.snapshot_commission_rate),
                p_admin_notes: formData.admin_notes
            });

            if (error) throw error;
            onUpdate(true, "User updated successfully.");
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof License, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-20">
                    <div>
                        <h3 className="text-xl font-bold text-white">Manage User</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">{user.license_key}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"><X className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-8">
                    {error && <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold"><AlertTriangle className="w-5 h-5"/> {error}</div>}
                    
                    {/* SECTION 1: IDENTITY & ACCESS */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest border-b border-blue-900/30 pb-2 mb-4">Identity & Access</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Full Name</label>
                                <input value={formData.user_name || ''} onChange={e => handleInputChange('user_name', e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Email Address</label>
                                <input value={formData.user_email || ''} onChange={e => handleInputChange('user_email', e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Account Status</label>
                                <select value={formData.status} onChange={e => handleInputChange('status', e.target.value)} className={`w-full bg-black border border-gray-700 rounded-lg p-3 text-sm font-bold outline-none uppercase ${formData.status === 'active' ? 'text-green-500' : formData.status === 'suspended' ? 'text-red-500' : 'text-orange-500'}`}>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5 flex items-center gap-2"><Calendar className="w-3 h-3"/> Sub. Expiry</label>
                                <input 
                                    type="datetime-local" 
                                    value={formData.subscription_end_date ? new Date(formData.subscription_end_date).toISOString().slice(0, 16) : ''} 
                                    onChange={e => handleInputChange('subscription_end_date', e.target.value)} 
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: CREDITS & PLAN */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-green-500 uppercase tracking-widest border-b border-green-900/30 pb-2 mb-4">Plan & Credits</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Subscription Plan</label>
                                <select value={formData.plan_type} onChange={e => handleInputChange('plan_type', e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-green-500 outline-none">
                                    <option value="Starter">Starter</option>
                                    <option value="Advance">Advance</option>
                                    <option value="TAAP PRO">TAAP PRO</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Neural Credits</label>
                                <input type="number" value={formData.credits} onChange={e => handleInputChange('credits', parseInt(e.target.value))} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm font-mono font-bold focus:border-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Ref By (Upline)</label>
                                <input value={formData.referred_by_code || ''} onChange={e => handleInputChange('referred_by_code', e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm font-mono uppercase focus:border-green-500 outline-none" placeholder="UPLINE-CODE" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: AFFILIATE ECONOMICS (NEW) */}
                    <div className="space-y-4 bg-gray-800/30 p-5 rounded-xl border border-orange-900/30">
                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest border-b border-orange-900/30 pb-2 mb-4 flex items-center gap-2">
                            <Crown className="w-4 h-4"/> Affiliate Economics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Affiliate Tier</label>
                                <select value={formData.affiliate_tier || 'Agent'} onChange={e => handleInputChange('affiliate_tier', e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none">
                                    <option value="Agent">Agent (Standard)</option>
                                    <option value="Super Agent">Super Agent</option>
                                    <option value="Partner">Partner (Elite)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Custom Commission Rate (%)</label>
                                <input 
                                    type="number" 
                                    value={formData.custom_commission_rate || ''} 
                                    onChange={e => handleInputChange('custom_commission_rate', e.target.value)} 
                                    placeholder="Default"
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none" 
                                />
                                <p className="text-[9px] text-gray-500 mt-1">Leave empty to use Tier Default.</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Affiliate Code</label>
                                <input value={formData.affiliate_code || ''} onChange={e => handleInputChange('affiliate_code', e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm font-mono uppercase focus:border-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5 flex items-center gap-2"><Wallet className="w-3 h-3"/> Wallet Balance (RM)</label>
                                <input type="number" step="0.01" value={formData.affiliate_balance} onChange={e => handleInputChange('affiliate_balance', e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm font-mono font-bold focus:border-orange-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: LOCKED SNAPSHOTS (NEW) */}
                    <div className="space-y-4 bg-gray-800/30 p-5 rounded-xl border border-purple-900/30">
                        <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest border-b border-purple-900/30 pb-2 mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4"/> Locked Deal Snapshots
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Locked Discount (%)</label>
                                <input 
                                    type="number" 
                                    value={formData.snapshot_discount || 0} 
                                    onChange={e => handleInputChange('snapshot_discount', e.target.value)} 
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none" 
                                />
                                <p className="text-[9px] text-gray-500 mt-1">Discount this user gets on renewals.</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Locked Commission Rate (%)</label>
                                <input 
                                    type="number" 
                                    value={formData.snapshot_commission_rate || 0} 
                                    onChange={e => handleInputChange('snapshot_commission_rate', e.target.value)} 
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none" 
                                />
                                <p className="text-[9px] text-gray-500 mt-1">Commission rate strictly for the upline of this user.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-4">
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Internal Admin Notes (CRM)</label>
                        <textarea value={formData.admin_notes || ''} onChange={e => handleInputChange('admin_notes', e.target.value)} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white text-sm h-24 focus:border-white/50 outline-none resize-none" placeholder="Notes..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-gray-900 pb-4 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-gray-400 hover:text-white font-bold text-sm transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-1">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
