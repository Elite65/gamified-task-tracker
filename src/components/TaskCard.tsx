import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Tag, MoreVertical, Edit2, AlertTriangle, ChevronDown, ChevronUp, CheckSquare, Square, Check } from 'lucide-react';
import { Task } from '../types';
import { useGame } from '../context/GameContext';
import { EditTaskModal } from './EditTaskModal';

interface TaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, status: Task['status']) => void;
    onEdit: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit, onDelete }) => {
    const { userStats } = useGame();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

    // Calculate progress based on subtasks if they exist
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const completedSubtasks = hasSubtasks ? task.subtasks!.filter(st => st.isCompleted).length : 0;
    const calculatedProgress = hasSubtasks 
        ? Math.round((completedSubtasks / task.subtasks!.length) * 100)
        : (task.progress || 0);

    // Helper to toggle a subtask and update task state automatically
    const handleToggleSubtask = (subtaskId: string) => {
        if (!task.subtasks) return;
        
        const newSubtasks = task.subtasks.map(st => 
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );
        
        const newCompleted = newSubtasks.filter(st => st.isCompleted).length;
        const newProgress = Math.round((newCompleted / newSubtasks.length) * 100);
        
        let newStatus = task.status;
        if (newCompleted === 0) newStatus = 'YET_TO_START';
        else if (newCompleted === newSubtasks.length) newStatus = 'COMPLETED';
        else newStatus = 'IN_PROGRESS';

        onEdit(task.id, { 
            subtasks: newSubtasks, 
            progress: newProgress,
            status: newStatus 
        });
    };

    // Check for legacy skills
    const validSkillNames = Object.values(userStats.skills || {}).map(s => s.name);
    const hasLegacySkills = task.skills.some(s => !validSkillNames.includes(s));

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
            {isEditOpen && (
                <EditTaskModal
                    task={task}
                    onClose={() => setIsEditOpen(false)}
                    onDelete={onDelete}
                />
            )}

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
                        {hasLegacySkills && (
                            <button
                                onClick={() => setIsEditOpen(true)}
                                title="Legacy/Unrecognized skills detected. Click to fix."
                                className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors animate-pulse"
                            >
                                <AlertTriangle className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                // Toggle logic: If completed, reopen (to STARTED). If active, complete.
                                if (task.status === 'COMPLETED') {
                                    onStatusChange(task.id, 'STARTED');
                                } else {
                                    onStatusChange(task.id, 'COMPLETED');
                                }
                            }}
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

                {/* Description / Notes Display */}
                {task.description && (
                    <div className="mt-3 pt-3 border-t border-tech-border/30 text-xs text-tech-text-secondary whitespace-pre-wrap">
                        {task.description}
                    </div>
                )}

                {/* Subtasks Summary & Expand */}
                {hasSubtasks && (
                    <div className="mt-3 pt-3 border-t border-tech-border/30">
                        <button 
                            onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                            className="flex items-center justify-between w-full text-xs text-tech-text-secondary hover:text-tech-text transition-colors"
                        >
                            <span className="flex items-center gap-1.5 font-medium">
                                <Check className="w-3.5 h-3.5" />
                                {completedSubtasks} / {task.subtasks!.length} Subtasks
                            </span>
                            {isSubtasksExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        {isSubtasksExpanded && (
                            <div className="mt-2 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                {task.subtasks!.map(subtask => (
                                    <div 
                                        key={subtask.id} 
                                        className="flex items-start gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors"
                                        onClick={() => handleToggleSubtask(subtask.id)}
                                    >
                                        <button className={`mt-0.5 shrink-0 transition-colors ${subtask.isCompleted ? 'text-tech-primary' : 'text-gray-500'}`}>
                                            {subtask.isCompleted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                        </button>
                                        <span className={`text-xs ${subtask.isCompleted ? 'text-gray-500 line-through' : 'text-tech-text'}`}>
                                            {subtask.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Bar */}
                {((hasSubtasks) || (task.progress !== undefined && task.progress > 0)) && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-tech-text-secondary font-mono uppercase">Progress</span>
                            <span className="text-[10px] text-tech-primary font-mono">{calculatedProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-tech-border/30 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-tech-primary transition-all duration-500 rounded-full" 
                                style={{ width: `${calculatedProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
