export interface Theme {
    id: string;
    name: string;
    defaultBanner?: string; // Optional path to default banner image
    colors: {
        background: string;
        surface: string;
        border: string;
        calendarBorder?: string; // Optional override for calendar border
        primary: string;
        secondary: string;
        text: string;
        textSecondary: string;
    };
}

export const themes: Theme[] = [
    {
        id: 'default',
        name: 'Default (Dark)',
        defaultBanner: '/banners/default-banner.png',
        colors: {
            background: '#09090b', // zinc-950
            surface: '#18181b',    // zinc-900
            border: '#27272a',     // zinc-800
            calendarBorder: '#27272a', // Match border
            primary: '#ffffff',    // White
            secondary: '#71717a',  // Zinc-500 (Grey)
            text: '#ffffff',
            textSecondary: '#a1a1aa' // zinc-400
        }
    },
    {
        id: 'soft-autumn',
        name: 'Soft Autumn',
        defaultBanner: '/banners/soft-autumn.jpg',
        colors: {
            background: '#EAE1D5', // Warm Beige
            surface: '#EBDFD0',    // Soft Sand
            border: '#D4C5B0',     // Muted Tan
            primary: '#C5A588',    // Warm Terracotta/Tan
            secondary: '#E6D2B5',  //  Light Maize
            text: '#5D4037',       //  Deep Warm Brown
            textSecondary: '#8D6E63', // Muted Brown
        },
        defaultBanner: '/banners/soft-autumn.png',
    },
    {
        id: 'spring-shower',
        name: 'Spring Shower',
        defaultBanner: '/banners/spring-shower.png',
        colors: {
            background: '#F9F9F9', // Off-white
            surface: '#D1DCD6',    // Light Blue/Grey
            border: '#BABE8B',     // Green
            calendarBorder: '#BABE8B', // Match border
            primary: '#F59EA8',    // Pink
            secondary: '#E2B476',  // Mustard
            text: '#2D3748',       // Dark Grey
            textSecondary: '#718096' // Medium Grey
        }
    },
    {
        id: 'frigid-winter',
        name: 'Frigid Winter',
        defaultBanner: '/banners/frigid-winter.png',
        colors: {
            background: '#F3F5F8', // Lightest Blue
            surface: '#E9EDF1',    // Light Blue Grey
            border: '#CAD5DF',     // Mid Blue Grey
            calendarBorder: '#CAD5DF', // Match border
            primary: '#7D9AB3',    // Dark Blue
            secondary: '#9AAFC2',  // Mid Blue
            text: '#1e293b',       // Slate 800 (Dark Blue Grey for contrast)
            textSecondary: '#64748b' // Slate 500
        }
    },
    {
        id: 'forest-flow',
        name: 'Forest Flow',
        defaultBanner: '/banners/forest-flow.png',
        colors: {
            background: '#001400', // User specified
            surface: '#374430',    // User specified
            border: '#006400',     // User specified
            calendarBorder: '#374430', // Use Surface Color (User Request)
            primary: '#6ee7b7',    // Keeping Mint Green
            secondary: '#005000',  // User specified
            text: '#e2e8f0',       // Keeping light text
            textSecondary: '#6ab06a' // User specified (Soft Green)
        }
    },
    {
        id: 'eclipse-skies',
        name: 'Eclipse Skies',
        defaultBanner: '/banners/eclipse-skies.png',
        colors: {
            background: '#140a13', // Base (Deepest Purple/Black)
            surface: '#2a1629',    // Deep Plum (Distinct from grey)
            border: '#c084fc',     // Glowing Orchid (The "Eclipse" ring)
            calendarBorder: '#2a1629', // Match Surface
            primary: '#e879f9',    // Bright Magenta (Twilight glow)
            secondary: '#701a75',  // Deep Magenta
            text: '#f3e8ff',       // Pale Lavender White
            textSecondary: '#d8b4fe' // Soft Lavender
        }
    },
    {
        id: 'cold-nights',
        name: 'Cold Nights',
        defaultBanner: '/banners/cold-nights.png',
        colors: {
            background: '#00001c', // User specified (Very Dark Blue)
            surface: '#0f1035',    // Deep Midnight Blue (Darker for Night feel)
            border: '#5a75e2',     // User's Blue as Border/Glow
            calendarBorder: '#5a75e2', // Match Border
            primary: '#5a75e2',    // User's Blue as Primary Accent
            secondary: '#1e1b4b',  // Midnight Blue
            text: '#e2e8f0',       // Starlight Silver
            textSecondary: '#94a3b8' // Muted Slate
        }
    }
];
