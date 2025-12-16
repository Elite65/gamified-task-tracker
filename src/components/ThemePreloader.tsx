import React, { useEffect } from 'react';
import { themes } from '../lib/themes';

export const ThemePreloader: React.FC = () => {
    useEffect(() => {
        // Preload all default banners
        themes.forEach(theme => {
            if (theme.defaultBanner) {
                const img = new Image();
                img.src = theme.defaultBanner;
            }
        });
    }, []);

    return null; // This component doesn't render anything visible
};
