
import React, { useState, useEffect } from 'react';
import { Save, Globe, Smartphone, Power, Loader2, Zap, Coins } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';

interface GlobalConfigPanelProps {
    onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const DEFAULT_REGIONS = [
    { name: 'Malaysia', code: 'MY', status: 'online', flag: '🇲🇾' },
    { name: 'Indonesia', code: 'ID', status: 'offline', flag: '🇮🇩' },
    { name: 'Singapore', code: 'SG', status: 'offline', flag: '🇸🇬' },
    { name: 'Thailand', code: 'TH', status: 'offline', flag: '🇹🇭' },
    { name: 'Philippines', code: 'PH', status: 'offline', flag: '🇵🇭' },
];

const DEFAULT_FLAGS = {
    enable_text: true,
    enable_image: true,
    enable_video: true,
    enable_autofill: true
};

export const GlobalConfigPanel: React.FC<GlobalConfigPanelProps> = ({ onToast }) => {
    const [loading, setLoading] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [regions, setRegions] = useState(DEFAULT_REGIONS);
    const [flags, setFlags] = useState(DEFAULT_FLAGS);
    
    // Credit Costs State
    const [costs, setCosts] = useState({
        text: 1,
        autofill: 1,
        image: 2,
        video: 10,
        trend: 2
    });

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('system_settings').select('*');
            if (data) {
                const map: any = {};
                data.forEach(s => map[s.key] = s.value);
                
                if (map['admin_whatsapp']) setWhatsapp(map['admin_whatsapp']);
                if (map['payment_qr_url']) setQrUrl(map['payment_qr_url']);
                
                if (map['region_config']) {
                    try { setRegions(JSON.parse(map['region_config'])); } catch {}
                }
                
                if (map['feature_flags']) {
                    try { setFlags({ ...DEFAULT_FLAGS, ...JSON.parse(map['feature_flags']) }); } catch {}
                }

                // Load Costs
                setCosts({
                    text: parseInt(map['cost_per_generation'] || '1'),
                    autofill: parseInt(map['cost_per_autofill'] || '1'),
                    image: parseInt(map['cost_per_image_generation'] || '2'),
                    video: parseInt(map['cost_per_video_generation'] || '10'),
                    trend: parseInt(map['cost_per_trend_search'] || '2')
                });
            }
        } catch (e: any) { onToast(e.message, 'error'); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = [
                { key: 'admin_whatsapp', value: whatsapp },
                { key: 'payment_qr_url', value: qrUrl },
                { key: 'region_config', value: JSON.stringify(regions) },
                { key: 'feature_flags', value: JSON.stringify(flags) },
                // Save Costs
                { key: 'cost_per_generation', value: costs.text.toString() },
                { key: 'cost_per_autofill', value: costs.autofill.toString() },
                { key: 'cost_per_image_generation', value: costs.image.toString() },
                { key: 'cost_per_video_generation', value: costs.video.toString() },
                { key: 'cost_per_trend_search', value: costs.trend.toString() }
            ];

            // Iterate and call RPC for each setting to bypass RLS policies if necessary
            for (const update of updates) {
                const { error } = await supabase.rpc('admin_update_setting', { 
                    p_key: update.key, 
                    p_value: update.value 
                });
                if (error) throw error;
            }

            onToast("Global Configuration Saved", 'success');
        } catch (e: any) { 
            console.error("Save Error:", e);
            onToast(e.message || "Failed to save settings", 'error'); 
        }
        finally { setLoading(false); }
    };

    const toggleRegion = (code: string) => {
        setRegions(prev => prev.map(r => r.code === code ? { ...r, status: r.status === 'online' ? 'offline' : 'online' } : r));
    };

    const toggleFlag = (key: keyof typeof DEFAULT_FLAGS) => {
        setFlags(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. BUSINESS IDENTITY */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Smartphone className="w-5 h-5 text-blue-500"/> Business Contact</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">WhatsApp Number (No +)</label>
                            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="60123456789" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Payment QR URL</label>
                            <div className="flex gap-4">
                                <input value={qrUrl} onChange={e => setQrUrl(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="https://..." />
                                <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0">
                                    <img src={qrUrl || '/maybank-qr.jpg'} alt="QR" className="w-full h-full object-contain"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. FEATURE FLAGS (KILL SWITCH) */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Power className="w-5 h-5 text-red-500"/> Global Feature Control</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(flags).map(([key, active]) => (
                            <div key={key} onClick={() => toggleFlag(key as any)} className={`p-3 rounded-lg border cursor-pointer transition-all ${active ? 'bg-green-900/20 border-green-900/50' : 'bg-red-900/20 border-red-900/50 opacity-60'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-bold uppercase ${active ? 'text-green-400' : 'text-red-400'}`}>{key.replace('enable_', '')}</span>
                                    <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                                </div>
                                <span className="text-[10px] text-gray-500">{active ? 'Operational' : 'Disabled'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. NEURAL CREDIT ECONOMICS (NEW) */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-500"/> Neural Credit Economics</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Text Gen</label>
                        <div className="relative">
                            <Zap className="absolute left-2 top-2 w-3 h-3 text-yellow-600"/>
                            <input type="number" value={costs.text} onChange={e => setCosts({...costs, text: parseInt(e.target.value) || 0})} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-7 pr-2 text-white text-sm font-mono" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Auto-Fill</label>
                        <div className="relative">
                            <Zap className="absolute left-2 top-2 w-3 h-3 text-yellow-600"/>
                            <input type="number" value={costs.autofill} onChange={e => setCosts({...costs, autofill: parseInt(e.target.value) || 0})} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-7 pr-2 text-white text-sm font-mono" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Image Gen</label>
                        <div className="relative">
                            <Zap className="absolute left-2 top-2 w-3 h-3 text-yellow-600"/>
                            <input type="number" value={costs.image} onChange={e => setCosts({...costs, image: parseInt(e.target.value) || 0})} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-7 pr-2 text-white text-sm font-mono" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Veo Video</label>
                        <div className="relative">
                            <Zap className="absolute left-2 top-2 w-3 h-3 text-yellow-600"/>
                            <input type="number" value={costs.video} onChange={e => setCosts({...costs, video: parseInt(e.target.value) || 0})} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-7 pr-2 text-white text-sm font-mono" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Trend Search</label>
                        <div className="relative">
                            <Zap className="absolute left-2 top-2 w-3 h-3 text-yellow-600"/>
                            <input type="number" value={costs.trend} onChange={e => setCosts({...costs, trend: parseInt(e.target.value) || 0})} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-7 pr-2 text-white text-sm font-mono" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. REGIONAL STATUS MANAGER */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-orange-500"/> Regional Gateway Status</h3>
                    <span className="text-[10px] text-gray-500 bg-black px-2 py-1 rounded border border-gray-800">Controls Wallet Modal Display</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {regions.map((r) => (
                        <div key={r.code} onClick={() => toggleRegion(r.code)} className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-105 ${r.status === 'online' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gray-800 border-gray-700 opacity-50 grayscale'}`}>
                            <div className="text-2xl mb-2">{r.flag}</div>
                            <div className="font-bold text-white text-sm">{r.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'online' ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'}`}></div>
                                <span className={`text-[10px] font-bold uppercase ${r.status === 'online' ? 'text-blue-400' : 'text-gray-500'}`}>{r.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
                <button onClick={handleSave} disabled={loading} className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} Save Global Config
                </button>
            </div>
        </div>
    );
};
