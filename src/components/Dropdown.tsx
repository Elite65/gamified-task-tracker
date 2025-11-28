import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Option {
    label: string;
    value: string;
    color?: string; // Optional color for badges/indicators
}

interface DropdownProps {
    label?: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

export function Dropdown({ label, value, options, onChange, className, placeholder = 'Select...' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={clsx("relative", className)} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-medium text-tech-secondary mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={twMerge(
                    "w-full flex items-center justify-between px-3 py-2.5 bg-tech-surface border border-tech-border rounded-lg text-sm text-white transition-colors hover:border-tech-border-active focus:outline-none focus:ring-1 focus:ring-tech-accent",
                    isOpen && "border-tech-accent ring-1 ring-tech-accent"
                )}
            >
                <span className={clsx(!selectedOption && "text-tech-secondary")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={clsx("w-4 h-4 text-tech-secondary transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-tech-surface border border-tech-border rounded-lg shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                                    option.value === value
                                        ? "bg-tech-surface-hover text-white"
                                        : "text-tech-secondary hover:bg-tech-surface-hover hover:text-white"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {option.color && (
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />
                                    )}
                                    {option.label}
                                </span>
                                {option.value === value && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
