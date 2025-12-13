import React, { useState, useEffect } from 'react';

interface DateInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
    value,
    onChange,
    placeholder = "DD/MM/YYYY",
    className = "",
    required = false
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
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            maxLength={10}
            required={required}
        />
    );
};
