import React, { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeModeContextValue {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export const ThemeModeProvider = ThemeModeContext.Provider;

export function useThemeModeOptional(): ThemeModeContextValue | null {
    return useContext(ThemeModeContext);
}
