
import React from 'react';

interface SimpleAreaChartProps {
    data: number[];
    color?: 'blue' | 'orange' | 'green' | 'purple';
    label: string;
}

export const SimpleAreaChart: React.FC<SimpleAreaChartProps> = ({ data, color = 'blue', label }) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min;
    const height = 60;
    const width = 100;
    
    // Generate SVG path
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `${points} ${width},${height} 0,${height}`;
    
    const colors = {
        blue: { stroke: '#3b82f6', fill: '#3b82f6' },
        orange: { stroke: '#f97316', fill: '#f97316' },
        green: { stroke: '#22c55e', fill: '#22c55e' },
        purple: { stroke: '#a855f7', fill: '#a855f7' }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                <span className={`text-xs font-bold text-${color}-400`}>{data[data.length-1]}</span>
            </div>
            <div className="w-full h-[60px] relative overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors[color].fill} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={colors[color].fill} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polygon points={fillPath} fill={`url(#gradient-${color})`} />
                    <polyline points={points} fill="none" stroke={colors[color].stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};
