
import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

interface AutofillNoticeProps {
  onAcknowledge: () => void;
}

export const AutofillNotice: React.FC<AutofillNoticeProps> = ({ onAcknowledge }) => {
  return (
    <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm relative overflow-hidden animate-fade-in flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
            <div className="p-3 bg-white rounded-full text-purple-600 shadow-md border border-indigo-100">
                <Sparkles className="w-8 h-8" />
            </div>
        </div>
        <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-extrabold text-indigo-900">Auto-Fill Complete!</h3>
            <p className="text-indigo-700 text-sm mt-1">
                We have populated the product details for you. Please review and edit if necessary before generating.
            </p>
        </div>
        <button
            onClick={onAcknowledge}
            className="w-full md:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-purple-500/20"
        >
            <CheckCircle className="w-4 h-4" />
            Okay, Got it!
        </button>
    </div>
  );
};
