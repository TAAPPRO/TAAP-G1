
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X, Loader2, FileText } from 'lucide-react';

export interface ActionConfig {
    type: 'approve' | 'reject' | 'suspend' | 'delete' | 'generic';
    title: string;
    message: string;
    confirmLabel: string;
    requiresInput?: boolean;
    inputPlaceholder?: string;
    ids: number[];
    meta?: any; // Extra data like payout ID
}

interface AdminActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: ActionConfig | null;
    onConfirm: (note?: string) => Promise<void>;
}

export const AdminActionModal: React.FC<AdminActionModalProps> = ({ isOpen, onClose, config, onConfirm }) => {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !config) return null;

    const handleConfirm = async () => {
        if (config.requiresInput && !note.trim()) {
            alert("Please enter a note/reason.");
            return;
        }
        setIsLoading(true);
        await onConfirm(note);
        setIsLoading(false);
        setNote('');
        onClose();
    };

    const isDanger = config.type === 'suspend' || config.type === 'delete' || config.type === 'reject';
    const Icon = isDanger ? AlertTriangle : CheckCircle;
    const colorClass = isDanger ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600';
    const btnClass = isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClass}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{config.title}</h3>
                            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{config.message}</p>
                            
                            {config.requiresInput && (
                                <div className="mt-4">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> {config.type === 'reject' ? 'Reason for Rejection' : 'Admin Note'}
                                    </label>
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none h-24 resize-none"
                                        placeholder={config.inputPlaceholder || "Enter details..."}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-black/30 border-t border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2 text-white text-sm font-bold rounded-lg transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 ${btnClass}`}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : config.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
