import React from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { motion } from 'framer-motion';

interface TaskBoardProps {
    tasks: Task[];
}

const columns: { id: TaskStatus; label: string }[] = [
    { id: 'YET_TO_START', label: 'NOT STARTED' },
    { id: 'STARTED', label: 'STARTED' },
    { id: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { id: 'COMPLETED', label: 'COMPLETED' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
            {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);

                return (
                    <div key={col.id} className="min-w-[250px]">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-tech-border">
                            <h3 className="font-mono text-sm text-gray-400">{col.label}</h3>
                            <span className="text-xs bg-tech-surface px-2 py-0.5 rounded-full text-gray-500">
                                {colTasks.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {colTasks.map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                            {colTasks.length === 0 && (
                                <div className="h-24 border border-dashed border-gray-800 rounded-lg flex items-center justify-center text-gray-700 text-xs font-mono">
                                    NO TASKS
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
