import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { BookOpen, Activity, Target, Zap, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const iconMap: Record<string, any> = {
    Target,
    BookOpen,
    Zap,
    Activity
};

export const CoursesPage: React.FC = () => {
    const { trackers, deleteTracker } = useGame();
    const { showToast } = useToast();

    const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault(); // Prevent navigation
        if (window.confirm(`Are you sure you want to delete "${name}"? This will delete all tasks within it.`)) {
            deleteTracker(id);
            showToast(`Deleted "${name}"`, { type: 'info' });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-tech-surface rounded-xl border border-tech-border">
                    <BookOpen className="w-6 h-6 text-tech-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">All Courses & Trackers</h1>
                    <p className="text-gray-400">Manage your active learning modules.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {trackers.map((tracker, idx) => {
                        const Icon = iconMap[tracker.icon] || Activity;
                        return (
                            <motion.div
                                key={tracker.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    to={`/tracker/${tracker.id}`}
                                    className="block h-48 p-6 rounded-3xl bg-tech-surface border border-tech-border hover:border-white/20 transition-all group relative overflow-hidden flex flex-col justify-between"
                                >
                                    {/* Cover Image Placeholder */}
                                    <div className={`absolute inset-x-0 top-0 h-20 bg-${tracker.themeColor}/10 group-hover:bg-${tracker.themeColor}/20 transition-colors`} />

                                    <div className="relative z-10 pt-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-tech-bg border border-tech-border shadow-sm">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="font-bold text-lg">{tracker.name}</h3>
                                        </div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">{tracker.type}</p>
                                    </div>

                                    <div className="relative z-10 flex justify-end">
                                        <button
                                            onClick={(e) => handleDelete(e, tracker.id, tracker.name)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {trackers.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-tech-border rounded-3xl text-gray-500">
                        <AlertTriangle className="w-10 h-10 mb-4 opacity-50" />
                        <p>No courses found. Create one from the Dashboard!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
