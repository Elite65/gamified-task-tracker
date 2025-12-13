import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Target, Zap } from 'lucide-react';
import { Task, Difficulty, TaskStatus } from '../types';
import { DateInput } from './DateInput';

interface TaskEditModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, isOpen, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
    const [status, setStatus] = useState<TaskStatus>('YET_TO_START');
    const [skills, setSkills] = useState<string>('');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDifficulty(task.difficulty);
            setStatus(task.status);
            setSkills(task.skills.join(', '));

            if (task.dueDate) {
                const date = new Date(task.dueDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                setDueDate(`${day}/${month}/${year}`);
            } else {
                setDueDate('');
            }
        }
    }, [task, isOpen]);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        // Parse Date
        let timestamp: number | undefined;
        if (dueDate.length === 10) {
            const [day, month, year] = dueDate.split('/').map(Number);
            timestamp = new Date(year, month - 1, day).getTime();
        }

        // Parse Skills
        const skillsList = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

        onSave(task.id, {
            title,
            difficulty,
            status,
            skills: skillsList,
            dueDate: timestamp
        });
        onClose();
    };

    const handleDelete = () => {
        onDelete(task.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-tech-surface border border-tech-border rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl shadow-tech-primary/10">

                <div className="p-6 border-b border-tech-border flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-tech-primary" />
                        Edit Mission
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Mission Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black/30 border border-tech-border rounded-xl p-3 focus:border-tech-primary outline-none transition-colors"
                            placeholder="Enter mission title"
                        />
                    </div>

                    {/* Date & Difficulty Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Due Date</label>
                            <div className="relative">
                                <DateInput
                                    value={dueDate}
                                    onChange={setDueDate}
                                    className="w-full bg-black/30 border border-tech-border rounded-xl p-3 pl-10 focus:border-tech-primary outline-none transition-colors"
                                />
                                <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                                className="w-full bg-black/30 border border-tech-border rounded-xl p-3 focus:border-tech-primary outline-none transition-colors appearance-none"
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                                <option value="EPIC">Epic</option>
                            </select>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TaskStatus)}
                            className="w-full bg-black/30 border border-tech-border rounded-xl p-3 focus:border-tech-primary outline-none transition-colors appearance-none"
                        >
                            <option value="YET_TO_START">Yet to Start</option>
                            <option value="STARTED">Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Skills (Comma Separated)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full bg-black/30 border border-tech-border rounded-xl p-3 pl-10 focus:border-tech-primary outline-none transition-colors"
                                placeholder="Focus, Coding, Design..."
                            />
                            <Zap className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-tech-border flex justify-between items-center bg-black/20">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 hover:bg-white/10 rounded-xl transition-colors font-bold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 bg-tech-primary text-black rounded-xl font-bold text-sm hover:bg-tech-primary/80 transition-colors shadow-lg shadow-tech-primary/20"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
