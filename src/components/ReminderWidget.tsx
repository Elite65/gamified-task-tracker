import React from 'react';
import { Bell, Clock, Plus, ChevronRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

export const ReminderWidget: React.FC = () => {
    const { reminders } = useGame();
    const navigate = useNavigate();

    // Find next upcoming reminders
    const upcomingReminders = reminders
        .filter(r => r.isEnabled && r.time > Date.now())
        .sort((a, b) => a.time - b.time);

    return (
        <div
            onClick={() => navigate('/reminders')}
            className="bg-tech-surface border border-tech-border rounded-3xl p-6 flex flex-col justify-between hover:border-tech-primary/50 transition-all cursor-pointer group h-full relative overflow-hidden"
            style={{ minHeight: '192px', maxHeight: '300px' }}
        >
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-tech-primary/5 rounded-full blur-2xl group-hover:bg-tech-primary/10 transition-colors pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10 shrink-0">
                <h3 className="font-bold text-lg text-tech-text">Tactical Alerts</h3>
                <div className="p-2 rounded-lg bg-tech-bg border border-tech-border group-hover:border-tech-primary/50 transition-colors">
                    <Bell className="w-5 h-5 text-tech-primary" />
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 flex flex-col gap-3 relative z-10 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {upcomingReminders.length > 0 ? (
                    upcomingReminders.map((reminder) => (
                        <div
                            key={reminder.id}
                            className="bg-tech-bg/50 border border-tech-border/50 rounded-xl p-3 flex items-center justify-between group-hover:border-tech-primary/30 transition-all shrink-0"
                        >
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs text-tech-text-secondary font-mono leading-none mb-1">
                                    {new Date(reminder.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="font-bold text-tech-text truncate text-sm">
                                    {reminder.title}
                                </span>
                            </div>
                            <div className="text-tech-primary/50">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-tech-text-secondary/50 gap-2">
                        <Clock className="w-8 h-8 opacity-50" />
                        <span className="text-xs uppercase font-bold tracking-widest">No Active Alerts</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-2 border-t border-tech-border/50 flex justify-center relative z-10">
                <button className="text-xs text-tech-text-secondary group-hover:text-tech-primary transition-colors flex items-center gap-2 uppercase font-bold tracking-wider">
                    <Plus className="w-3 h-3" /> Initialize Alert
                </button>
            </div>
        </div>
    );
};
