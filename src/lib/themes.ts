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
        defaultBanner: '/banners/soft-autumn.png',
        colors: {
            // Dynamic Background: Botanical Leaf Sketches (Large 500px Tile - Low Repetition)
            background: "url(\"data:image/svg+xml;utf8,<svg width='500' height='500' viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'><g fill='none' stroke='%235D4037' stroke-width='1.2' opacity='0.3'><!-- Center-ish Oak --><path d='M50,150 Q50,110 50,50 M50,130 Q30,120 35,100 T30,70 T40,50 Q45,40 50,30 Q55,40 60,50 Q70,60 65,70 T70,100 Q75,120 50,130' transform='translate(200, 220) rotate(15 50 90) scale(1.4)' stroke-linecap='round' stroke-linejoin='round'/><!-- Top Left Maple --><path d='M100,130 C100,130 100,80 100,40 M100,100 C80,90 60,80 40,90 C50,70 45,50 60,40 C70,45 80,50 90,40 C95,30 98,20 100,10 C102,20 105,30 110,40 C120,50 130,45 140,40 C155,50 150,70 160,90 C140,80 120,90 100,100' transform='translate(-30, 20) rotate(-25 100 80) scale(1.1)' stroke-linecap='round' stroke-linejoin='round'/><!-- Top Right Birch/Ash --><path d='M170,170 L170,50 M170,80 L140,70 M170,110 L140,100 M170,140 L140,130 M170,70 L200,60 M170,100 L200,90 M170,130 L200,120 M170,50 Q170,30 170,20' transform='translate(280, 20) rotate(45 170 110) scale(0.9)' stroke-linecap='round'/><!-- Bottom Left Oak --><path d='M50,150 Q50,110 50,50 M50,130 Q30,120 35,100 T30,70 T40,50 Q45,40 50,30 Q55,40 60,50 Q70,60 65,70 T70,100 Q75,120 50,130' transform='translate(10, 350) rotate(-40 50 90) scale(1.2)' stroke-linecap='round' stroke-linejoin='round'/><!-- Bottom Right Maple --><path d='M100,130 C100,130 100,80 100,40 M100,100 C80,90 60,80 40,90 C50,70 45,50 60,40 C70,45 80,50 90,40 C95,30 98,20 100,10 C102,20 105,30 110,40 C120,50 130,45 140,40 C155,50 150,70 160,90 C140,80 120,90 100,100' transform='translate(350, 300) rotate(10 100 80) scale(1.3)' stroke-linecap='round' stroke-linejoin='round'/><!-- Small Filler 1 --><path d='M100,100 C90,100 85,90 85,80 C85,70 90,60 100,60 C110,60 115,70 115,80 C115,90 110,100 100,100 M100,80 L100,120' transform='translate(150, 100) rotate(90 100 90) scale(0.6)'/><!-- Small Filler 2 --><path d='M100,100 C90,100 85,90 85,80 C85,70 90,60 100,60 C110,60 115,70 115,80 C115,90 110,100 100,100 M100,80 L100,120' transform='translate(400, 150) rotate(-20 100 90) scale(0.7)'/><!-- Small Filler 3 --><path d='M100,100 C90,100 85,90 85,80 C85,70 90,60 100,60 C110,60 115,70 115,80 C115,90 110,100 100,100 M100,80 L100,120' transform='translate(180, 420) rotate(180 100 90) scale(0.6)'/></g></svg>\") repeat, linear-gradient(180deg, #EAE1D5 0%, #E6D2B5 100%)",
            surface: '#EBDFD0',    // Soft Sand
            border: '#D4C5B0',     // Muted Tan
            primary: '#C5A588',    // Warm Terracotta/Tan
            secondary: '#E6D2B5',  //  Light Maize
            text: '#5D4037',       //  Deep Warm Brown
            textSecondary: '#8D6E63', // Muted Brown
        },
    },
    {
        id: 'spring-shower',
        name: 'Spring Shower',
        defaultBanner: '/banners/spring-shower.png',
        colors: {
            // Dynamic Background: Premium Washi Paper (URL Encoded UTF-8) + Morning Dawn Gradient
            background: "url(\"data:image/svg+xml;utf8,<svg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><defs><filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.2 0'/></filter></defs><rect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.4'/><path d='M20,50 Q60,40 100,60 T180,50' stroke='%2378716C' stroke-width='0.5' fill='none' opacity='0.2'/></svg>\") repeat, linear-gradient(180deg, #FFF5F5 0%, #FFE4E6 100%)",
            surface: '#D1DCD6',    // Light Blue/Grey (Existing)
            border: '#BABE8B',     // Green (Existing)
            calendarBorder: '#BABE8B',
            primary: '#F59EA8',    // Pink (Existing)
            secondary: '#E2B476',  // Mustard (Existing)
            text: '#2D3748',       // Dark Grey
            textSecondary: '#718096'
        }
    },
    {
        id: 'frigid-winter',
        name: 'Frigid Winter',
        defaultBanner: '/banners/frigid-winter.png',
        colors: {
            // Dynamic Background: File-based Snowflake Pattern (v2 Intricate) + Dark Winter Night Gradient
            background: "url('/bg-snowflakes-v2.svg') repeat, linear-gradient(180deg, #1e293b 0%, #334155 100%)",
            surface: '#B9D8E1',    // GLACIER (Solid - Clean)
            border: '#629BB5',     // SLATE BLUE
            calendarBorder: '#629BB540',
            primary: '#447F98',    // TURQUOISE
            secondary: '#DADEE1',  // PLATINUM
            text: '#1e293b',
            textSecondary: '#447F98'
        }
    },
    {
        id: 'forest-flow',
        name: 'Forest Flow',
        defaultBanner: '/banners/forest-flow.png',
        colors: {
            background: '#001400', // Original Dark Green (No Effects)
            surface: '#374430',    // Original Surface
            border: '#006400',     // Original Border
            calendarBorder: '#374430', // Original Calendar Border
            primary: '#6ee7b7',    // Original Mint Green
            secondary: '#005000',  // Original Secondary
            text: '#e2e8f0',       // Original Text
            textSecondary: '#6ab06a' // Original Text Secondary
        }
    },
    {
        id: 'eclipse-skies',
        name: 'Eclipse Skies',
        defaultBanner: '/banners/eclipse-skies.png',
        colors: {
            background: `
                radial-gradient(circle at 50% 0%, #4c1d95 0%, transparent 60%),
                radial-gradient(circle at 50% 100%, #3b0764 0%, transparent 50%),
                #11001C
            `, // Eclipse Glow (Top & Bottom)
            surface: '#1A0129',    // Dark Purple (surface)
            border: '#3A025B',     // Russian Violet (border)
            calendarBorder: '#3A025B40', // Softer Border (25% Opacity)
            primary: '#520380',    // Indigo (Accent)
            secondary: '#220135',  // Russian Violet (Secondary)
            text: '#f3e8ff',       // Restore Original Pale Lavender
            textSecondary: '#d8b4fe' // Restore Original Soft Lavender
        }
    },
    {
        id: 'cold-nights',
        name: 'Cold Nights',
        defaultBanner: '/banners/cold-nights.png',
        colors: {
            background: "url('/bg-stars.svg') repeat, #05091e", // Royal Dark Blue Base + Stars
            surface: '#0b1129',    // Deep Royal Surface
            border: '#3b82f6',     // Royal Blue Border
            calendarBorder: '#3b82f640', // Royal Blue (Soft)
            primary: '#22d3ee',    // Neon Cyan (High Contrast Accent)
            secondary: '#4f46e5',  // Indigo (Secondary)
            text: '#f8fafc',       // Ice White
            textSecondary: '#7dd3fc' // Sky Blue Text
        }
    }
];
