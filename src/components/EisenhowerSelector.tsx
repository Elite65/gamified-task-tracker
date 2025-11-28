import React from 'react';
import { clsx } from 'clsx';
import { EisenhowerQuadrant } from '../types';
import { Zap, Calendar, Users, Trash2 } from 'lucide-react';

interface EisenhowerSelectorProps {
    value?: EisenhowerQuadrant;
    onChange: (value: EisenhowerQuadrant) => void;
}

export const EisenhowerSelector: React.FC<EisenhowerSelectorProps> = ({ value, onChange }) => {
    const quadrants: { id: EisenhowerQuadrant; label: string; subLabel: string; icon: React.ElementType; color: string }[] = [
        {
            id: 'q1-do',
            label: 'DO',
            subLabel: 'Urgent & Important',
            icon: Zap,
            color: 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30'
        },
        {
            id: 'q2-plan',
            label: 'PLAN',
            subLabel: 'Not Urgent & Important',
            icon: Calendar,
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
        },
        {
            id: 'q3-delegate',
            label: 'DELEGATE',
            subLabel: 'Urgent & Not Important',
            icon: Users,
            color: 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
        },
        {
            id: 'q4-eliminate',
            label: 'ELIMINATE',
            subLabel: 'Not Urgent & Not Important',
            icon: Trash2,
            color: 'bg-gray-500/20 text-gray-400 border-gray-500/50 hover:bg-gray-500/30'
        },
    ];

    return (
        <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Eisenhower Matrix</label>
            <div className="grid grid-cols-2 gap-2">
                {quadrants.map((q) => {
                    const isSelected = value === q.id;
                    return (
                        <button
                            key={q.id}
                            type="button"
                            onClick={() => onChange(q.id)}
                            className={clsx(
                                "flex flex-col items-start p-3 rounded-lg border transition-all duration-200 text-left",
                                q.color,
                                isSelected ? "ring-2 ring-white border-transparent" : "opacity-70 hover:opacity-100"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <q.icon className="w-4 h-4" />
                                <span className="font-bold text-sm">{q.label}</span>
                            </div>
                            <span className="text-[10px] opacity-80">{q.subLabel}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
