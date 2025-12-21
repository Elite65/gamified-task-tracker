import React, { useEffect } from 'react';
import { BellOff, AlertTriangle, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { playAlarmSound, stopAlarmSound } from '../lib/soundUtils';

export const AlarmOverlay: React.FC = () => {
    const { reminders, updateReminder, deleteReminder } = useGame();
    // Local state to track active alarms, ensuring we re-render when time passes
    const [activeAlarms, setActiveAlarms] = React.useState<typeof reminders>([]);

    useEffect(() => {
        const checkAlarms = () => {
            const now = Date.now();
            const triggered = reminders.filter(r => r.isEnabled && r.time <= now);

            // Update state: If we have new triggered alarms OR if the count changed (e.g. dismissed)
            // But we specifically want to latch them. Once triggered, they stay in valid list until disabled.
            // Using JSON stringify for simple deep(ish) comparison of IDs
            const currentIds = activeAlarms.map(a => a.id).sort().join(',');
            const newIds = triggered.map(a => a.id).sort().join(',');

            if (currentIds !== newIds) {
                setActiveAlarms(triggered);
                if (triggered.length > 0) {
                    playAlarmSound();

                    // Trigger Native Notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        triggered.forEach(alarm => {
                            new Notification("🚨 ALARM ACTIVE: " + alarm.title, {
                                body: "Tap to dismiss protocol.",
                                icon: '/icon-192.png',
                                tag: alarm.id // Prevent duplicate notifications for same alarm
                            });
                        });
                    }
                } else {
                    stopAlarmSound();
                }
            }
        };

        // Check immediately
        checkAlarms();

        // Check every 1000ms
        const interval = setInterval(checkAlarms, 1000);

        return () => {
            clearInterval(interval);
            stopAlarmSound();
        };
    }, [reminders]);

    // Request Notification Permission on Mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    if (activeAlarms.length === 0) return null;

    const dismissAll = () => {
        stopAlarmSound();
        activeAlarms.forEach(alarm => {
            deleteReminder(alarm.id);
        });
    };

    const snoozeAll = () => {
        stopAlarmSound();
        const snoozeTime = 5 * 60 * 1000; // 5 minutes
        activeAlarms.forEach(alarm => {
            updateReminder(alarm.id, { time: Date.now() + snoozeTime });
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-red-500/10 backdrop-blur-md flex flex-col items-center justify-center animate-pulse-slow">
            <div className="bg-black border-2 border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.5)] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">

                {/* Background Animation */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)] opacity-50" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mb-6 animate-bounce shadow-2xl shadow-red-500">
                        <AlertTriangle className="w-10 h-10" />
                    </div>

                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter shadow-black drop-shadow-lg">
                        ALERT ACTIVE
                    </h1>

                    <div className="space-y-2 mb-8 w-full">
                        {activeAlarms.map(alarm => (
                            <div key={alarm.id} className="text-xl text-red-100 font-medium bg-red-900/30 py-2 rounded-lg border border-red-500/30">
                                {alarm.title}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={snoozeAll}
                            className="flex-1 py-4 text-sm font-bold bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all border border-gray-600 flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                            <Clock className="w-5 h-5" />
                            Snooze (5m)
                        </button>

                        <button
                            onClick={dismissAll}
                            className="flex-[2] py-4 text-sm font-bold bg-white text-red-600 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-xl uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <BellOff className="w-5 h-5" />
                            DISMISS
                        </button>
                    </div>

                    <p className="mt-4 text-white/50 text-xs font-mono uppercase">
                        Protocol: Immediate Response Required
                    </p>
                </div>
            </div>
        </div>
    );
};
