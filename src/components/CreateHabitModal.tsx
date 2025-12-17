import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Calendar, Clock, BarChart2, Repeat, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DateInput } from './DateInput';
import { Habit, HabitType } from '../types';

interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Habit;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addHabit, updateHabit, deleteHabit } = useGame();
    const isEditing = !!initialData;

    // Form State
    const [title, setTitle] = useState('');
    const [type, setType] = useState<HabitType>('QUANTITY');
    const [goalAmount, setGoalAmount] = useState<number>(1);
    const [unit, setUnit] = useState('');
    const [startDateRaw, setStartDateRaw] = useState(''); // DD/MM/YYYY
    const [durationDays, setDurationDays] = useState<number>(30);
    const [carryOver, setCarryOver] = useState(false);
    const [themeColor, setThemeColor] = useState('tech-primary');

    const availableColors = ['tech-primary', 'tech-secondary', 'tech-accent', 'blue-400', 'green-400', 'purple-400', 'amber-400', 'red-400', 'pink-400'];

    // Load initial data for editing
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setType(initialData.type);
                setGoalAmount(initialData.goalAmount);
                setUnit(initialData.unit);
                const d = new Date(initialData.startDate);
                setStartDateRaw(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
                setDurationDays(initialData.durationDays);
                setCarryOver(initialData.carryOver);
                setThemeColor(initialData.themeColor);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    const getUnitPlaceholder = () => {
        if (type === 'TIME') return 'mins, hours...';
        return 'pages, reps, liters...';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            console.log('Submit Triggered');

            if (!title.trim()) {
                alert('Title is required');
                return;
            }

            // Parse Start Date
            let startTimestamp = Date.now();

            // Try to parse input first
            let parsedDate = false;
            try {
                if (startDateRaw && startDateRaw.length >= 8) {
                    const parts = startDateRaw.split('/');
                    if (parts.length === 3) {
                        const [day, month, year] = parts.map(Number);
                        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                            const d = new Date(year, month - 1, day);
                            startTimestamp = d.getTime();
                            parsedDate = true;
                        }
                    }
                }
            } catch (dateError) {
                console.error('Date parsing error', dateError);
            }

            // Fallback to original date if editing and parsing failed/empty
            if (!parsedDate && isEditing && initialData) {
                startTimestamp = initialData.startDate;
            }

            const habitData = {
                title,
                type,
                goalAmount: Number(goalAmount),
                unit: unit || (type === 'TIME' ? 'mins' : 'units'),
                startDate: startTimestamp,
                durationDays: Number(durationDays),
                carryOver,
                themeColor,
            };

            console.log('Sending Update/Create', habitData);

            if (isEditing && initialData) {
                // Call update - catch potential sync errors from Context
                try {
                    updateHabit(initialData.id, habitData);
                } catch (ctxError: any) {
                    console.error('Context Update Error', ctxError);
                    alert(`Update Error: ${ctxError.message}`);
                }
            } else {
                addHabit({
                    ...habitData,
                    userId: '' // Context adds this
                });
            }

            console.log('Closing Modal');
            onClose();

        } catch (error: any) {
            console.error('HandleSubmit Crash', error);
            alert(`Submit Crash: ${error.message}`);
        }
    };

    const resetForm = () => {
        setTitle('');
        setType('QUANTITY');
        setGoalAmount(1);
        setUnit('');
        setStartDateRaw('');
        setDurationDays(30);
        setCarryOver(false);
        setThemeColor('tech-primary');
    };

    if (!isOpen) return null;



    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm text-tech-text">
            <div className="w-full max-w-md bg-tech-surface border-t md:border border-tech-border rounded-t-3xl md:rounded-3xl p-6 shadow-2xl h-[90vh] md:max-h-[90vh] md:h-auto flex flex-col text-tech-text animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200">

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Repeat className="w-5 h-5 text-tech-primary" />
                        {isEditing ? 'Edit Habit Protocol' : 'New Habit Protocol'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-tech-surface-hover rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form id="habit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-6 px-1">
                    {/* ... form content ... */}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Habit Title</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Read Books, Meditate..."
                            className="w-full bg-tech-bg border border-tech-border rounded-xl p-4 text-lg font-bold focus:border-tech-primary outline-none transition-colors"
                        />
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Tracking Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => { setType('QUANTITY'); setUnit(''); }}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${type === 'QUANTITY'
                                    ? 'bg-tech-primary/20 border-tech-primary text-tech-primary'
                                    : 'bg-tech-bg border-tech-border hover:border-tech-primary/50 text-gray-400'
                                    }`}
                            >
                                <BarChart2 className="w-4 h-4" />
                                <span className="font-bold">Quantity</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setType('TIME'); setUnit('mins'); }}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${type === 'TIME'
                                    ? 'bg-tech-primary/20 border-tech-primary text-tech-primary'
                                    : 'bg-tech-bg border-tech-border hover:border-tech-primary/50 text-gray-400'
                                    }`}
                            >
                                <Clock className="w-4 h-4" />
                                <span className="font-bold">Time</span>
                            </button>
                        </div>
                    </div>

                    {/* Goal & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Daily Goal</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={goalAmount}
                                onChange={e => setGoalAmount(Number(e.target.value))}
                                className="w-full bg-tech-bg border border-tech-border rounded-xl p-3 font-mono focus:border-tech-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Unit</label>
                            <input
                                type="text"
                                required
                                value={unit}
                                onChange={e => setUnit(e.target.value)}
                                placeholder={getUnitPlaceholder()}
                                className="w-full bg-tech-bg border border-tech-border rounded-xl p-3 font-mono focus:border-tech-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Duration & Start Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Duration (Days)</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={durationDays}
                                onChange={e => setDurationDays(Number(e.target.value))}
                                className="w-full bg-tech-bg border border-tech-border rounded-xl p-3 font-mono focus:border-tech-primary outline-none"
                            />
                        </div>
                        <DateInput
                            label="Start Date"
                            value={startDateRaw}
                            onChange={setStartDateRaw}
                            placeholder="Today"
                        />
                    </div>

                    {/* Carry Over Toggle */}
                    <div className="flex items-center justify-between p-4 bg-tech-bg rounded-xl border border-tech-border">
                        <div>
                            <p className="font-bold text-sm">Carry Over Deficit</p>
                            <p className="text-xs text-gray-400">Add missed goal to next day</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCarryOver(!carryOver)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${carryOver ? 'bg-tech-primary' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carryOver ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Theme Color</label>
                        <div className="flex flex-wrap gap-2">
                            {availableColors.map(color => (
                                <button
                                    type="button"
                                    key={color}
                                    onClick={() => setThemeColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${themeColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{
                                        backgroundColor: color.startsWith('tech-') ? `var(--color-${color.replace('tech-', '')})` : undefined
                                    }}
                                >
                                    <div className={`w-full h-full rounded-full ${color.startsWith('tech-') ? '' : 'bg-' + color}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                </form>

                <div className="p-4 border-t border-tech-border mt-auto bg-tech-surface/95 backdrop-blur rounded-b-3xl md:rounded-b-3xl">
                    <div className="flex gap-3">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this habit protocol? This cannot be undone.')) {
                                        if (initialData?.id) {
                                            deleteHabit(initialData.id);
                                        }
                                        onClose();
                                    }
                                }}
                                className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e as any)}
                            disabled={!title}
                            className="flex-1 py-4 bg-tech-primary text-black font-bold rounded-xl hover:bg-tech-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Update Protocol' : 'Initialize Habit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};


