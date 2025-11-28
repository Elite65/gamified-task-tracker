import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface ClockTimePickerProps {
    initialValue: string; // "HH:MM"
    onChange: (value: string) => void;
    onClose: () => void;
}

export const ClockTimePicker: React.FC<ClockTimePickerProps> = ({ initialValue, onChange, onClose }) => {
    // Parse initial value
    const parseTime = (val: string) => {
        if (!val || val.length !== 5) return { h: 12, m: 0 };
        const [h, m] = val.split(':').map(Number);
        return { h, m };
    };

    const initial = parseTime(initialValue);
    const [hours, setHours] = useState(initial.h);
    const [minutes, setMinutes] = useState(initial.m);
    const [mode, setMode] = useState<'HOURS' | 'MINUTES'>('HOURS');

    // Derived state for display
    const isPm = hours >= 12;
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    const handleHourSelect = (h: number) => {
        let newHours = h;
        if (isPm && h !== 12) newHours += 12;
        if (!isPm && h === 12) newHours = 0;
        setHours(newHours);
        setMode('MINUTES');
    };

    const handleMinuteSelect = (m: number) => {
        setMinutes(m);
    };

    const toggleMeridiem = (newMeridiem: 'AM' | 'PM') => {
        if (newMeridiem === 'AM' && isPm) setHours(hours - 12);
        if (newMeridiem === 'PM' && !isPm) setHours(hours + 12);
    };

    const handleSave = () => {
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        onChange(`${hStr}:${mStr}`);
        onClose();
    };

    // Clock Face Geometry
    const CLOCK_SIZE = 256;
    const RADIUS = CLOCK_SIZE / 2 - 32; // Padding
    const CENTER = CLOCK_SIZE / 2;

    const getPosition = (index: number, total: number) => {
        const angle = (index * (360 / total)) - 90; // -90 to start at 12 o'clock
        const rad = (angle * Math.PI) / 180;
        return {
            x: CENTER + RADIUS * Math.cos(rad),
            y: CENTER + RADIUS * Math.sin(rad)
        };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-tech-surface border border-tech-border rounded-xl overflow-hidden shadow-2xl w-full max-w-[320px] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-tech-primary/10 p-6 flex items-end justify-between border-b border-tech-border/50">
                    <div className="flex items-end gap-1">
                        <button
                            type="button"
                            onClick={() => setMode('HOURS')}
                            className={clsx(
                                "text-4xl font-bold transition-colors",
                                mode === 'HOURS' ? "text-tech-primary" : "text-gray-500 hover:text-white"
                            )}
                        >
                            {String(displayHours).padStart(2, '0')}
                        </button>
                        <span className="text-4xl font-bold text-gray-500 mb-1">:</span>
                        <button
                            type="button"
                            onClick={() => setMode('MINUTES')}
                            className={clsx(
                                "text-4xl font-bold transition-colors",
                                mode === 'MINUTES' ? "text-tech-primary" : "text-gray-500 hover:text-white"
                            )}
                        >
                            {String(minutes).padStart(2, '0')}
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 border border-tech-border rounded overflow-hidden">
                        <button
                            type="button"
                            onClick={() => toggleMeridiem('AM')}
                            className={clsx(
                                "px-2 py-1 text-xs font-bold transition-colors",
                                !isPm ? "bg-tech-primary text-black" : "bg-black/30 text-gray-400 hover:text-white"
                            )}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleMeridiem('PM')}
                            className={clsx(
                                "px-2 py-1 text-xs font-bold transition-colors",
                                isPm ? "bg-tech-primary text-black" : "bg-black/30 text-gray-400 hover:text-white"
                            )}
                        >
                            PM
                        </button>
                    </div>
                </div>

                {/* Clock Face */}
                <div className="p-6 flex justify-center bg-[#1a1a1a]">
                    <div
                        className="relative rounded-full bg-white/5 border border-white/10"
                        style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
                    >
                        {/* Center Dot */}
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-tech-primary rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

                        {/* Hand */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 h-0.5 bg-tech-primary origin-left z-0"
                            style={{
                                width: RADIUS,
                                rotate: (mode === 'HOURS' ? (displayHours % 12) * 30 : minutes * 6) - 90
                            }}
                        >
                            <div className="absolute right-0 top-1/2 w-8 h-8 bg-tech-primary rounded-full -translate-y-1/2 translate-x-1/2 shadow-[0_0_15px_rgba(var(--tech-primary),0.5)]" />
                        </motion.div>

                        {/* Numbers */}
                        <AnimatePresence mode='wait'>
                            {mode === 'HOURS' ? (
                                <motion.div
                                    key="hours"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0"
                                >
                                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, i) => {
                                        const pos = getPosition(h === 12 ? 0 : h, 12);
                                        const isSelected = displayHours === h;
                                        return (
                                            <button
                                                type="button"
                                                key={h}
                                                onClick={() => handleHourSelect(h)}
                                                className={clsx(
                                                    "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10",
                                                    isSelected ? "text-black" : "text-gray-300 hover:text-white"
                                                )}
                                                style={{ left: pos.x, top: pos.y }}
                                            >
                                                {h}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="minutes"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0"
                                >
                                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m, i) => {
                                        const pos = getPosition(i, 12); // 12 positions for 5-min intervals
                                        const isSelected = minutes === m;
                                        return (
                                            <button
                                                type="button"
                                                key={m}
                                                onClick={() => handleMinuteSelect(m)}
                                                className={clsx(
                                                    "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10",
                                                    isSelected ? "text-black" : "text-gray-300 hover:text-white"
                                                )}
                                                style={{ left: pos.x, top: pos.y }}
                                            >
                                                {String(m).padStart(2, '0')}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 flex justify-end gap-4 border-t border-tech-border/50 bg-black/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        CANCEL
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-6 py-2 bg-tech-primary text-black text-sm font-bold rounded hover:bg-tech-primary/80 transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
