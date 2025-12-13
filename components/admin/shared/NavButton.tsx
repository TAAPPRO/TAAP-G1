
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs transition-all duration-200 group ${active ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
        <span>{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
    </button>
);
