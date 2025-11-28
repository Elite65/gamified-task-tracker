import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DateInputProps {
    label?: string;
    value: string; // Expected format: DD/MM/YYYY or empty
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    error?: string;
}

export function DateInput({ label, value, onChange, className, placeholder = 'DD/MM/YYYY', error }: DateInputProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Remove non-digit characters
        const digits = inputValue.replace(/\D/g, '');

        // Limit to 8 digits (DDMMYYYY)
        const truncated = digits.slice(0, 8);

        let formatted = '';
        if (truncated.length > 0) {
            formatted += truncated.slice(0, 2);
            if (truncated.length >= 3) {
                formatted += '/' + truncated.slice(2, 4);
            }
            if (truncated.length >= 5) {
                formatted += '/' + truncated.slice(4, 8);
            }
        }

        // Allow deleting back to empty
        if (inputValue.length < value.length) {
            // If user is deleting, we might need to handle the slash removal carefully
            // But simple re-formatting usually works fine unless they delete the slash itself
            // Let's stick to the simple logic: take digits, re-format.
            // If they delete a slash, the digits remain, and it re-adds the slash.
            // To allow deleting a slash, we check if the last char was a slash and they deleted it.
            // Actually, standard masking behavior:
            onChange(formatted);
            return;
        }

        onChange(formatted);
    };

    return (
        <div className={clsx("relative", className)}>
            {label && (
                <label className="block text-xs font-medium text-tech-secondary mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                maxLength={10}
                className={twMerge(
                    "w-full px-3 py-2.5 bg-tech-surface border border-tech-border rounded-lg text-sm text-white placeholder-tech-secondary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-tech-accent focus:border-tech-accent",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500"
                )}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
