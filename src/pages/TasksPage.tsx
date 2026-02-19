import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TaskCard } from '../components/TaskCard';
import { CheckSquare, Plus } from 'lucide-react';
import { CreateTaskModal } from '../components/CreateTaskModal';

export const TasksPage: React.FC = () => {
    const { tasks, updateTaskStatus, updateTask, deleteTask } = useGame();
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-tech-surface rounded-xl border border-tech-border">
                        <CheckSquare className="w-6 h-6 text-tech-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">All Missions</h1>
                        <p className="text-tech-text-secondary">Global command center for all active tasks.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-tech-primary text-black font-bold rounded-xl hover:bg-tech-primary/80 transition-all shadow-lg hover:shadow-tech-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Mission</span>
                </button>
            </div>

            <div className="flex-1 overflow-auto p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {tasks.filter(t => !t.isEvent).map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={updateTaskStatus}
                            onEdit={updateTask}
                            onDelete={deleteTask}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-tech-text-secondary gap-4 border border-dashed border-tech-border rounded-3xl bg-tech-surface/30">
                            <CheckSquare className="w-12 h-12 opacity-20" />
                            <p>No active missions. Initialize one to start tracking.</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-tech-primary font-bold hover:underline"
                            >
                                Initialize Mission
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isCreating && (
                <CreateTaskModal
                    onClose={() => setIsCreating(false)}
                />
            )}
        </div>
    );
};
