
import React, { useState } from 'react';
import { X, User, Mail, Phone, CreditCard, Activity, Code, Plus, AlertTriangle, Loader2, Lock, Percent } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { NewUserInput } from '../types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<NewUserInput & { snapshot_discount: number, snapshot_commission_rate: number }>({
        user_name: '',
        user_email: '',
        phone_number: '',
        plan_type: 'Starter',
        initial_credits: 200,
        status: 'pending',
        affiliate_code: '',
        referred_by_code: '',
        snapshot_discount: 0,
        snapshot_commission_rate: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Using a raw INSERT or creating a new RPC that accepts snapshots would be ideal.
            // For now, we reuse `admin_create_user` and then do an immediate UPDATE if snapshots are non-zero.
            // This is a safe workaround without changing the RPC signature again immediately.
            
            const { data, error: rpcError } = await supabase.rpc('admin_create_user', {
                p_name: formData.user_name,
                p_email: formData.user_email,
                p_phone: formData.phone_number,
                p_plan: formData.plan_type,
                p_initial_credits: formData.initial_credits,
                p_status: formData.status,
                p_affiliate_code: formData.affiliate_code || null,
                p_referred_by_code: formData.referred_by_code || null
            });

            if (rpcError) throw rpcError;
            if (data && data.status === 'error') throw new Error(data.message);

            // If snapshots are set, update them immediately
            if (formData.snapshot_discount > 0 || formData.snapshot_commission_rate > 0) {
                const { error: updateError } = await supabase.from('licenses')
                    .update({ 
                        snapshot_discount: formData.snapshot_discount,
                        snapshot_commission_rate: formData.snapshot_commission_rate 
                    })
                    .eq('license_key', data.license_key);
                
                if (updateError) console.warn("Failed to set snapshots:", updateError);
            }

            onSuccess(`New user "${formData.user_name}" created successfully. Key: ${data.license_key}`);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-green-500" /> Create New User
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleCreateUser} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
                            <User className="w-4 h-4" /> User Identity
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="user_name"
                                    value={formData.user_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="user_email"
                                    value={formData.user_email}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-4 pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-wider mb-2">
                            <CreditCard className="w-4 h-4" /> Account & Plan
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Type</label>
                                <select
                                    name="plan_type"
                                    value={formData.plan_type}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                                >
                                    <option value="Starter">Starter (Basic)</option>
                                    <option value="Advance">Advance</option>
                                    <option value="TAAP PRO">TAAP PRO (Premium)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Credits</label>
                                <input
                                    type="number"
                                    name="initial_credits"
                                    value={formData.initial_credits}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none font-mono"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Affiliate & Snapshots */}
                    <div className="space-y-4 pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2">
                            <Code className="w-4 h-4" /> Network & Economics
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Affiliate Code (Self)</label>
                                <input
                                    type="text"
                                    name="affiliate_code"
                                    value={formData.affiliate_code || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none uppercase"
                                    placeholder="Auto-Generate if Empty"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Referred By (Upline)</label>
                                <input
                                    type="text"
                                    name="referred_by_code"
                                    value={formData.referred_by_code || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none uppercase"
                                    placeholder="UPLINE-CODE"
                                />
                            </div>
                        </div>

                        {/* LOCKED ECONOMICS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 mt-2">
                            <div>
                                <label className="block text-[10px] font-bold text-purple-400 uppercase mb-1 flex items-center gap-1"><Percent className="w-3 h-3"/> Locked Discount</label>
                                <input
                                    type="number"
                                    name="snapshot_discount"
                                    value={formData.snapshot_discount}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 outline-none text-sm"
                                    min="0"
                                    placeholder="0"
                                />
                                <p className="text-[9px] text-gray-500 mt-1">Permanent discount for this user.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-purple-400 uppercase mb-1 flex items-center gap-1"><Lock className="w-3 h-3"/> Locked Commission</label>
                                <input
                                    type="number"
                                    name="snapshot_commission_rate"
                                    value={formData.snapshot_commission_rate}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 outline-none text-sm"
                                    min="0"
                                    placeholder="0"
                                />
                                <p className="text-[9px] text-gray-500 mt-1">Rate for the Upline (Overrides Tier).</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
