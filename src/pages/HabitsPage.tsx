import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { HabitCard } from '../components/HabitCard';
import { CreateHabitModal } from '../components/CreateHabitModal';
import { Plus, Repeat, CalendarCheck } from 'lucide-react';
import { useTime } from '../hooks/useTime';

export const HabitsPage: React.FC = () => {
    const { habits } = useGame();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const currentTime = useTime();

    // Group into Active and Completed (logic placeholder)
    // For now, all habits are "Active" until duration passes
    const activeHabits = habits; // Filter logic later if needed

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-24 md:pb-0">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-tech-primary to-purple-400">
                        Habit Net
                    </h1>
                    <p className="text-tech-text-secondary mt-2 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="hidden md:flex items-center gap-2 px-6 py-3 bg-tech-primary text-black font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]"
                >
                    <Plus className="w-5 h-5" />
                    New Protocol
                </button>
            </header>

            {/* Empty State */}
            {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-tech-border rounded-3xl bg-tech-surface/30">
                    <div className="w-20 h-20 bg-tech-surface rounded-full flex items-center justify-center mb-6">
                        <Repeat className="w-10 h-10 text-tech-text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Active Habits</h3>
                    <p className="text-tech-text-secondary max-w-sm mb-8">
                        Consistency is the key to mastery. Initialize a new habit protocol to begin tracking your progress.
                    </p>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-8 py-4 bg-tech-primary text-black font-bold rounded-xl hover:brightness-110 transition-all"
                    >
                        Initialize First Habit
                    </button>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeHabits.map(habit => (
                        <HabitCard key={habit.id} habit={habit} />
                    ))}

                    {/* Add Button Card (Desktop) */}
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="hidden md:flex flex-col items-center justify-center p-6 border-2 border-dashed border-tech-border rounded-2xl bg-transparent hover:bg-tech-surface/50 transition-all group min-h-[140px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-tech-surface flex items-center justify-center group-hover:bg-tech-primary group-hover:text-black transition-colors mb-2">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-tech-text-secondary group-hover:text-tech-text">New Habit</span>
                    </button>
                </div>
            )}

            {/* Mobile FAB */}
            <button
                onClick={() => setIsCreateOpen(true)}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-tech-primary text-black rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
            >
                <Plus className="w-8 h-8" />
            </button>

            <CreateHabitModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
};
