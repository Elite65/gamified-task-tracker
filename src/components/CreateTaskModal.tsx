import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Difficulty, TaskStatus, Subtask } from '../types';
import { useGame } from '../context/GameContext';
import { X, Save, Activity, Plus, Trash2 } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { DateInput } from './DateInput';
import { TimeInput } from './TimeInput';
import { EisenhowerSelector } from './EisenhowerSelector';
import { EisenhowerQuadrant } from '../types';
import { SkillSelector } from './SkillSelector';

interface CreateTaskModalProps {
    onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose }) => {
    const { addTask, trackers } = useGame();

    const [title, setTitle] = useState('');
    const [trackerId, setTrackerId] = useState(trackers.length > 0 ? trackers[0].id : '');
    const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
    // Default status for new task is YET_TO_START
    const [status, setStatus] = useState<TaskStatus>('YET_TO_START');
    const [quadrant, setQuadrant] = useState<EisenhowerQuadrant | undefined>(undefined);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    
    // Subtasks and Progress
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [progress, setProgress] = useState(0);

    const handleAddSubtask = () => {
        if (newSubtaskTitle.trim()) {
            setSubtasks([...subtasks, { id: Date.now().toString() + Math.random(), title: newSubtaskTitle.trim(), isCompleted: false }]);
            setNewSubtaskTitle('');
            // Status auto-update
            setStatus('YET_TO_START');
            setProgress(0);
        }
    };

    const handleRemoveSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    // Default Date: Today
    const today = new Date();
    const defaultDateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const [dateInput, setDateInput] = useState(defaultDateStr);
    const [timeInput, setTimeInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        // Parse Date
        let processedDueDate: number | undefined = undefined;
        if (dateInput.length >= 8) {
            const [day, month, year] = dateInput.split('/').map(Number);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const dateObj = new Date(year, month - 1, day);

                if (timeInput.length === 5) {
                    const [hours, minutes] = timeInput.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        dateObj.setHours(hours, minutes);
                    }
                }
                processedDueDate = dateObj.getTime();
            }
        }

        addTask({
            title,
            difficulty,
            status,
            trackerId,
            quadrant,
            skills: selectedSkills,
            description,
            dueDate: processedDueDate,
            subtasks: subtasks.length > 0 ? subtasks : undefined,
            progress: subtasks.length > 0 ? 0 : progress
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

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[9999] p-0 md:p-4">
            <div className="bg-tech-surface border-t md:border border-tech-border rounded-t-3xl md:rounded-2xl w-full max-w-md flex flex-col h-[85vh] md:h-auto md:max-h-[90vh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-tech-border/50 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-tech-primary" />
                        Init New Mission
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 pb-32 md:pb-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Mission Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black/30 border border-tech-border rounded-lg p-4 md:p-3 text-base md:text-sm focus:border-tech-primary outline-none font-medium text-white"
                            placeholder="Enter mission name..."
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tracker Selection */}
                        <Dropdown
                            label="Module / Tracker"
                            value={trackerId}
                            options={trackers.map(t => ({ label: t.name, value: t.id }))}
                            onChange={setTrackerId}
                        />

                        {/* Difficulty */}
                        <Dropdown
                            label="Difficulty"
                            value={difficulty}
                            options={difficultyOptions}
                            onChange={(val) => setDifficulty(val as Difficulty)}
                        />

                        {/* Status (Optional for creation, but good to have) */}
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
                    <SkillSelector
                        selectedSkills={selectedSkills}
                        onChange={setSelectedSkills}
                    />

                    {/* Subtasks */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Subtasks</label>
                        <div className="space-y-2 mb-2">
                            {subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-tech-border/50">
                                    <span className="flex-1 text-sm text-tech-text">{st.title}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveSubtask(st.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={newSubtaskTitle}
                                onChange={e => setNewSubtaskTitle(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSubtask();
                                    }
                                }}
                                className="flex-1 bg-black/30 border border-tech-border rounded-lg p-2 text-sm focus:border-tech-primary outline-none text-white"
                                placeholder="Add a subtask..."
                            />
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                disabled={!newSubtaskTitle.trim()}
                                className="p-2 bg-tech-surface border border-tech-border rounded-lg hover:border-tech-primary hover:text-tech-primary transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Manual Progress Slider (Only if no subtasks) */}
                    {subtasks.length === 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-mono text-gray-400 uppercase">Manual Progress</label>
                                <span className="text-xs font-mono text-tech-primary">{progress}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setProgress(val);
                                    if (val === 0) setStatus('YET_TO_START');
                                    else if (val === 100) setStatus('COMPLETED');
                                    else setStatus('IN_PROGRESS');
                                }}
                                className="w-full accent-tech-primary"
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Notes</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-black/30 border border-tech-border rounded-lg p-4 md:p-3 text-base md:text-sm focus:border-tech-primary outline-none text-white min-h-[80px] resize-none"
                            placeholder="Add mission notes..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-tech-border/50 gap-3">
                        <div className="flex gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 md:py-2 hover:bg-white/5 rounded-xl text-sm font-medium text-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!title.trim()}
                                className="flex items-center gap-2 px-8 py-3 md:py-2 bg-tech-primary text-black font-bold rounded-xl hover:bg-tech-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Initialize
                            </button>
                        </div>
                    </div>
                </form>
            </div >
        </div >
        , document.body);
};
