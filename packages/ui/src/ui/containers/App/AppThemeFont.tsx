import React from 'react';

export interface AppThemeFontProps {
    theme: 'light' | 'dark' | 'system' | 'light-hc' | 'dark-hc';
    fontType?: string;
    children: React.ReactNode;
}

export function AppThemeFont({theme, fontType, children}: AppThemeFontProps) {
    React.useEffect(() => {
        document.body.classList.add(`theme-${theme}`);
        return () => {
            document.body.classList.remove(`theme-${theme}`);
        };
    }, [theme]);

    React.useEffect(() => {
        document.body.classList.add(`app-font-${fontType}`);
        return () => {
            document.body.classList.remove(`app-font-${fontType}`);
        };
    }, [fontType]);

    return children;
}
