import React from 'react';
import { useGame } from '../context/GameContext';
import { TaskCard } from '../components/TaskCard';
import { CheckSquare } from 'lucide-react';

export const TasksPage: React.FC = () => {
    const { tasks, updateTaskStatus, updateTask, deleteTask } = useGame();

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-tech-surface rounded-xl border border-tech-border">
                    <CheckSquare className="w-6 h-6 text-tech-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">All Missions</h1>
                    <p className="text-tech-text-secondary">Global command center for all active tasks.</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={updateTaskStatus}
                            onEdit={updateTask}
                            onDelete={deleteTask}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="col-span-full text-center py-20 text-tech-text-secondary">
                            No active missions. Initialize a new one from the Dashboard.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
