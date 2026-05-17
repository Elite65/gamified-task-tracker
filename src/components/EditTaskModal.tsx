import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Task, Difficulty, TaskStatus, Subtask } from '../types';
import { useGame } from '../context/GameContext';
import { X, Save, Calendar, Target, Zap, Activity, FileText, Trash2, Plus, CheckSquare, Square } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { DateInput } from './DateInput';
import { TimeInput } from './TimeInput';
import { EisenhowerSelector } from './EisenhowerSelector';
import { EisenhowerQuadrant } from '../types';
import { SkillSelector } from './SkillSelector';

interface EditTaskModalProps {
    task: Task;
    onClose: () => void;
    onDelete?: (taskId: string) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onDelete }) => {
    const { updateTask } = useGame();

    const [title, setTitle] = useState(task.title);
    const [difficulty, setDifficulty] = useState<Difficulty>(task.difficulty);
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [quadrant, setQuadrant] = useState<EisenhowerQuadrant | undefined>(task.quadrant);
    const [selectedSkills, setSelectedSkills] = useState<string[]>(task.skills);
    const [description, setDescription] = useState(task.description || '');

    // Subtasks and Progress
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [progress, setProgress] = useState(task.progress || 0);

    const handleAddSubtask = () => {
        if (newSubtaskTitle.trim()) {
            const newSubtasks = [...subtasks, { id: Date.now().toString() + Math.random(), title: newSubtaskTitle.trim(), isCompleted: false }];
            setSubtasks(newSubtasks);
            setNewSubtaskTitle('');
            updateProgressAndStatus(newSubtasks);
        }
    };

    const handleRemoveSubtask = (id: string) => {
        const newSubtasks = subtasks.filter(st => st.id !== id);
        setSubtasks(newSubtasks);
        updateProgressAndStatus(newSubtasks);
    };

    const handleToggleSubtask = (id: string) => {
        const newSubtasks = subtasks.map(st => st.id === id ? { ...st, isCompleted: !st.isCompleted } : st);
        setSubtasks(newSubtasks);
        updateProgressAndStatus(newSubtasks);
    };

    const updateProgressAndStatus = (currentSubtasks: Subtask[]) => {
        if (currentSubtasks.length === 0) return;
        const completed = currentSubtasks.filter(st => st.isCompleted).length;
        const newProgress = Math.round((completed / currentSubtasks.length) * 100);
        setProgress(newProgress);
        
        if (completed === 0) setStatus('YET_TO_START');
        else if (completed === currentSubtasks.length) setStatus('COMPLETED');
        else setStatus('IN_PROGRESS');
    };

    // ... Date Management ...
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
        return `${hours}:${minutes}`;
    };

    const [dateInput, setDateInput] = useState(formatDate(task.dueDate));
    const [timeInput, setTimeInput] = useState(formatTime(task.dueDate));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse Date
        let newDueDate: number | undefined = undefined;
        if (dateInput.length >= 8) { // basic length check
            const [day, month, year] = dateInput.split('/').map(Number);
            // Verify numbers
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const dateObj = new Date(year, month - 1, day);

                if (timeInput.length === 5) {
                    const [hours, minutes] = timeInput.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        dateObj.setHours(hours, minutes);
                    }
                }
                newDueDate = dateObj.getTime();
            }
        }

        // If date input was cleared/empty, newDueDate remains undefined (which might clear it or keep it depending on API)
        // logic: if user cleared input, they probably want to remove date? 
        // Current implementation passes undefined.

        updateTask(task.id, {
            title,
            difficulty,
            status,
            quadrant,
            skills: selectedSkills,
            description,
            dueDate: newDueDate,
            subtasks: subtasks.length > 0 ? subtasks : undefined,
            progress: subtasks.length > 0 ? 0 : progress
        });

        onClose();
    };

    const handleDelete = () => {
        if (onDelete && window.confirm('Are you sure you want to delete this mission?')) {
            onDelete(task.id);
            onClose();
        }
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
                        Edit Mission
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
                            onChange={(val) => {
                                if (subtasks.length > 0) return; // Prevent manual status change if driven by subtasks
                                setStatus(val as TaskStatus);
                                if (val === 'YET_TO_START') setProgress(0);
                                if (val === 'COMPLETED') setProgress(100);
                            }}
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
                                    <button 
                                        type="button"
                                        onClick={() => handleToggleSubtask(st.id)}
                                        className={`shrink-0 transition-colors ${st.isCompleted ? 'text-tech-primary' : 'text-gray-500'}`}
                                    >
                                        {st.isCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                    <span className={`flex-1 text-sm ${st.isCompleted ? 'text-gray-500 line-through' : 'text-tech-text'}`}>
                                        {st.title}
                                    </span>
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
                        {onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-3 md:py-2 text-red-500 hover:bg-red-500/10 rounded-xl font-bold flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                                <span className="md:hidden">Delete</span>
                            </button>
                        )}
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
                                className="flex items-center gap-2 px-8 py-3 md:py-2 bg-tech-primary text-black font-bold rounded-xl hover:bg-tech-primary/80 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        , document.body);
};
