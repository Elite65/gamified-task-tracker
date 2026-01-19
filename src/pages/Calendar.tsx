import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Lock, Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Task, Habit, DayPlan } from '../types';
import { DayPlannerModal } from '../components/DayPlannerModal';

export const Calendar: React.FC = () => {
    const { tasks, habits, habitLogs, getDayPlan, getTasksForDate } = useGame() as any;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setIsPlannerOpen(true);
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
        const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-transparent border-r border-b border-tech-border/10" />);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayPlan: DayPlan = getDayPlan(dateKey);

            // Tasks for this day
            const dayTasks = getTasksForDate(date);

            // Habits for this day
            const dateTs = date.getTime();
            const dayHabits = habits.filter((h: Habit) => h.startDate <= dateTs);

            // Check completion status
            const completedHabits = dayHabits.filter((h: Habit) => {
                const log = habitLogs.find((l: any) => l.habitId === h.id && l.date === dateKey);
                return log && log.value >= h.goalAmount;
            });

            // Threat Level Calc
            let threatColor = 'text-green-400';
            let borderColor = 'border-tech-border';

            const missions = dayTasks.filter((t: any) => !t.isEvent);
            const hasHardOrEpic = missions.some((t: any) => t.difficulty === 'HARD' || t.difficulty === 'EPIC');
            const hasMedium = missions.some((t: any) => t.difficulty === 'MEDIUM');

            if (missions.length >= 6 || hasHardOrEpic) {
                threatColor = 'text-red-500';
                borderColor = 'border-red-500/30';
            } else if (missions.length >= 3 || hasMedium) {
                threatColor = 'text-yellow-400';
                borderColor = 'border-yellow-400/30';
            }

            // Determine grid borders
            // We want borders on Right (unless last col) and Bottom (unless last row - simpler to just add bottom)
            const isLastCol = day % 7 === 0; // Approximate, but actually index based is better.

            // Simpler: Just add right/bottom borders to ALL, and letting container crop might be messy.
            // Better: borders on all.
            const borderClass = 'border-r border-b border-tech-border/20';

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[100px] p-2 relative group hover:bg-tech-surface/60 transition-colors cursor-pointer ${borderClass} ${dayPlan.isLocked ? 'bg-green-500/10' : 'bg-transparent'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-0.5 flex-wrap max-w-[60%]">
                            {dayHabits.map((h: Habit) => {
                                const isDone = completedHabits.some((ch: any) => ch.id === h.id);
                                return (
                                    <div
                                        key={h.id}
                                        className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-tech-primary' : 'bg-tech-text-secondary/30'}`}
                                        title={h.title}
                                    />
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-1">
                            {dayPlan.isLocked && <Lock className="w-3 h-3 text-green-400" />}
                            <span className={`text-sm font-bold ${threatColor}`}>{day}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task: Task) => (
                            <div
                                key={task.id}
                                className={`text-[10px] px-1 py-0.5 rounded truncate ${task.isEvent ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-tech-primary/10 border border-tech-primary/20 text-tech-text'}`}
                            >
                                {task.title}
                            </div>
                        ))}
                        {dayTasks.length > 3 && (
                            <div className="text-[9px] text-tech-text-secondary text-center">
                                +{dayTasks.length - 3} more
                            </div>
                        )}
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 border-2 border-tech-primary/0 group-hover:border-tech-primary/50 rounded pointer-events-none transition-colors" />
                </div>
            );
        }

        return days;
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-mono text-tech-primary mb-2 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8" />
                        MISSION CALENDAR
                    </h1>
                    <p className="text-tech-text-secondary">Plan operations and monitor threats.</p>
                </div>
                <div className="flex items-center gap-4 bg-tech-surface p-2 rounded-xl border border-tech-border">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold font-mono min-w-[150px] text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-7 border border-tech-border/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm bg-tech-surface/20">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
                    <div
                        key={day}
                        className={`p-3 text-center text-xs font-bold text-tech-text-secondary uppercase tracking-widest bg-tech-surface/50 border-b border-tech-border/30 ${index !== 6 ? 'border-r' : ''}`}
                    >
                        {day}
                    </div>
                ))}

                {renderCalendarDays()}
            </div>

            <AnimatePresence>
                {isPlannerOpen && selectedDate && (
                    <DayPlannerModal
                        isOpen={isPlannerOpen}
                        onClose={() => setIsPlannerOpen(false)}
                        date={selectedDate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
