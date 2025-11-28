import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Clock } from 'lucide-react';
import { ClockTimePicker } from './ClockTimePicker';

interface TimeInputProps {
    label?: string;
    value: string; // Expected format: HH:MM or empty
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    error?: string;
}

export function TimeInput({ label, value, onChange, className, placeholder = 'HH:MM', error }: TimeInputProps) {
    const [showPicker, setShowPicker] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Remove non-digit characters
        const digits = inputValue.replace(/\D/g, '');

        // Limit to 4 digits (HHMM)
        const truncated = digits.slice(0, 4);

        let formatted = '';
        if (truncated.length > 0) {
            formatted += truncated.slice(0, 2);
            if (truncated.length >= 3) {
                formatted += ':' + truncated.slice(2, 4);
            }
        }

        // Basic validation for typing (optional, but good for UX)
        // We won't strictly block invalid times while typing to avoid frustration,
        // but we could clamp values if needed. For now, just formatting.

        onChange(formatted);
    };

    return (
        <div className={clsx("relative", className)}>
            {label && (
                <label className="block text-xs font-medium text-tech-secondary mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    maxLength={5}
                    className={twMerge(
                        "w-full pl-3 pr-10 py-2.5 bg-tech-surface border border-tech-border rounded-lg text-sm text-white placeholder-tech-secondary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-tech-accent focus:border-tech-accent",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                />
                <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tech-primary transition-colors"
                >
                    <Clock className="w-4 h-4" />
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {showPicker && (
                <ClockTimePicker
                    initialValue={value}
                    onChange={onChange}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </div>
    );
}
