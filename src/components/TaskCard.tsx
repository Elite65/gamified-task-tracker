import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Tag, MoreVertical, Edit2 } from 'lucide-react';
import { Task } from '../types';
import { TaskEditModal } from './TaskEditModal';

interface TaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, status: Task['status']) => void;
    onEdit: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit, onDelete }) => {
    const [isEditOpen, setIsEditOpen] = useState(false);

    const difficultyColors = {
        EASY: 'text-green-400 border-green-400/30 bg-green-400/10',
        MEDIUM: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
        HARD: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
        EPIC: 'text-red-400 border-red-400/30 bg-red-400/10',
    };

    const statusColors = {
        YET_TO_START: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        STARTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    return (
        <>
            <TaskEditModal
                task={task}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={onEdit}
                onDelete={onDelete}
            />

            <div className="group relative bg-tech-surface border border-tech-border rounded-2xl p-5 hover:border-tech-primary/50 transition-all hover:shadow-lg hover:shadow-tech-primary/5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColors[task.difficulty]}`}>
                                {task.difficulty}
                            </span>
                            <button
                                onClick={() => {
                                    const nextStatus = {
                                        'YET_TO_START': 'STARTED',
                                        'STARTED': 'IN_PROGRESS',
                                        'IN_PROGRESS': 'COMPLETED',
                                        'COMPLETED': 'YET_TO_START'
                                    }[task.status] as Task['status'];
                                    onStatusChange(task.id, nextStatus);
                                }}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${statusColors[task.status]}`}
                            >
                                {task.status.replace(/_/g, ' ')}
                            </button>
                        </div>
                        <h3 className={`font-bold text-lg ${task.status === 'COMPLETED' ? 'text-tech-text-secondary line-through' : 'text-tech-text'}`}>
                            {task.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="p-2 text-tech-text-secondary hover:text-tech-text hover:bg-tech-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onStatusChange(task.id, 'COMPLETED')}
                            className={`p-1 rounded-full transition-colors ${task.status === 'COMPLETED' ? 'text-green-400' : 'text-tech-text-secondary hover:text-green-400'}`}
                        >
                            {task.status === 'COMPLETED' ? (
                                <CheckCircle2 className="w-6 h-6" />
                            ) : (
                                <Circle className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-tech-text-secondary">
                    {task.dueDate && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                    )}
                    {task.skills.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            <div className="flex gap-1">
                                {task.skills.slice(0, 2).map(skill => (
                                    <span key={skill} className="bg-tech-primary/10 px-1.5 py-0.5 rounded text-[10px] text-tech-text-secondary">
                                        {skill}
                                    </span>
                                ))}
                                {task.skills.length > 2 && (
                                    <span className="bg-tech-primary/10 px-1.5 py-0.5 rounded text-[10px] text-tech-text-secondary">+{task.skills.length - 2}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
