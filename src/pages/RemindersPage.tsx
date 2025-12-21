import React, { useState } from 'react';
import { Bell, Trash2, Plus, CheckSquare, Activity, ArrowLeft, Pencil } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DateInput } from '../components/DateInput';
import { TimeInput } from '../components/TimeInput';
import { useNavigate } from 'react-router-dom';

export const RemindersPage: React.FC = () => {
    const { reminders, addReminder, deleteReminder, updateReminder } = useGame();
    const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
    const navigate = useNavigate();

    // Form State
    const [title, setTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Date/Time State
    const today = new Date();
    const defaultDateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const [dateInput, setDateInput] = useState(defaultDateStr);
    const [timeInput, setTimeInput] = useState('');

    const startEdit = (reminder: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setTitle(reminder.title);

        const d = new Date(reminder.time);
        setDateInput(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
        setTimeInput(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);

        setEditingId(reminder.id);
        setView('ADD');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dateInput) return;

        // Parse Date Logic
        let timestamp = Date.now();
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
                timestamp = dateObj.getTime();
            }
        }

        if (editingId) {
            updateReminder(editingId, {
                title,
                time: timestamp,
                isEnabled: true
            });
        } else {
            addReminder({
                title,
                time: timestamp,
                isEnabled: true
            });
        }

        // Reset
        setTitle('');
        setDateInput(defaultDateStr);
        setTimeInput('');
        setEditingId(null);
        setView('LIST');
    };

    const handleCancel = () => {
        setTitle('');
        setDateInput(defaultDateStr);
        setTimeInput('');
        setEditingId(null);
        setView('LIST');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteReminder(id);
    };

    const toggleEnable = (id: string, current: boolean) => {
        updateReminder(id, { isEnabled: !current });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-tech-text-secondary hover:text-tech-text"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tech-primary via-white to-tech-secondary">
                        Tactical Alerts
                    </h1>
                    <p className="text-tech-text-secondary mt-1">Manage time-sensitive protocols and reminders</p>
                </div>
            </div>

            {/* Main Surface */}
            <div className="bg-tech-surface border border-tech-border rounded-3xl overflow-hidden shadow-2xl relative min-h-[600px] flex flex-col">
                <div className="absolute top-0 right-0 w-96 h-96 bg-tech-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="p-6 md:p-8 flex-1">
                    {view === 'LIST' ? (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            {/* Toolbar */}
                            <div className="flex justify-between items-center pb-6 border-b border-tech-border/50">
                                <span className="text-sm font-medium text-tech-text-secondary">
                                    {reminders.length} Active Protocols
                                </span>
                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setTitle('');
                                        setDateInput(defaultDateStr);
                                        setTimeInput('');
                                        setView('ADD');
                                    }}
                                    className="px-4 py-2 bg-tech-primary text-black font-bold rounded-xl hover:bg-tech-primary/80 transition-all flex items-center gap-2 shadow-lg shadow-tech-primary/20 hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Initialize Alert</span>
                                </button>
                            </div>

                            {/* List */}
                            <div className="space-y-4">
                                {reminders.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-tech-text-secondary opacity-50 space-y-4">
                                        <div className="p-4 bg-tech-bg rounded-full">
                                            <Bell className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm tracking-widest uppercase">No active alerts configured</p>
                                    </div>
                                )}

                                {reminders.sort((a, b) => a.time - b.time).map(reminder => {
                                    const isPast = reminder.time < Date.now();

                                    return (
                                        <div
                                            key={reminder.id}
                                            className={`group relative p-5 rounded-2xl border transition-all ${reminder.isEnabled
                                                    ? 'bg-tech-bg border-tech-border hover:border-tech-primary/30 hover:shadow-xl hover:shadow-tech-primary/5'
                                                    : 'bg-tech-bg/30 border-transparent opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    {/* Toggle Switch Style */}
                                                    <button
                                                        onClick={() => toggleEnable(reminder.id, reminder.isEnabled)}
                                                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 ${reminder.isEnabled
                                                                ? 'bg-tech-primary text-black border-tech-primary shadow-[0_0_15px_rgba(var(--tech-primary-rgb),0.4)] scale-110'
                                                                : 'bg-tech-bg border-tech-border text-transparent hover:border-tech-primary/50'
                                                            }`}
                                                    >
                                                        <CheckSquare className="w-4 h-4" />
                                                    </button>

                                                    <div>
                                                        <h3 className={`font-bold text-lg mb-1 transition-all ${reminder.isEnabled ? 'text-tech-text' : 'text-tech-text-secondary line-through'}`}>
                                                            {reminder.title}
                                                        </h3>

                                                        <div className="flex items-center gap-4 text-xs font-mono text-tech-text-secondary">
                                                            <div className={`flex items-center gap-2 ${isPast ? 'text-red-400' : ''}`}>
                                                                <span className="opacity-70">DATE:</span>
                                                                <span>{new Date(reminder.time).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="w-px h-3 bg-tech-border" />
                                                            <div className="flex items-center gap-2">
                                                                <span className="opacity-70">TIME:</span>
                                                                <span>{new Date(reminder.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={(e) => startEdit(reminder, e)}
                                                        className="p-3 text-tech-text-secondary hover:text-tech-primary hover:bg-tech-primary/10 rounded-xl transition-all"
                                                        title="Edit Alert"
                                                    >
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(reminder.id, e)}
                                                        className="p-3 text-tech-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Delete Alert"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-lg mx-auto py-8 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="mb-8 flex items-center gap-3 text-tech-text-secondary">
                                <div className="h-px bg-tech-border flex-1" />
                                <span className="text-xs uppercase tracking-widest font-bold">
                                    {editingId ? 'Update Configuration' : 'New Configuration'}
                                </span>
                                <div className="h-px bg-tech-border flex-1" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-tech-text-secondary uppercase ml-1">Protocol Name</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g., Server Maintenance"
                                        className="w-full bg-tech-bg border border-tech-border rounded-2xl p-4 text-lg text-tech-text placeholder-tech-text-secondary/30 focus:outline-none focus:border-tech-primary focus:ring-1 focus:ring-tech-primary/50 transition-all font-medium"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <DateInput
                                            label="Target Date"
                                            value={dateInput}
                                            onChange={setDateInput}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <TimeInput
                                            label="Target Time"
                                            value={timeInput}
                                            onChange={setTimeInput}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 py-4 text-sm font-bold text-tech-text-secondary hover:text-tech-text hover:bg-tech-bg border border-transparent hover:border-tech-border rounded-xl transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!title || !dateInput}
                                        className="flex-[2] py-4 text-sm font-bold bg-tech-primary text-black rounded-xl hover:bg-tech-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-tech-primary/20 flex items-center justify-center gap-3 hover:transform hover:translate-y-[-2px]"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {editingId ? 'UPDATE ALERT' : 'INITIALIZE ALERT'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
