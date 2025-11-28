import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useTime } from '../hooks/useTime';
import { Plus, ArrowRight, Activity, Target, BookOpen, Zap, Clock, Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexSkillGraph } from '../components/HexSkillGraph';

const iconMap: Record<string, any> = {
    Target,
    BookOpen,
    Zap,
    Activity
};

const availableIcons = ['Target', 'BookOpen', 'Zap', 'Activity'];
const availableColors = ['tech-primary', 'tech-secondary', 'tech-accent', 'blue-400', 'green-400', 'purple-400', 'amber-400'];
export const Dashboard: React.FC = () => {
    const { trackers, userStats, addTracker, tasks } = useGame();
    const currentTime = useTime();
    const [isAddingTracker, setIsAddingTracker] = useState(false);
    const [newTrackerName, setNewTrackerName] = useState('');
    const [newTrackerType, setNewTrackerType] = useState('daily');
    const [newTrackerIcon, setNewTrackerIcon] = useState('Target');
    const [newTrackerColor, setNewTrackerColor] = useState('tech-primary');

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
        <div className="space-y-8 relative">
            {/* Header / Widgets Row */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Clock / Date Widget */}
                <div className="col-span-1 p-6 rounded-3xl bg-tech-surface border border-tech-border flex flex-col justify-between h-48">
                    <div>
                        <Clock className="w-6 h-6 text-white mb-4" />
                        <h2 className="text-3xl font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
                        <p className="text-gray-400">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Progress Widget */}
                <div className="col-span-1 p-6 rounded-3xl bg-tech-surface border border-tech-border flex flex-col justify-center h-48 space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Mission Completion</span>
                            <span>{Math.round(taskProgress)}%</span>
                        </div>
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${taskProgress}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Level {userStats.level}</span>
                            <span>{Math.round((userStats.xp / userStats.nextLevelXp) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* Hex Graph Widget */}
                <div className="col-span-2 p-6 rounded-3xl bg-tech-surface border border-tech-border h-48 flex items-center relative overflow-hidden">
                    <div className="flex-1 z-10">
                        <h3 className="font-bold text-lg mb-1">Life Balance</h3>
                        <p className="text-sm text-gray-400">Keep your stats aligned.</p>
                    </div>
                    <div className="w-48 h-48 -mr-4">
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
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-xl transition-all font-medium text-sm"
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
                                    className="block h-40 p-6 rounded-3xl bg-tech-surface border border-tech-border hover:border-white/20 transition-all group relative overflow-hidden"
                                >
                                    {/* Cover Image Placeholder */}
                                    <div className={`absolute inset-x-0 top-0 h-16 bg-${tracker.themeColor}/10 group-hover:bg-${tracker.themeColor}/20 transition-colors`} />

                                    <div className="relative z-10 pt-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-tech-bg border border-tech-border shadow-sm">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="font-bold text-lg">{tracker.name}</h3>
                                        </div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">{tracker.type}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Add Tracker Modal */}
            <AnimatePresence>
                {isAddingTracker && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-tech-surface border border-tech-border rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Create New Page</h3>
                                <button onClick={() => setIsAddingTracker(false)} className="p-2 hover:bg-white/10 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddTracker} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Page Name</label>
                                    <input
                                        value={newTrackerName}
                                        onChange={e => setNewTrackerName(e.target.value)}
                                        className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                                        placeholder="e.g. Biology 101"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Type</label>
                                    <select
                                        value={newTrackerType}
                                        onChange={e => setNewTrackerType(e.target.value)}
                                        className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="project">Project</option>
                                        <option value="habit">Habit</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Icon</label>
                                    <div className="flex gap-4">
                                        {availableIcons.map(icon => {
                                            const Icon = iconMap[icon];
                                            return (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setNewTrackerIcon(icon)}
                                                    className={`p-3 rounded-xl border transition-all ${newTrackerIcon === icon
                                                        ? 'bg-white text-black border-white'
                                                        : 'bg-black/20 border-tech-border hover:border-white/50'
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
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Create Page
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
