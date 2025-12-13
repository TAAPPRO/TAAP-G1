
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'indigo' | 'red';
    isMoney?: boolean;
    subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color = 'blue', isMoney = false, subtext }) => {
    const colorClasses = {
        blue: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
        green: 'bg-green-900/20 text-green-400 border-green-900/30',
        purple: 'bg-purple-900/20 text-purple-400 border-purple-900/30',
        orange: 'bg-orange-900/20 text-orange-400 border-orange-900/30',
        yellow: 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30',
        indigo: 'bg-indigo-900/20 text-indigo-400 border-indigo-900/30',
        red: 'bg-red-900/20 text-red-400 border-red-900/30',
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg hover:border-gray-700 transition-all flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-lg border ${colorClasses[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-2xl font-black text-white ${isMoney ? 'font-mono' : ''}`}>
                    {value}
                </p>
            </div>
            {subtext && <p className="text-[10px] text-gray-500 mt-2 font-medium">{subtext}</p>}
        </div>
    );
};
