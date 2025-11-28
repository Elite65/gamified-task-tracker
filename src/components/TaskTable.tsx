import React, { useState } from 'react';
import { Task, TaskStatus, Difficulty } from '../types';
import { useGame } from '../context/GameContext';
import { CheckCircle2, Circle, Trash2, AlertCircle, Edit2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditTaskModal } from './EditTaskModal';

interface TaskTableProps {
    tasks: Task[];
    showTrackerColumn?: boolean;
}

const statusColors: Record<TaskStatus, string> = {
    'YET_TO_START': 'text-gray-500',
    'STARTED': 'text-blue-400',
    'IN_PROGRESS': 'text-amber-400',
    'COMPLETED': 'text-green-400'
};

const difficultyColors: Record<Difficulty, string> = {
    'EASY': 'bg-green-400/10 text-green-400 border-green-400/20',
    'MEDIUM': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    'HARD': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    'EPIC': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
};

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, showTrackerColumn = false }) => {
    const { updateTaskStatus, updateTask, deleteTask, trackers } = useGame();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const getTrackerName = (trackerId: string) => {
        return trackers.find(t => t.id === trackerId)?.name || 'Unknown';
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-tech-border rounded-xl">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>No active missions found.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-hidden rounded-xl border border-tech-border bg-tech-surface/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-tech-border text-xs font-mono text-gray-400 uppercase">
                            <th className="p-4 font-medium w-12">#</th>
                            <th className="p-4 font-medium">Mission</th>
                            {showTrackerColumn && <th className="p-4 font-medium">Module</th>}
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Difficulty</th>
                            <th className="p-4 font-medium">Skills</th>
                            <th className="p-4 font-medium w-24 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {tasks.map((task, index) => (
                                <motion.tr
                                    key={task.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group border-b border-tech-border/50 hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-4 text-gray-500 text-xs font-mono">{index + 1}</td>
                                    <td className="p-4 font-medium">
                                        <div className={task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-white'}>
                                            {task.title}
                                            {task.description && (
                                                <div className="relative inline-block ml-2 group/note">
                                                    <FileText className="w-3 h-3 text-gray-400 inline cursor-help" />
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-black/90 border border-tech-border rounded text-[10px] text-gray-300 pointer-events-none opacity-0 group-hover/note:opacity-100 transition-opacity z-10 whitespace-normal">
                                                        {task.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {task.dueDate && (
                                            <div className="text-[10px] text-gray-500 mt-1 font-mono">
                                                Due: {new Date(task.dueDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(', 00:00', '')}
                                            </div>
                                        )}
                                    </td>
                                    {showTrackerColumn && (
                                        <td className="p-4 text-sm text-gray-400">
                                            {getTrackerName(task.trackerId)}
                                        </td>
                                    )}
                                    <td className="p-4">
                                        <select
                                            value={task.status}
                                            onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                            className={`bg-transparent border-none outline-none text-xs font-bold cursor-pointer ${statusColors[task.status]}`}
                                        >
                                            <option value="YET_TO_START" className="bg-tech-surface text-gray-500">YET TO START</option>
                                            <option value="STARTED" className="bg-tech-surface text-blue-400">STARTED</option>
                                            <option value="IN_PROGRESS" className="bg-tech-surface text-amber-400">IN PROGRESS</option>
                                            <option value="COMPLETED" className="bg-tech-surface text-green-400">COMPLETED</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={task.difficulty}
                                            onChange={(e) => updateTask(task.id, { difficulty: e.target.value as Difficulty })}
                                            className={`px-2 py-1 rounded text-[10px] font-bold border outline-none cursor-pointer ${difficultyColors[task.difficulty]}`}
                                        >
                                            <option value="EASY" className="bg-tech-surface text-green-400">EASY</option>
                                            <option value="MEDIUM" className="bg-tech-surface text-blue-400">MEDIUM</option>
                                            <option value="HARD" className="bg-tech-surface text-amber-400">HARD</option>
                                            <option value="EPIC" className="bg-tech-surface text-purple-400">EPIC</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {task.skills.map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingTask(task)}
                                                className="p-2 text-gray-500 hover:text-tech-primary hover:bg-tech-primary/10 rounded transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                <AnimatePresence>
                    {tasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-xl border border-tech-border bg-tech-surface/50 space-y-3"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-white'}`}>
                                        {task.title}
                                    </div>
                                    {showTrackerColumn && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {getTrackerName(task.trackerId)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingTask(task)}
                                        className="p-2 text-gray-500 hover:text-tech-primary bg-white/5 rounded-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 bg-white/5 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {task.description && (
                                <p className="text-xs text-gray-400">{task.description}</p>
                            )}

                            <div className="flex flex-wrap gap-2 items-center">
                                <select
                                    value={task.status}
                                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                    className={`bg-transparent border-none outline-none text-xs font-bold cursor-pointer ${statusColors[task.status]}`}
                                >
                                    <option value="YET_TO_START" className="bg-tech-surface text-gray-500">YET TO START</option>
                                    <option value="STARTED" className="bg-tech-surface text-blue-400">STARTED</option>
                                    <option value="IN_PROGRESS" className="bg-tech-surface text-amber-400">IN PROGRESS</option>
                                    <option value="COMPLETED" className="bg-tech-surface text-green-400">COMPLETED</option>
                                </select>

                                <select
                                    value={task.difficulty}
                                    onChange={(e) => updateTask(task.id, { difficulty: e.target.value as Difficulty })}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border outline-none cursor-pointer ${difficultyColors[task.difficulty]}`}
                                >
                                    <option value="EASY" className="bg-tech-surface text-green-400">EASY</option>
                                    <option value="MEDIUM" className="bg-tech-surface text-blue-400">MEDIUM</option>
                                    <option value="HARD" className="bg-tech-surface text-amber-400">HARD</option>
                                    <option value="EPIC" className="bg-tech-surface text-purple-400">EPIC</option>
                                </select>
                            </div>

                            <div className="flex gap-1 flex-wrap">
                                {task.skills.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {task.dueDate && (
                                <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-tech-border/50">
                                    Due: {new Date(task.dueDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(', 00:00', '')}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}
        </>
    );
};
