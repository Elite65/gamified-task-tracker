import React, { useState, useEffect, useRef } from 'react';
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
    const [isDragging, setIsDragging] = useState(false);

    // Refs for interaction
    const clockRef = useRef<HTMLDivElement>(null);

    // Derived state for display
    const isPm = hours >= 12;
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

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

    // --- Interaction Logic ---

    const CLOCK_SIZE = 256;
    const CENTER = CLOCK_SIZE / 2;
    const RADIUS = CLOCK_SIZE / 2 - 32;

    const calculateTimeFromEvent = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, isFinal = false) => {
        if (!clockRef.current) return;

        const rect = clockRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY;

        // Handle touch end where touches list is empty
        if (clientX === undefined || clientY === undefined) return;

        const x = clientX - (rect.left + CENTER);
        const y = clientY - (rect.top + CENTER);

        // Angle in radians (usually 0 is at 3 o'clock, so we subtract 90deg to normalize to 12 o'clock)
        // atan2(y, x) -> 0 at 3 o'clock, PI/2 at 6, PI at 9, -PI/2 at 12
        // We want 0 at 12.
        let angleDeg = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angleDeg < 0) angleDeg += 360;

        if (mode === 'HOURS') {
            // Snap to 12 positions (360 / 12 = 30 deg)
            const hour = Math.round(angleDeg / 30);
            let normalizedHour = hour === 0 ? 12 : hour;

            // Handle AM/PM logic preservation
            if (isPm && normalizedHour !== 12) normalizedHour += 12;
            else if (!isPm && normalizedHour === 12) normalizedHour = 0;

            setHours(normalizedHour);
            if (isFinal) {
                setMode('MINUTES');
            }
        } else {
            // Minutes: Snap to 60 positions (360 / 60 = 6 deg)
            let minute = Math.round(angleDeg / 6);
            if (minute === 60) minute = 0;
            setMinutes(minute);
        }
    };

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling on mobile
        setIsDragging(true);
        calculateTimeFromEvent(e);
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (isDragging) {
            e.preventDefault();
            calculateTimeFromEvent(e);
        }
    };

    const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
        if (isDragging) {
            setIsDragging(false);
            calculateTimeFromEvent(e, true);
        }
    };

    // Add/remove global listeners for dragging outside the element
    useEffect(() => {
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (isDragging) {
                e.preventDefault(); // Prevent selection
                // Logic needs to adapt a bit since the event type is slightly different in React types vs DOM types
                // But calculation function handles both if we cast or check properties carefully.
                // Re-using the logic:
                if (!clockRef.current) return;
                const rect = clockRef.current.getBoundingClientRect();
                const clientX = 'touches' in e ? (e as TouchEvent).touches[0]?.clientX : (e as MouseEvent).clientX;
                const clientY = 'touches' in e ? (e as TouchEvent).touches[0]?.clientY : (e as MouseEvent).clientY;

                if (clientX === undefined || clientY === undefined) return;

                const x = clientX - (rect.left + CENTER);
                const y = clientY - (rect.top + CENTER);
                let angleDeg = Math.atan2(y, x) * (180 / Math.PI) + 90;
                if (angleDeg < 0) angleDeg += 360;

                if (mode === 'HOURS') {
                    const hour = Math.round(angleDeg / 30);
                    let normalizedHour = hour === 0 ? 12 : hour;
                    if (isPm && normalizedHour !== 12) normalizedHour += 12;
                    else if (!isPm && normalizedHour === 12) normalizedHour = 0;
                    setHours(normalizedHour);
                } else {
                    let minute = Math.round(angleDeg / 6);
                    if (minute === 60) minute = 0;
                    setMinutes(minute);
                }
            }
        };

        const handleGlobalUp = () => {
            if (isDragging) {
                setIsDragging(false);
                if (mode === 'HOURS') setMode('MINUTES');
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
            window.addEventListener('touchmove', handleGlobalMove, { passive: false });
            window.addEventListener('touchend', handleGlobalUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchmove', handleGlobalMove);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, [isDragging, mode, isPm]);


    // Geometry Helper
    const getPosition = (index: number, total: number) => {
        const angle = (index * (360 / total)) - 90;
        const rad = (angle * Math.PI) / 180;
        return {
            x: CENTER + RADIUS * Math.cos(rad),
            y: CENTER + RADIUS * Math.sin(rad)
        };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-tech-surface border border-tech-border rounded-xl overflow-hidden shadow-2xl w-full max-w-[320px] animate-in zoom-in-95 duration-200 select-none">

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
                        ref={clockRef}
                        className="relative rounded-full bg-white/5 border border-white/10 cursor-pointer touch-none"
                        style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
                        onMouseDown={handlePointerDown}
                        onTouchStart={handlePointerDown}
                    // We use global listeners for move/up to handle dragging outside
                    >
                        {/* Center Dot */}
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-tech-primary rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

                        {/* Hand */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 h-0.5 bg-tech-primary origin-left z-0 pointer-events-none"
                            animate={{
                                rotate: (mode === 'HOURS' ? (displayHours % 12) * 30 : minutes * 6) - 90
                            }}
                            transition={{
                                type: "spring",
                                stiffness: isDragging ? 500 : 300,
                                damping: 30
                            }}
                            style={{ width: RADIUS }}
                        >
                            <div className="absolute right-0 top-1/2 w-8 h-8 bg-tech-primary rounded-full -translate-y-1/2 translate-x-1/2 shadow-[0_0_15px_rgba(var(--tech-primary),0.5)] flex items-center justify-center">
                                {/* Small dot in center of handle */}
                                <div className="w-2 h-2 bg-black rounded-full" />
                            </div>
                        </motion.div>

                        {/* Numbers */}
                        <AnimatePresence mode='wait'>
                            {mode === 'HOURS' ? (
                                <motion.div
                                    key="hours"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 pointer-events-none"
                                >
                                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
                                        const pos = getPosition(h === 12 ? 0 : h, 12);
                                        const isSelected = displayHours === h;
                                        return (
                                            <div
                                                key={h}
                                                className={clsx(
                                                    "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10",
                                                    isSelected ? "text-black scale-110" : "text-gray-400"
                                                )}
                                                style={{ left: pos.x, top: pos.y }}
                                            >
                                                {h}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="minutes"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 pointer-events-none"
                                >
                                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                                        const pos = getPosition(m / 5, 12);
                                        const isSelected = minutes === m;
                                        // Also highlight if minute is within range? No, just specific number.
                                        // If minute is not a multiple of 5, the hand will just be in between.
                                        return (
                                            <div
                                                key={m}
                                                className={clsx(
                                                    "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10",
                                                    isSelected ? "text-black scale-110" : "text-gray-400"
                                                )}
                                                style={{ left: pos.x, top: pos.y }}
                                            >
                                                {String(m).padStart(2, '0')}
                                            </div>
                                        );
                                    })}
                                    {/* Optional: Add tick marks for individual minutes? Might be too busy. The hand is enough. */}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Helper Text */}

                </div>
                <div className="bg-[#1a1a1a] pb-2 text-center text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                    {isDragging ? 'Release to set' : 'Drag to adjust'}
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
