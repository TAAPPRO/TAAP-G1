
import React, { useState } from 'react';
import { Package } from '../../../types';
import { DollarSign, Zap, MinusCircle, ListPlus, Tag, Star, Clock, Calendar, Palette } from 'lucide-react';

interface PackageEditorProps {
    pkg: Package;
    onUpdate: (updates: any) => void;
}

export const PackageEditor: React.FC<PackageEditorProps> = ({ pkg, onUpdate }) => {
    // Robust initialization
    const [features, setFeatures] = useState<string[]>(() => {
        if (Array.isArray(pkg.features)) return pkg.features;
        if (typeof pkg.features === 'string') {
            try { 
                const parsed = JSON.parse(pkg.features);
                if (Array.isArray(parsed)) return parsed;
            } catch { return []; }
        }
        return [];
    });
    const [newFeature, setNewFeature] = useState('');

    const addFeature = () => {
        if (!newFeature.trim()) return;
        const updated = [...features, newFeature.trim()];
        setFeatures(updated);
        onUpdate({ features: JSON.stringify(updated) }); // Auto-save features
        setNewFeature('');
    };

    const removeFeature = (idx: number) => {
        const updated = features.filter((_, i) => i !== idx);
        setFeatures(updated);
        onUpdate({ features: JSON.stringify(updated) });
    };

    const themeColors = {
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
        black: 'bg-gray-800'
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className={`absolute top-0 left-0 w-1 h-full ${pkg.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            {/* Header Actions */}
            <div className="flex justify-between items-start mb-6 pl-3">
                <div>
                    <input 
                        value={pkg.name} 
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        className="bg-transparent text-xl font-bold text-white outline-none border-b border-transparent focus:border-gray-600 transition-colors w-full"
                    />
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{pkg.period}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase cursor-pointer">Active</label>
                        <input type="checkbox" checked={pkg.is_active} onChange={e => onUpdate({ is_active: e.target.checked })} className="w-4 h-4 accent-green-500 bg-gray-800 border-gray-700 rounded cursor-pointer"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-yellow-500 uppercase flex items-center gap-1 cursor-pointer"><Star className="w-3 h-3 fill-current"/> Popular</label>
                        <input type="checkbox" checked={pkg.is_popular} onChange={e => onUpdate({ is_popular: e.target.checked })} className="w-4 h-4 accent-yellow-500 bg-gray-800 border-gray-700 rounded cursor-pointer"/>
                    </div>
                </div>
            </div>
            
            {/* Pricing & Credits */}
            <div className="grid grid-cols-2 gap-4 pl-3 mb-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Price (RM)</label>
                    <div className="relative group/input">
                        <DollarSign className="w-3 h-3 absolute left-3 top-3 text-gray-500 group-focus-within/input:text-white"/>
                        <input type="number" value={pkg.price} onChange={e => onUpdate({ price: parseFloat(e.target.value) })} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-white text-sm font-bold focus:border-orange-500 outline-none transition-colors" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Old Price</label>
                    <div className="relative group/input">
                        <DollarSign className="w-3 h-3 absolute left-3 top-3 text-gray-500 group-focus-within/input:text-white"/>
                        <input type="number" value={pkg.old_price || ''} onChange={e => onUpdate({ old_price: e.target.value ? parseFloat(e.target.value) : null })} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-gray-400 text-sm font-medium focus:border-orange-500 outline-none decoration-line-through transition-colors" placeholder="0.00" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Credits</label>
                    <div className="relative group/input">
                        <Zap className="w-3 h-3 absolute left-3 top-3 text-gray-500 group-focus-within/input:text-white"/>
                        <input type="number" value={pkg.credits} onChange={e => onUpdate({ credits: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-white text-sm font-bold focus:border-orange-500 outline-none transition-colors" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Payment Ref</label>
                    <div className="relative group/input">
                        <Tag className="w-3 h-3 absolute left-3 top-3 text-gray-500 group-focus-within/input:text-white"/>
                        <input type="text" value={pkg.ref_code || ''} onChange={e => onUpdate({ ref_code: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-white text-sm font-mono focus:border-orange-500 outline-none uppercase transition-colors" />
                    </div>
                </div>
            </div>

            {/* Display Config */}
            <div className="grid grid-cols-2 gap-4 pl-3 mb-6">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Period Text</label>
                    <div className="relative group/input">
                        <Clock className="w-3 h-3 absolute left-3 top-3 text-gray-500 group-focus-within/input:text-white"/>
                        <input type="text" value={pkg.period || ''} onChange={e => onUpdate({ period: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-white text-xs focus:border-orange-500 outline-none transition-colors" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Card Theme</label>
                    <div className="relative flex items-center bg-black border border-gray-700 rounded-lg px-2 py-1.5">
                        <Palette className="w-3 h-3 text-gray-500 mr-2"/>
                        <select 
                            value={pkg.color_theme || 'blue'} 
                            onChange={e => onUpdate({ color_theme: e.target.value })} 
                            className="w-full bg-transparent text-white text-xs outline-none uppercase font-bold"
                        >
                            {Object.keys(themeColors).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className={`w-3 h-3 rounded-full ml-2 ${themeColors[pkg.color_theme as keyof typeof themeColors] || 'bg-gray-500'}`}></div>
                    </div>
                </div>
            </div>

            <div className="pl-3 border-t border-gray-800 pt-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Features List</label>
                <div className="space-y-2 mb-3">
                    {features.map((feat, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-black p-2 rounded border border-gray-800 group/item hover:border-gray-700">
                            <span className="text-gray-300">{feat}</span>
                            <button onClick={() => removeFeature(i)} className="text-red-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity"><MinusCircle className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        value={newFeature} 
                        onChange={e => setNewFeature(e.target.value)} 
                        placeholder="New feature..." 
                        className="flex-1 bg-black border border-gray-700 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500 transition-colors"
                        onKeyDown={e => e.key === 'Enter' && addFeature()}
                    />
                    <button onClick={addFeature} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded transition-colors"><ListPlus className="w-4 h-4"/></button>
                </div>
            </div>
        </div>
    );
};
