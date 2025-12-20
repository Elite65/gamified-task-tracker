import React from 'react';

interface Elite65IconProps {
    className?: string;
    color?: string;
    secondaryColor?: string;
}

export const Elite65Icon: React.FC<Elite65IconProps> = ({ className, color = "currentColor", secondaryColor }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer Hexagon with Tech Gaps */}
            <path
                d="M50 5 L88.97 27.5 V72.5 L50 95 L11.03 72.5 V27.5 L50 5 Z"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={secondaryColor || "transparent"}
                fillOpacity={0.1}
            />

            {/* Inner "Ascension" Arrow/Path */}
            <path
                d="M50 85 V45 M50 45 L35 60 M50 45 L65 60"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Decorative Tech Nodes */}
            <circle cx="50" cy="5" r="3" fill={color} />
            <circle cx="88.97" cy="27.5" r="3" fill={color} />
            <circle cx="88.97" cy="72.5" r="3" fill={color} />
            <circle cx="50" cy="95" r="3" fill={color} />
            <circle cx="11.03" cy="72.5" r="3" fill={color} />
            <circle cx="11.03" cy="27.5" r="3" fill={color} />
        </svg>
    );
};
