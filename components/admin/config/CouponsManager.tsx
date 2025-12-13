
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { Loader2, Trash2 } from 'lucide-react';

interface CouponsManagerProps {
    onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CouponsManager: React.FC<CouponsManagerProps> = ({ onToast }) => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newCoupon, setNewCoupon] = useState({ code: '', discount_value: 10, discount_type: 'percentage', usage_limit: 100 });

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (data) setCoupons(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newCoupon.code) return;
        
        // FIX: Use RPC to bypass RLS
        const { error } = await supabase.rpc('admin_manage_coupon', {
            p_action: 'create',
            p_id: 0, // Dummy ID for creation
            p_code: newCoupon.code.toUpperCase(),
            p_value: newCoupon.discount_value,
            p_type: newCoupon.discount_type,
            p_limit: newCoupon.usage_limit
        });

        if (error) onToast(error.message, 'error');
        else {
            onToast("Coupon created", 'success');
            setNewCoupon({ code: '', discount_value: 10, discount_type: 'percentage', usage_limit: 100 });
            fetchCoupons();
        }
    };

    const handleDelete = async (id: number) => {
        if(!confirm("Delete this coupon?")) return;
        
        // FIX: Use RPC to bypass RLS
        const { error } = await supabase.rpc('admin_manage_coupon', {
            p_action: 'delete',
            p_id: id,
            p_code: '', 
            p_value: 0, 
            p_type: '', 
            p_limit: 0
        });

        if (error) onToast(error.message, 'error');
        else {
            fetchCoupons();
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end border-b border-gray-800 pb-6">
                <div className="md:col-span-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Code</label>
                    <input value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm uppercase" placeholder="PROMO2025" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Value</label>
                    <input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon({...newCoupon, discount_value: parseFloat(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Type</label>
                    <select value={newCoupon.discount_type} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (RM)</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Limit</label>
                    <input type="number" value={newCoupon.usage_limit} onChange={e => setNewCoupon({...newCoupon, usage_limit: parseInt(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm" />
                </div>
                <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-sm h-[38px]">Create Coupon</button>
            </div>

            {loading ? <div className="text-center p-4"><Loader2 className="w-5 h-5 animate-spin mx-auto"/></div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-400">
                        <thead className="bg-black text-gray-500 uppercase"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Usage</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr></thead>
                        <tbody className="divide-y divide-gray-800">
                            {coupons.map(c => (
                                <tr key={c.id}>
                                    <td className="p-3 font-bold text-white">{c.code}</td>
                                    <td className="p-3">{c.discount_value}{c.discount_type === 'percentage' ? '%' : ' RM'}</td>
                                    <td className="p-3">{c.used_count} / {c.usage_limit}</td>
                                    <td className="p-3"><span className={`px-2 py-0.5 rounded ${c.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="p-3 text-right"><button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
