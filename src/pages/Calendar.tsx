import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Calendar: React.FC = () => {
    const { tasks, habits, habitLogs } = useGame();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getTasksForDate = (day: number) => {
        const targetStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).setHours(0, 0, 0, 0);
        const targetEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).setHours(23, 59, 59, 999);

        return tasks.filter(task => {
            if (!task.dueDate) return false;
            return task.dueDate >= targetStart && task.dueDate <= targetEnd;
        });
    };

    const renderCalendarDays = () => {
        const days = [];
        const totalSlots = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

        for (let i = 0; i < totalSlots; i++) {
            const dayNumber = i - firstDayOfMonth + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const dayTasks = isCurrentMonth ? getTasksForDate(dayNumber) : [];

            // Calculate Habit Status for Day
            // Calculate Habit Status for Day
            let habitElements = null;
            if (isCurrentMonth) {
                const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                // Get logs for this day
                const dayLogs = habitLogs.filter((l: any) => l.date === dateKey);

                // Check active habits for this day (inclusive comparison)
                // Normalize dates: compare habit start vs end of current day
                const currentDayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber, 23, 59, 59).getTime();

                const activeHabitsForDay = habits.filter((h: any) => h.startDate <= currentDayEnd);

                if (activeHabitsForDay.length > 0) {
                    // Render a dot for EACH habit
                    const habitDots = activeHabitsForDay.map((h: any) => {
                        const log = dayLogs.find((l: any) => l.habitId === h.id);
                        const isComplete = log && log.value >= h.goalAmount;
                        const isPartial = log && log.value > 0;

                        let color = 'bg-tech-surface-hover'; // Default/Pending
                        if (isComplete) color = 'bg-green-400';
                        else if (isPartial) color = 'bg-yellow-400';

                        return { id: h.id, color, title: h.title };
                    });

                    // Helper to render dots
                    habitElements = (
                        <div className="flex gap-1 mt-1 flex-wrap justify-end max-w-[50px]">
                            {habitDots.map((d: any) => (
                                <div
                                    key={d.id}
                                    className={`w-1.5 h-1.5 rounded-full ${d.color} shadow-[0_0_2px_currentColor]`}
                                    title={d.title}
                                />
                            ))}
                        </div>
                    );
                }
            }

            days.push(
                <div
                    key={i}
                    className={`min-h-[100px] p-2 relative ${isCurrentMonth ? 'bg-tech-surface/50' : 'bg-transparent opacity-30'
                        }`}
                >
                    {isCurrentMonth && (
                        <>
                            <div className="flex justify-between items-start mb-2">
                                {/* Habit Dots Container */}
                                {habitElements}

                                <div className="text-sm text-tech-text-secondary ml-auto">{dayNumber}</div>
                            </div>
                            <div className="space-y-1">
                                {dayTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-[10px] p-1 rounded bg-tech-primary/10 border border-tech-primary/20 truncate text-tech-text"
                                        title={task.title}
                                    >
                                        {task.title}
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold">Academic Calendar</h1>
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-mono font-bold w-32 text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px border border-tech-border bg-tech-calendar-border rounded-lg overflow-hidden flex-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-tech-surface p-2 md:p-3 text-center text-[10px] md:text-sm font-bold text-tech-text-secondary">
                        {day}
                    </div>
                ))}
                {renderCalendarDays()}
            </div>
        </div>
    );
};
