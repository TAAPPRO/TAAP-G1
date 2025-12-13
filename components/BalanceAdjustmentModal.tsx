
import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { License } from '../types';

interface BalanceAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: License | null;
    onSuccess: () => void;
}

export const BalanceAdjustmentModal: React.FC<BalanceAdjustmentModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'bonus' | 'deduction'>('bonus');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const finalAmount = parseFloat(amount);
            if (isNaN(finalAmount) || finalAmount <= 0) throw new Error("Invalid amount");

            const { data, error: rpcError } = await supabase.rpc('admin_adjust_balance', {
                p_license_key: user.license_key,
                p_amount: finalAmount,
                p_is_bonus: type === 'bonus',
                p_reason: reason
            });

            if (rpcError) throw rpcError;
            if (data && data.status === 'error') throw new Error(data.message);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Operation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-500" /> Adjust Wallet Balance
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="text-sm text-gray-400">
                        Adjusting balance for: <span className="font-bold text-white">{user.user_name || 'User'}</span>
                        <div className="text-xs font-mono mt-1 text-gray-500">{user.license_key}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setType('bonus')} className={`p-3 rounded-lg border font-bold text-sm transition-all ${type === 'bonus' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Give Bonus (+)</button>
                        <button type="button" onClick={() => setType('deduction')} className={`p-3 rounded-lg border font-bold text-sm transition-all ${type === 'deduction' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Deduct/Refund (-)</button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (RM)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-lg font-mono font-bold"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason / Note</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-sm"
                            placeholder="e.g., Performance Bonus, Correction"
                            rows={2}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm flex items-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Confirm Adjustment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
