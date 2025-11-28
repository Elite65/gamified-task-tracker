import React, { useState } from 'react';
import { Task, Difficulty, TaskStatus } from '../types';
import { useGame } from '../context/GameContext';
import { X, Save, Calendar, Target, Zap, Activity, FileText } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { DateInput } from './DateInput';
import { TimeInput } from './TimeInput';
import { EisenhowerSelector } from './EisenhowerSelector';
import { EisenhowerQuadrant } from '../types';

interface EditTaskModalProps {
    task: Task;
    onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose }) => {
    const { updateTask } = useGame();

    const [title, setTitle] = useState(task.title);
    const [difficulty, setDifficulty] = useState<Difficulty>(task.difficulty);
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [quadrant, setQuadrant] = useState<EisenhowerQuadrant | undefined>(task.quadrant);
    const [skillsInput, setSkillsInput] = useState(task.skills.join(', '));
    const [description, setDescription] = useState(task.description || '');

    // Date Management
    const formatDate = (timestamp?: number) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        // If it's 00:00, we might want to show it or leave empty? 
        // Let's show it if it exists.
        return `${hours}:${minutes}`;
    };

    const [dateInput, setDateInput] = useState(formatDate(task.dueDate));
    const [timeInput, setTimeInput] = useState(formatTime(task.dueDate));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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

        updateTask(task.id, {
            title,
            difficulty,
            status,
            quadrant,
            skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
            description,
            dueDate: newDueDate
        });

        onClose();
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-tech-surface border border-tech-border rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-tech-border/50 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-tech-primary" />
                        Edit Mission
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Mission Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black/30 border border-tech-border rounded-lg p-3 focus:border-tech-primary outline-none font-medium text-white"
                            placeholder="Enter mission name..."
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Difficulty */}
                        <Dropdown
                            label="Difficulty"
                            value={difficulty}
                            options={difficultyOptions}
                            onChange={(val) => setDifficulty(val as Difficulty)}
                        />

                        {/* Status */}
                        <Dropdown
                            label="Status"
                            value={status}
                            options={statusOptions}
                            onChange={(val) => setStatus(val as TaskStatus)}
                        />
                    </div>

                    {/* Due Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <DateInput
                            label="Due Date"
                            value={dateInput}
                            onChange={setDateInput}
                        />
                        <TimeInput
                            label="Time"
                            value={timeInput}
                            onChange={setTimeInput}
                        />
                    </div>

                    {/* Eisenhower Matrix */}
                    <EisenhowerSelector
                        value={quadrant}
                        onChange={setQuadrant}
                    />

                    {/* Skills */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Skills (Comma Separated)</label>
                        <input
                            value={skillsInput}
                            onChange={e => setSkillsInput(e.target.value)}
                            className="w-full bg-black/30 border border-tech-border rounded-lg p-3 focus:border-tech-primary outline-none text-white"
                            placeholder="Focus, Coding, Design..."
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Notes</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-black/30 border border-tech-border rounded-lg p-3 focus:border-tech-primary outline-none text-white min-h-[80px] resize-none"
                            placeholder="Add mission notes..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-tech-border/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 bg-tech-primary text-black font-bold rounded-lg hover:bg-tech-primary/80 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
