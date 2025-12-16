import React, { useState, useEffect } from 'react';

interface DateInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export const DateInput: React.FC<DateInputProps & { label?: string }> = ({
    value,
    onChange,
    placeholder = "DD/MM/YYYY",
    className = "",
    required = false,
    label
}) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;

        // Remove non-digit characters
        const digits = input.replace(/\D/g, '');

        // Format as DD/MM/YYYY
        let formatted = '';
        if (digits.length > 0) {
            formatted += digits.substring(0, 2);
            if (digits.length > 2) {
                formatted += '/' + digits.substring(2, 4);
                if (digits.length > 4) {
                    formatted += '/' + digits.substring(4, 8);
                }
            }
        }

        setDisplayValue(formatted);
        onChange(formatted);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">
                    {label}
                </label>
            )}
            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full bg-black/30 border border-tech-border rounded-lg p-3 focus:border-tech-primary outline-none transition-colors text-white"
                maxLength={10}
                required={required}
            />
        </div>
    );
};
