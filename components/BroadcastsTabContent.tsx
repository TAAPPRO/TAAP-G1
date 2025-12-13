
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Broadcast } from '../types';
import { Megaphone, Plus, Trash2, Edit, Save, X, CheckCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface BroadcastsTabContentProps {
    onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const BroadcastsTabContent: React.FC<BroadcastsTabContentProps> = ({ onToast }) => {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '', type: 'info', expires_in_days: 7 });

    useEffect(() => { fetchBroadcasts(); }, []);

    const fetchBroadcasts = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.rpc('admin_get_broadcasts', { p_page: 1, p_limit: 50 });
            if (data?.data) setBroadcasts(data.data);
        } catch (e: any) { onToast(e.message, 'error'); } 
        finally { setLoading(false); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + formData.expires_in_days);
            
            const { data, error } = await supabase.rpc('admin_create_broadcast', {
                p_title: formData.title,
                p_message: formData.message,
                p_type: formData.type,
                p_is_active: true,
                p_expires_at: expiresAt.toISOString()
            });
            
            if (error) throw error;
            onToast("Broadcast published!", 'success');
            setIsCreating(false);
            setFormData({ title: '', message: '', type: 'info', expires_in_days: 7 });
            fetchBroadcasts();
        } catch (e: any) { onToast(e.message, 'error'); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this broadcast?")) return;
        try {
            await supabase.rpc('admin_delete_broadcast', { p_id: id });
            onToast("Broadcast deleted.", 'success');
            fetchBroadcasts();
        } catch (e: any) { onToast(e.message, 'error'); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">System Broadcasts</h2>
                <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Announcement
                </button>
            </div>

            {isCreating && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4">Draft New Broadcast</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none" />
                        <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Message content..." className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none h-24" />
                        <div className="flex gap-4">
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                                <option value="info">Info (Blue)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="success">Success (Green)</option>
                            </select>
                            <input type="number" value={formData.expires_in_days} onChange={e => setFormData({...formData, expires_in_days: parseInt(e.target.value)})} placeholder="Days to show" className="bg-black border border-gray-700 rounded-lg p-3 text-white w-32" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">Publish</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {loading ? <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500"/></div> : broadcasts.length === 0 ? <p className="text-gray-500 text-center">No active broadcasts.</p> : broadcasts.map(b => (
                    <div key={b.id} className="bg-black border border-gray-800 rounded-xl p-4 flex justify-between items-start group hover:border-gray-700 transition-colors">
                        <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${b.type === 'warning' ? 'bg-yellow-900/30 text-yellow-500' : b.type === 'success' ? 'bg-green-900/30 text-green-500' : 'bg-blue-900/30 text-blue-500'}`}>
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{b.title}</h4>
                                <p className="text-gray-400 text-xs mt-1">{b.message}</p>
                                <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                                    <span>Active: {b.is_active ? 'Yes' : 'No'}</span>
                                    <span>Expires: {new Date(b.expires_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(b.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
