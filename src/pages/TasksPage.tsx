import React from 'react';
import { useGame } from '../context/GameContext';
import { TaskTable } from '../components/TaskTable';
import { CheckSquare } from 'lucide-react';

export const TasksPage: React.FC = () => {
    const { tasks } = useGame();

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-tech-surface rounded-xl border border-tech-border">
                    <CheckSquare className="w-6 h-6 text-tech-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">All Missions</h1>
                    <p className="text-gray-400">Global command center for all active tasks.</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <TaskTable tasks={tasks} showTrackerColumn={true} />
            </div>
        </div>
    );
};
