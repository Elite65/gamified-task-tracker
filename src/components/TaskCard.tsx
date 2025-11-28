import React from 'react';
import { Task, TaskStatus } from '../types';
import { useGame } from '../context/GameContext';
import { CheckCircle, Circle, Clock, PlayCircle, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
    task: Task;
}

const difficultyColor = {
    EASY: 'text-green-400 border-green-400/30 bg-green-400/10',
    MEDIUM: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    HARD: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    EPIC: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { updateTaskStatus, deleteTask } = useGame();

    const nextStatus: Record<TaskStatus, TaskStatus> = {
        'YET_TO_START': 'STARTED',
        'STARTED': 'IN_PROGRESS',
        'IN_PROGRESS': 'COMPLETED',
        'COMPLETED': 'COMPLETED'
    };

    const handleAdvance = () => {
        if (task.status !== 'COMPLETED') {
            updateTaskStatus(task.id, nextStatus[task.status]);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 rounded-lg border border-tech-border bg-tech-surface hover:bg-tech-surface-hover transition-colors group relative"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${difficultyColor[task.difficulty]}`}>
                    {task.difficulty}
                </span>
                <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <h4 className="font-bold mb-2 flex items-center gap-2">
                {task.title}
                {task.description && (
                    <div className="relative inline-block group/note">
                        <FileText className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-black/90 border border-tech-border rounded text-[10px] text-gray-300 pointer-events-none opacity-0 group-hover/note:opacity-100 transition-opacity z-10 whitespace-normal">
                            {task.description}
                        </div>
                    </div>
                )}
            </h4>

            {task.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {task.skills.map(skill => (
                        <span key={skill} className="text-[10px] font-mono text-gray-400 px-1 border border-gray-700 rounded">
                            {skill}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="text-xs text-gray-500 font-mono">
                    {new Date(task.createdAt).toLocaleDateString()}
                </div>

                {task.status !== 'COMPLETED' ? (
                    <button
                        onClick={handleAdvance}
                        className="flex items-center gap-1 text-xs text-tech-primary hover:text-white transition-colors"
                    >
                        <span>ADVANCE</span>
                        <PlayCircle className="w-4 h-4" />
                    </button>
                ) : (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        DONE
                    </span>
                )}
            </div>
        </motion.div>
    );
};
