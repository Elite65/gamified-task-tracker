import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Habit, HabitLog } from '../types';
import { Check, Plus, Minus, Flame, TrendingUp, Edit2 } from 'lucide-react';
import { HabitModal } from './CreateHabitModal';

interface HabitCardProps {
    habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
    const { habitLogs, logHabit } = useGame();
    const [inputValue, setInputValue] = useState<string>('');
    const [isLogging, setIsLogging] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // 1. Calculate Today's Date
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 2. Get Today's Log
    const todayLog = habitLogs.find(l => l.habitId === habit.id && l.date === dateString);
    const currentAmount = todayLog ? todayLog.value : 0;

    // 3. Calculate Target (Carry Over Logic)
    // This is computationally expensive if many logs. Optimally we'd store "deficit" in the habit or a separate tracker.
    // implementing simplified recursive check for last 7 days for now to avoid freezing on render.
    // In a real production app, "carryOver" debt should be a stored field updated daily via a cron job or "first login of day" logic.
    // Here, we'll just calculate it dynamically for the last 7 days max.

    const calculateDeficit = () => {
        if (!habit.carryOver) return 0;

        let deficit = 0;
        const msPerDay = 86400000;
        // Check last 7 days
        for (let i = 1; i <= 7; i++) {
            const d = new Date(today.getTime() - (i * msPerDay));
            if (d.getTime() < habit.startDate) break; // Don't match before start

            const dString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const log = habitLogs.find(l => l.habitId === habit.id && l.date === dString);
            const val = log ? log.value : 0;

            if (val < habit.goalAmount) {
                deficit += (habit.goalAmount - val);
            }
        }
        return deficit;
    };

    const deficit = calculateDeficit();
    const targetToday = habit.goalAmount + deficit;
    const progressPercent = Math.min(150, (currentAmount / targetToday) * 100); // Cap visual at 150%
    const isCompleted = currentAmount >= targetToday;

    const handleLog = (e: React.FormEvent) => {
        e.preventDefault();
        const val = Number(inputValue);
        if (!isNaN(val)) {
            logHabit(habit.id, dateString, val);
            setInputValue('');
            setIsLogging(false);
        }
    };

    // Auto-fill input with current amount when opening
    useEffect(() => {
        if (isLogging) setInputValue(String(currentAmount));
    }, [isLogging, currentAmount]);

    // Color Helpers
    const getBarColor = () => {
        if (currentAmount >= targetToday) return 'bg-yellow-400'; // Gold for complete
        // Use habit theme color
        if (habit.themeColor.startsWith('tech-')) return `bg-${habit.themeColor}`;
        return `bg-${habit.themeColor}`; // Simplified class mapping
    };

    return (
        <>
            <HabitModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={habit} />

            <div className="bg-tech-surface border border-tech-border rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
                {/* Background Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-tech-surface-hover w-full">
                    <div
                        className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-yellow-400'}`}
                        style={{ width: `${Math.min(100, (currentAmount / targetToday) * 100)}%` }}
                    />
                </div>

                <div className="flex justify-between items-start z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{habit.title}</h3>
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md text-tech-text-secondary hover:text-white"
                                title="Edit Habit"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                        </div>
                        <p className="text-xs text-tech-text-secondary flex items-center gap-1">
                            Day {Math.floor((Date.now() - habit.startDate) / 86400000) + 1} of {habit.durationDays}
                        </p>
                    </div>

                    {/* Streak Badge (Placeholder calculation) */}
                    <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg text-xs font-mono text-orange-400">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        <span>0</span>
                    </div>
                </div>

                <div className="flex items-end justify-between z-10 mt-auto">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold font-mono ${isCompleted ? 'text-green-400' : 'text-tech-primary'}`}>
                                {currentAmount}
                            </span>
                            <span className="text-xs text-tech-text-secondary font-mono">
                                / {targetToday} {habit.unit}
                            </span>
                        </div>
                        {deficit > 0 && (
                            <p className="text-[10px] text-red-400 font-mono mt-1">
                                +{deficit} carried over
                            </p>
                        )}
                    </div>

                    {isLogging ? (
                        <form onSubmit={handleLog} className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                            <input
                                type="number"
                                autoFocus
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onBlur={() => setTimeout(() => setIsLogging(false), 200)}
                                className="w-20 bg-black/50 border border-tech-primary rounded-lg p-2 text-center font-mono text-sm outline-none"
                            />
                            <button type="submit" className="p-2 bg-tech-primary text-black rounded-lg">
                                <Check className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsLogging(true)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isCompleted
                                ? 'bg-green-400/10 text-green-400 border border-green-400/50 hover:bg-green-400/20'
                                : 'bg-tech-surface-hover border border-tech-border hover:border-tech-primary hover:text-tech-primary'
                                }`}
                        >
                            {isCompleted ? 'Update' : 'Log'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
