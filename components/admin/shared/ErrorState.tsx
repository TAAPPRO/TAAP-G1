
import React from 'react';
import { ServerCrash, Wrench } from 'lucide-react';

interface ErrorStateProps {
    title: string;
    message: string;
    onRetry: () => void;
    onFix: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, message, onRetry, onFix }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 border border-gray-800 rounded-2xl text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border border-red-900/30">
            <ServerCrash className="w-8 h-8 text-red-500" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-400 text-sm max-w-md mt-2">{message}</p>
        </div>
        <div className="flex gap-3">
            <button onClick={onRetry} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-bold transition-colors">
                Retry Connection
            </button>
            <button onClick={onFix} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Run Repair Tool
            </button>
        </div>
    </div>
);
