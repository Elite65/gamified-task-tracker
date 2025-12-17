import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useTime } from '../hooks/useTime';
import { Plus, ArrowRight, Activity, Target, BookOpen, Zap, Clock, Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexSkillGraph } from '../components/HexSkillGraph';
import { EditSkillsModal } from '../components/EditSkillsModal';
import { Edit2 } from 'lucide-react';
import { DailyHabitWidget } from '../components/DailyHabitWidget';

const iconMap: Record<string, any> = {
    Target,
    BookOpen,
    Zap,
    Activity
};

const availableIcons = ['Target', 'BookOpen', 'Zap', 'Activity'];
const availableColors = ['tech-primary', 'tech-secondary', 'tech-accent', 'blue-400', 'green-400', 'purple-400', 'amber-400'];
export const Dashboard: React.FC = () => {
    const { trackers, userStats, addTracker, tasks, updateSkills } = useGame();
    const currentTime = useTime();
    const [isAddingTracker, setIsAddingTracker] = useState(false);
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [newTrackerName, setNewTrackerName] = useState('');
    const [newTrackerType, setNewTrackerType] = useState('daily');
    const [newTrackerIcon, setNewTrackerIcon] = useState('Target');
    const [newTrackerColor, setNewTrackerColor] = useState('tech-primary');
    const [quote, setQuote] = useState(() => localStorage.getItem('gtt_quote') || 'Keep your stats aligned.');
    const [isEditingQuote, setIsEditingQuote] = useState(false);

    // Persist quote
    React.useEffect(() => {
        localStorage.setItem('gtt_quote', quote);
    }, [quote]);

    // Calculate task progress
    // Calculate task progress (Weighted)
    const totalTasks = tasks.length;
    const weightedProgress = tasks.reduce((acc, task) => {
        if (task.status === 'COMPLETED') return acc + 1;
        if (task.status === 'IN_PROGRESS') return acc + 0.5;
        if (task.status === 'STARTED') return acc + 0.2;
        return acc;
    }, 0);
    const taskProgress = totalTasks > 0 ? (weightedProgress / totalTasks) * 100 : 0;

    const handleAddTracker = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTrackerName.trim()) return;

        addTracker({
            name: newTrackerName,
            type: newTrackerType as any,
            icon: newTrackerIcon,
            themeColor: newTrackerColor
        });

        setIsAddingTracker(false);
        setNewTrackerName('');
    };

    return (
        <div className="space-y-8 relative text-tech-text">
            {/* Header / Widgets Row */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Clock / Date Widget */}
                {/* Clock / Date / Quote Widget */}
                <div className="col-span-1 md:col-span-2 p-6 rounded-3xl bg-tech-surface border border-tech-border flex flex-row items-center justify-between h-48 relative overflow-hidden group">
                    {/* Time & Date */}
                    <div className="z-10">
                        <Clock className="w-6 h-6 text-tech-primary mb-4" />
                        <h2 className="text-4xl font-bold tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
                        <p className="text-tech-text-secondary font-medium">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>



                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-tech-primary/5 to-transparent rounded-bl-full pointer-events-none" />
                </div>

                {/* Daily Habit Widget */}
                <div className="col-span-1 p-6 rounded-3xl bg-tech-surface border border-tech-border flex flex-col justify-center h-48 overflow-hidden">
                    <DailyHabitWidget />
                </div>

                {/* Stats Widget (Mission + Level) */}
                <div className="col-span-1 p-6 rounded-3xl bg-tech-surface border border-tech-border flex flex-col justify-center gap-6 h-48">
                    {/* Mission Completion (Top) */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-tech-text-secondary uppercase tracking-wider font-bold">
                            <span>Mission Completion</span>
                            <span>{Math.round(taskProgress)}%</span>
                        </div>
                        <div className="h-1.5 bg-tech-surface-hover rounded-full overflow-hidden">
                            <div className="h-full bg-tech-primary rounded-full transition-all duration-1000" style={{ width: `${taskProgress}%` }} />
                        </div>
                    </div>

                    {/* Level Progress (Bottom) */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-tech-text-secondary uppercase tracking-wider font-bold">
                            <span>Lvl {userStats.level}</span>
                            <span>{Math.round((userStats.xp / userStats.nextLevelXp) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-tech-surface-hover rounded-full overflow-hidden">
                            <div className="h-full bg-tech-secondary rounded-full transition-all duration-1000" style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* Hex Graph Widget (Optional / Row 2) */}
                <div className="col-span-1 md:col-span-2 p-6 rounded-3xl bg-tech-surface border border-tech-border h-48 flex items-center relative group">
                    <div className="flex-1 z-10 pl-2">
                        <h3 className="font-bold text-lg mb-4">Life Balance</h3>
                        {/* Editable Quote */}
                        <div className="relative mb-4">
                            {isEditingQuote ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setIsEditingQuote(false);
                                    }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        onBlur={() => setIsEditingQuote(false)}
                                        className="w-full bg-transparent border-b border-tech-primary text-sm text-tech-text italic focus:outline-none"
                                        autoFocus
                                    />
                                    <button type="submit" className="text-xs text-tech-primary font-bold">SAVE</button>
                                </form>
                            ) : (
                                <p
                                    className="text-sm text-tech-text-secondary italic cursor-pointer hover:text-tech-text transition-colors"
                                    onClick={() => setIsEditingQuote(true)}
                                    title="Click to edit quote"
                                >
                                    "{quote}"
                                </p>
                            )}
                            {!isEditingQuote && (
                                <button
                                    onClick={() => setIsEditingQuote(true)}
                                    className="text-[10px] uppercase tracking-widest text-tech-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                >
                                    Edit Quote
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setIsEditingSkills(true)}
                            className="flex items-center gap-2 text-tech-primary text-sm font-bold hover:underline"
                        >
                            <Edit2 className="w-3 h-3" />
                            Edit Skills
                        </button>
                    </div>
                    <div className="relative w-56 h-32 flex items-center justify-center">
                        <HexSkillGraph stats={userStats} />
                    </div>
                </div>
            </section>

            {/* Courses / Trackers Grid */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Courses & Trackers
                    </h2>
                    <button
                        onClick={() => setIsAddingTracker(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-tech-primary text-black hover:bg-tech-primary/80 rounded-xl transition-all font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Page</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trackers.map((tracker, idx) => {
                        const Icon = iconMap[tracker.icon] || Activity;
                        return (
                            <motion.div
                                key={tracker.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    to={`/tracker/${tracker.id}`}
                                    className="block h-40 p-6 rounded-3xl bg-tech-surface border border-tech-border hover:border-tech-primary/50 transition-all group relative overflow-hidden"
                                >
                                    {/* Cover Image Placeholder */}
                                    <div className={`absolute inset-x-0 top-0 h-16 bg-${tracker.themeColor}/10 group-hover:bg-${tracker.themeColor}/20 transition-colors`} />

                                    <div className="relative z-10 pt-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-tech-bg border border-tech-border shadow-sm">
                                                <Icon className="w-5 h-5 text-tech-text" />
                                            </div>
                                            <h3 className="font-bold text-lg">{tracker.name}</h3>
                                        </div>
                                        <p className="text-xs text-tech-text-secondary uppercase tracking-wider font-medium ml-1">{tracker.type}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section >

            {/* Add Tracker Modal */}
            <AnimatePresence>
                {
                    isAddingTracker && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-md bg-tech-surface border border-tech-border rounded-3xl p-6 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">Create New Page</h3>
                                    <button onClick={() => setIsAddingTracker(false)} className="p-2 hover:bg-tech-surface-hover rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddTracker} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-tech-text-secondary mb-2 uppercase">Page Name</label>
                                        <input
                                            value={newTrackerName}
                                            onChange={e => setNewTrackerName(e.target.value)}
                                            className="w-full bg-tech-bg border border-tech-border rounded-xl p-3 focus:border-tech-primary outline-none transition-colors text-tech-text"
                                            placeholder="e.g. Biology 101"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-tech-text-secondary mb-2 uppercase">Type</label>
                                        <select
                                            value={newTrackerType}
                                            onChange={e => setNewTrackerType(e.target.value)}
                                            className="w-full bg-tech-bg border border-tech-border rounded-xl p-3 focus:border-tech-primary outline-none transition-colors text-tech-text"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="assignment">Assignment</option>
                                            <option value="project">Project</option>
                                            <option value="habit">Habit</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-tech-text-secondary mb-2 uppercase">Icon</label>
                                        <div className="flex gap-4">
                                            {availableIcons.map(icon => {
                                                const Icon = iconMap[icon];
                                                return (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => setNewTrackerIcon(icon)}
                                                        className={`p-3 rounded-xl border transition-all ${newTrackerIcon === icon
                                                            ? 'bg-tech-primary text-black border-tech-primary'
                                                            : 'bg-tech-bg border-tech-border hover:border-tech-primary/50'
                                                            }`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-tech-primary text-black font-bold rounded-xl hover:bg-tech-primary/80 transition-colors"
                                    >
                                        Create Page
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Edit Quote Modal */}
            <AnimatePresence>
                {
                    isEditingQuote && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-sm bg-tech-surface border border-tech-border rounded-3xl p-6 shadow-2xl"
                            >
                                <h3 className="text-xl font-bold mb-4">Update Daily Quote</h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setIsEditingQuote(false);
                                    }}
                                >
                                    <textarea
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        className="w-full h-24 bg-tech-bg border border-tech-border rounded-xl p-3 focus:border-tech-primary outline-none transition-colors text-tech-text resize-none mb-4 font-serif italic"
                                        placeholder="Enter your inspiring quote..."
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingQuote(false)}
                                            className="px-4 py-2 text-tech-text-secondary hover:text-tech-text font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-tech-primary text-black font-bold rounded-xl hover:bg-tech-primary/80 transition-colors"
                                        >
                                            Save Quote
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            <EditSkillsModal
                isOpen={isEditingSkills}
                onClose={() => setIsEditingSkills(false)}
                currentSkills={userStats.skills}
                onSave={updateSkills}
            />
        </div >
    );
};
