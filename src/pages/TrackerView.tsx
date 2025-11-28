import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { TaskTable } from '../components/TaskTable';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Difficulty, TaskStatus } from '../types';
import { Dropdown } from '../components/Dropdown';
import { DateInput } from '../components/DateInput';
import { TimeInput } from '../components/TimeInput';
import { EisenhowerSelector } from '../components/EisenhowerSelector';
import { EisenhowerQuadrant } from '../types';

export const TrackerView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { trackers, tasks, addTask } = useGame();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
    const [status, setStatus] = useState<TaskStatus>('YET_TO_START');
    const [skillsInput, setSkillsInput] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [quadrant, setQuadrant] = useState<EisenhowerQuadrant | undefined>(undefined);
    const [description, setDescription] = useState('');

    const tracker = trackers.find(t => t.id === id);
    const trackerTasks = tasks.filter(t => t.trackerId === id);

    if (!tracker) return <div>Tracker not found</div>;

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // Parse Date
        let newDueDate: number | undefined = undefined;
        if (dateInput.length === 10) {
            const [day, month, year] = dateInput.split('/').map(Number);
            const dateObj = new Date(year, month - 1, day);

            if (timeInput.length === 5) {
                const [hours, minutes] = timeInput.split(':').map(Number);
                dateObj.setHours(hours, minutes);
            }

            newDueDate = dateObj.getTime();
        }

        addTask({
            title,
            difficulty,
            skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
            status,
            trackerId: tracker.id,
            description,
            quadrant,
            dueDate: newDueDate,
        });

        setTitle('');
        setSkillsInput('');
        setDateInput('');
        setTimeInput('');
        setDescription('');
        setQuadrant(undefined);
        setStatus('YET_TO_START');
        setIsAdding(false);
    };

    const difficultyOptions = [
        { label: 'EASY', value: 'EASY', color: '#4ade80' },
        { label: 'MEDIUM', value: 'MEDIUM', color: '#60a5fa' },
        { label: 'HARD', value: 'HARD', color: '#fb923c' },
        { label: 'EPIC', value: 'EPIC', color: '#c084fc' },
    ];

    const statusOptions = [
        { label: 'YET TO START', value: 'YET_TO_START' },
        { label: 'STARTED', value: 'STARTED' },
        { label: 'IN PROGRESS', value: 'IN_PROGRESS' },
        { label: 'COMPLETED', value: 'COMPLETED' },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-tech-surface rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{tracker.name}</h1>
                        <p className="text-gray-400 font-mono text-sm uppercase">{tracker.type} TRACKER</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-tech-primary text-black font-bold rounded hover:bg-tech-primary/80 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    NEW TASK
                </button>
            </div>

            {/* Add Task Modal / Inline Form */}
            {isAdding && (
                <div className="mb-8 p-6 rounded-xl border border-tech-border bg-tech-surface animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">NEW MISSION PARAMETERS</h3>
                        <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-gray-500" /></button>
                    </div>

                    <form onSubmit={handleAddTask} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">MISSION TITLE</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black/30 border border-tech-border rounded p-2 focus:border-tech-primary outline-none text-white"
                                placeholder="Enter task name..."
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Dropdown
                                label="DIFFICULTY"
                                value={difficulty}
                                options={difficultyOptions}
                                onChange={(val) => setDifficulty(val as Difficulty)}
                            />

                            <Dropdown
                                label="STATUS"
                                value={status}
                                options={statusOptions}
                                onChange={(val) => setStatus(val as TaskStatus)}
                            />

                            <DateInput
                                label="DUE DATE"
                                value={dateInput}
                                onChange={setDateInput}
                            />

                            <TimeInput
                                label="TIME"
                                value={timeInput}
                                onChange={setTimeInput}
                            />
                        </div>

                        <EisenhowerSelector
                            value={quadrant}
                            onChange={setQuadrant}
                        />

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">SKILLS (Comma separated)</label>
                            <input
                                value={skillsInput}
                                onChange={e => setSkillsInput(e.target.value)}
                                className="w-full bg-black/30 border border-tech-border rounded p-2 focus:border-tech-primary outline-none text-white"
                                placeholder="Focus, Coding, Design..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Notes</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-black/30 border border-tech-border rounded p-2 focus:border-tech-primary outline-none text-white min-h-[60px] resize-none"
                                placeholder="Add mission notes..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm hover:bg-white/5 rounded text-gray-400"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-tech-primary text-black font-bold rounded text-sm hover:bg-tech-primary/80"
                            >
                                INITIALIZE
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Board */}
            <div className="flex-1 overflow-auto">
                <TaskTable tasks={trackerTasks} />
            </div>
        </div>
    );
};
