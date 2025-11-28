import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Calendar: React.FC = () => {
    const { tasks } = useGame();
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

            days.push(
                <div
                    key={i}
                    className={`min-h-[100px] border border-tech-border p-2 ${isCurrentMonth ? 'bg-tech-surface/50' : 'bg-transparent opacity-30'
                        }`}
                >
                    {isCurrentMonth && (
                        <>
                            <div className="text-right text-sm text-gray-500 mb-2">{dayNumber}</div>
                            <div className="space-y-1">
                                {dayTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-[10px] p-1 rounded bg-white/10 border border-white/5 truncate"
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

            <div className="grid grid-cols-7 gap-px border border-tech-border bg-tech-border rounded-lg overflow-hidden flex-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-tech-surface p-2 md:p-3 text-center text-[10px] md:text-sm font-bold text-gray-400">
                        {day}
                    </div>
                ))}
                {renderCalendarDays()}
            </div>
        </div>
    );
};
