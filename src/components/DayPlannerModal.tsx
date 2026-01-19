import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Shield, Zap, Calendar as CalendarIcon, CheckCircle2, Circle, Target, Clock, Repeat } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DayPlan, Task, Habit, Difficulty, RecurrenceFrequency } from '../types';
import { SkillSelector } from './SkillSelector';

interface DayPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
}

export const DayPlannerModal: React.FC<DayPlannerModalProps> = ({ isOpen, onClose, date }) => {
    const {
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        getDayPlan,
        lockDay,
        unlockDay,
        getTasksForDate,
        activeHabitsForDate,
        habits,
        habitLogs,
        logHabit,
        userStats
    } = useGame() as any;

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayPlan = getDayPlan(dateKey);

    const [activeTab, setActiveTab] = useState<'MISSIONS' | 'SCHEDULE' | 'ROUTINE'>('MISSIONS');

    // Add Form State
    const [newItemText, setNewItemText] = useState('');
    const [newItemType, setNewItemType] = useState<'TASK' | 'EVENT'>('TASK');
    const [newDifficulty, setNewDifficulty] = useState<Difficulty>('EASY');
    const [newSkills, setNewSkills] = useState<string[]>(['Focus']);

    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency>('WEEKLY');
    const [customDays, setCustomDays] = useState<number[]>([]);

    // Filter Items
    const dayTasks = getTasksForDate(date);

    const missions = dayTasks.filter((t: Task) => !t.isEvent);
    const events = dayTasks.filter((t: Task) => t.isEvent);

    // Calculate Threat Level
    let threatLevel = 'D';
    let threatColor = 'text-green-400';
    let threatLabel = 'LOW THREAT';

    const hasHardOrEpic = missions.some((t: Task) => t.difficulty === 'HARD' || t.difficulty === 'EPIC');
    const hasMedium = missions.some((t: Task) => t.difficulty === 'MEDIUM');

    if (missions.length >= 6 || hasHardOrEpic) {
        threatLevel = 'S';
        threatColor = 'text-red-500';
        threatLabel = 'EXTREME DANGER';
    } else if (missions.length >= 3 || hasMedium) {
        threatLevel = 'B';
        threatColor = 'text-yellow-400';
        threatLabel = 'BALANCED';
    }

    // Flux Zone Format
    const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:00 ${ampm}`;
    };

    // Habits for this day
    const dayHabits = habits.filter((h: Habit) => h.startDate <= date.getTime());

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim()) return;

        let recurrenceConfig = undefined;
        if (newItemType === 'EVENT' && isRecurring) {
            let days = customDays;
            if (recurrenceFreq === 'WEEKLY') days = [date.getDay()]; // Default to this day of week

            recurrenceConfig = {
                frequency: recurrenceFreq,
                daysOfWeek: (recurrenceFreq === 'WEEKLY' || recurrenceFreq === 'CUSTOM') ? days : undefined,
                monthDay: recurrenceFreq === 'YEARLY' ? { month: date.getMonth(), day: date.getDate() } : undefined
            };
        }

        addTask({
            title: newItemText,
            status: 'YET_TO_START',
            difficulty: newItemType === 'TASK' ? newDifficulty : 'EASY', // Events default to EASY (ignored)
            skills: newItemType === 'TASK' ? newSkills : [],
            trackerId: '1',
            dueDate: date.setHours(12, 0, 0, 0),
            isEvent: newItemType === 'EVENT',
            recurrence: recurrenceConfig
        });

        // Reset form
        setNewItemText('');
        setNewDifficulty('EASY');
        setNewSkills(['Focus']);
        setIsRecurring(false);
        setCustomDays([]);
    };

    const handleLockToggle = () => {
        if (dayPlan.isLocked) {
            if (window.confirm("WARNING: Unlocking the protocol will incur a penalty (-50 XP). Proceed?")) {
                unlockDay(dateKey);
            }
        } else {
            lockDay(dateKey);
        }
    };

    const toggleCustomDay = (dayIndex: number) => {
        setCustomDays(prev =>
            prev.includes(dayIndex)
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex]
        );
    };

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const difficultyColors = {
        'EASY': 'text-green-400 border-green-400/30 bg-green-400/10',
        'MEDIUM': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
        'HARD': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
        'EPIC': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-tech-surface border border-tech-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-tech-border flex justify-between items-start bg-tech-bg/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold font-mono">
                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                            </h2>
                            {dayPlan.isLocked ? (
                                <div className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-[10px] font-bold text-green-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> LOCKED
                                </div>
                            ) : (
                                <div className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                                    <Unlock className="w-3 h-3" /> OPEN
                                </div>
                            )}
                        </div>
                        <div className={`text-xs font-bold tracking-widest flex items-center gap-2 ${threatColor}`}>
                            <Shield className="w-3 h-3" />
                            CLASS-{threatLevel} // {threatLabel}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Flux Zone Banner */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-y border-tech-border p-3 flex items-center justify-center gap-3">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-tech-text-secondary uppercase tracking-wider">
                        FLUX ZONE (2x XP): <span className="text-tech-text">{formatHour(dayPlan.fluxStartHour)} - {formatHour(dayPlan.fluxEndHour)}</span>
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-tech-border">
                    <button
                        onClick={() => setActiveTab('MISSIONS')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'MISSIONS' ? 'bg-tech-surface-hover text-tech-primary border-b-2 border-tech-primary' : 'text-tech-text-secondary hover:text-tech-text'}`}
                    >
                        Missions ({missions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ROUTINE')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'ROUTINE' ? 'bg-tech-surface-hover text-tech-primary border-b-2 border-tech-primary' : 'text-tech-text-secondary hover:text-tech-text'}`}
                    >
                        Routine
                    </button>
                    <button
                        onClick={() => setActiveTab('SCHEDULE')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'SCHEDULE' ? 'bg-tech-surface-hover text-tech-primary border-b-2 border-tech-primary' : 'text-tech-text-secondary hover:text-tech-text'}`}
                    >
                        Schedule ({events.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {/* INPUT AREA */}
                    {activeTab !== 'ROUTINE' && !dayPlan.isLocked && (
                        <div className="mb-6 p-4 bg-tech-bg/50 border border-tech-border rounded-xl">
                            <form onSubmit={handleAddItem} className="space-y-3">
                                {/* Type Toggle */}
                                <div className="flex bg-black/30 p-1 rounded-lg w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setNewItemType('TASK')}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${newItemType === 'TASK' ? 'bg-tech-primary text-black' : 'text-tech-text-secondary hover:text-tech-text'}`}
                                    >
                                        MISSION
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewItemType('EVENT')}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${newItemType === 'EVENT' ? 'bg-blue-400 text-black' : 'text-tech-text-secondary hover:text-tech-text'}`}
                                    >
                                        SCHEDULE
                                    </button>
                                </div>

                                {/* Main Input */}
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    placeholder={newItemType === 'TASK' ? "New mission objective..." : "New schedule item (e.g. Meeting)..."}
                                    className="w-full bg-tech-surface border border-tech-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tech-primary"
                                />

                                {/* Expanded Options: Missions */}
                                <AnimatePresence>
                                    {newItemType === 'TASK' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            <div className="flex gap-2 items-center overflow-x-auto pb-2">
                                                {(['EASY', 'MEDIUM', 'HARD', 'EPIC'] as Difficulty[]).map(diff => (
                                                    <button
                                                        key={diff}
                                                        type="button"
                                                        onClick={() => setNewDifficulty(diff)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold border ${newDifficulty === diff ? difficultyColors[diff] : 'border-tech-border text-tech-text-secondary hover:border-tech-text-secondary'}`}
                                                    >
                                                        {diff}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="bg-black/20 p-2 rounded-lg">
                                                <SkillSelector selectedSkills={newSkills} onChange={setNewSkills} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Expanded Options: Recurrence (Events Only) */}
                                <AnimatePresence>
                                    {newItemType === 'EVENT' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsRecurring(!isRecurring)}
                                                    className={`w-10 h-6 rounded-full relative transition-colors ${isRecurring ? 'bg-tech-primary' : 'bg-black/50 border border-tech-border'}`}
                                                >
                                                    <motion.div
                                                        animate={{ x: isRecurring ? 18 : 2 }}
                                                        className={`absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm`}
                                                    />
                                                </button>
                                                <span className="text-xs font-bold text-tech-text-secondary flex items-center gap-1 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                                                    <Repeat className="w-3 h-3" /> Repeating Item?
                                                </span>
                                            </div>

                                            {isRecurring && (
                                                <div className="pl-6 space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {(['DAILY', 'WEEKLY', 'YEARLY', 'CUSTOM'] as RecurrenceFrequency[]).map((freq) => (
                                                            <button
                                                                key={freq}
                                                                type="button"
                                                                onClick={() => setRecurrenceFreq(freq)}
                                                                className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${recurrenceFreq === freq
                                                                    ? 'bg-tech-primary text-black border-tech-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                                                    : 'bg-black/30 text-tech-text-secondary border-tech-border hover:border-tech-primary hover:text-tech-text'
                                                                    }`}
                                                            >
                                                                {freq === 'DAILY' && 'EVERY DAY'}
                                                                {freq === 'WEEKLY' && 'WEEKLY'}
                                                                {freq === 'YEARLY' && 'YEARLY'}
                                                                {freq === 'CUSTOM' && 'CUSTOM'}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {recurrenceFreq === 'CUSTOM' && (
                                                        <div className="flex justify-between gap-1 p-2 bg-black/30 rounded-lg border border-tech-border/50">
                                                            {dayLabels.map((day, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => toggleCustomDay(i)}
                                                                    className={`w-7 h-7 rounded-sm text-[10px] font-bold flex items-center justify-center transition-all ${customDays.includes(i)
                                                                        ? 'bg-tech-primary text-black shadow-sm'
                                                                        : 'bg-tech-surface text-tech-text-secondary hover:bg-white/10'
                                                                        }`}
                                                                >
                                                                    {day}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    className={`w-full py-2 rounded-lg font-bold text-xs ${newItemType === 'TASK' ? 'bg-tech-primary text-black hover:bg-tech-primary/80' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                >
                                    ADD {newItemType === 'TASK' ? 'MISSION' : 'ITEM'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'MISSIONS' && (
                        <div className="space-y-2">
                            {missions.length === 0 ? (
                                <p className="text-center text-xs text-tech-text-secondary italic py-8">No active missions for this day.</p>
                            ) : (
                                missions.map((task: Task) => (
                                    <div key={task.id} className="flex flex-col p-3 rounded-xl bg-tech-bg border border-tech-border gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED')}
                                                    className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${task.status === 'COMPLETED' ? 'bg-tech-primary border-tech-primary text-black' : 'border-tech-text-secondary hover:border-tech-primary'}`}
                                                >
                                                    {task.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                                <span className={`text-sm truncate ${task.status === 'COMPLETED' ? 'line-through text-tech-text-secondary' : 'text-tech-text'}`}>{task.title}</span>
                                            </div>
                                            {!dayPlan.isLocked && (
                                                <button onClick={() => deleteTask(task.id)} className="shrink-0 text-tech-text-secondary hover:text-red-400 pl-2">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        {/* Task Metadata */}
                                        <div className="flex items-center gap-2 pl-9">
                                            <div className={`text-[9px] px-1.5 py-0.5 rounded border ${difficultyColors[task.difficulty]} font-bold`}>
                                                {task.difficulty}
                                            </div>
                                            <div className="flex gap-1">
                                                {task.skills.map(s => (
                                                    <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-tech-surface text-tech-text-secondary border border-tech-border">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'SCHEDULE' && (
                        <div className="space-y-2">
                            {events.length === 0 ? (
                                <p className="text-center text-xs text-tech-text-secondary italic py-8">No scheduled events.</p>
                            ) : (
                                events.map((event: Task) => (
                                    <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-tech-bg/50 border border-tech-border border-dashed">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-tech-text-secondary" />
                                            <span className="text-sm text-tech-text-secondary">{event.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] font-bold text-tech-text-secondary px-2 py-1 rounded bg-tech-surface">0 XP</div>
                                            {!dayPlan.isLocked && (
                                                <button onClick={() => deleteTask(event.id)} className="text-tech-text-secondary hover:text-red-400">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'ROUTINE' && (
                        <div className="space-y-2">
                            {dayHabits.length === 0 ? (
                                <p className="text-center text-xs text-tech-text-secondary italic py-8">No active habits for this date.</p>
                            ) : (
                                dayHabits.map((habit: Habit) => {
                                    const log = habitLogs.find((l: any) => l.habitId === habit.id && l.date === dateKey);
                                    const currentValue = log ? log.value : 0;
                                    const isComplete = currentValue >= habit.goalAmount;

                                    return (
                                        <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl bg-tech-bg border border-tech-border">
                                            <div>
                                                <h4 className="text-sm font-bold">{habit.title}</h4>
                                                <div className="text-xs text-tech-text-secondary">
                                                    {currentValue} / {habit.goalAmount} {habit.unit}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (isComplete) logHabit(habit.id, dateKey, 0);
                                                    else logHabit(habit.id, dateKey, habit.goalAmount);
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${isComplete ? 'bg-green-500/20 text-green-400' : 'bg-tech-surface hover:bg-tech-surface-hover text-tech-text-secondary'}`}
                                            >
                                                {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer: Lock Protocol */}
                <div className="p-4 border-t border-tech-border bg-tech-bg/50 text-center">
                    <button
                        onClick={handleLockToggle}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${dayPlan.isLocked
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-tech-primary text-black hover:bg-tech-primary/80'
                            }`}
                    >
                        {dayPlan.isLocked ? (
                            <>
                                <Unlock className="w-4 h-4" /> UNLOCK PROTOCOL (PENALTY)
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" /> INITIALIZE DAY (+10% XP)
                            </>
                        )}
                    </button>
                    {!dayPlan.isLocked && (
                        <p className="text-[10px] text-tech-text-secondary mt-2">
                            Warning: Initializing locks the schedule. Changes require override authorization.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
