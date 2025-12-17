import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Repeat } from 'lucide-react';

export const DailyHabitWidget: React.FC = () => {
    const { habits, habitLogs } = useGame();

    // 1. Calculate Today's Stats
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const activeHabits = habits.filter(h => {
        // Simple active check: is today >= startDate?
        return Date.now() >= h.startDate;
    });

    const totalHabits = activeHabits.length;
    let completedCount = 0;

    activeHabits.forEach(habit => {
        const log = habitLogs.find(l => l.habitId === habit.id && l.date === dateString);
        const value = log ? log.value : 0;

        // Calculate dynamic target (including carry over if enabled)
        // For dashboard summary, simple goal check is usually enough, but let's be consistent
        // Doing full deficit calc here might be heavy. Let's stick to "Goal Met Today" for simplicity
        if (value >= habit.goalAmount) {
            completedCount++;
        }
    });



    // Calculate aggregated percentage for visual progress
    let totalProgressPercent = 0;
    activeHabits.forEach(habit => {
        const log = habitLogs.find(l => l.habitId === habit.id && l.date === dateString);
        const value = log ? log.value : 0;
        const p = Math.min(1, value / habit.goalAmount);
        totalProgressPercent += p;
    });

    // Average progress across all habits
    const percentage = totalHabits > 0 ? (totalProgressPercent / totalHabits) * 100 : 0;

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                    <span className="text-xs text-tech-text-secondary font-mono tracking-wider uppercase">Habit Protocol</span>
                    <span className="text-2xl font-bold flex items-baseline gap-1">
                        {completedCount} <span className="text-sm text-tech-text-secondary font-normal">/ {totalHabits}</span>
                    </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-tech-primary/10 flex items-center justify-center">
                    <Repeat className="w-4 h-4 text-tech-primary" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Circular Progress */}
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                        {/* Background Circle */}
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-tech-surface-hover"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={(2 * Math.PI * 28) - (percentage / 100) * (2 * Math.PI * 28)}
                            strokeLinecap="round"
                            className="text-tech-primary transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {Math.round(percentage)}%
                    </div>
                </div>

                <div className="flex-1 space-y-1">
                    <p className="text-xs text-tech-text-secondary leading-tight">
                        {percentage === 100 ? "All protocols executed." : "maintain consistency."}
                    </p>
                    <div className="h-1 w-full bg-tech-surface-hover rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full bg-tech-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
