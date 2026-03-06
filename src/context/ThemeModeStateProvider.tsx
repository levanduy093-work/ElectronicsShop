import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeModeProvider, type ThemeMode, type ThemeModeContextValue } from './ThemeModeContext';

const THEME_MODE_STORAGE_KEY = 'electronicsshop/theme_mode';

async function persistThemeMode(mode: ThemeMode) {
    try {
        await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
        console.warn('ThemeModeStateProvider - Failed to persist theme mode', error);
    }
}

async function loadPersistedThemeMode(): Promise<ThemeMode | null> {
    try {
        const stored = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (!stored) return null;
        return stored as ThemeMode;
    } catch (error) {
        console.warn('ThemeModeStateProvider - Failed to load theme mode', error);
        return null;
    }
}

interface ThemeModeStateProviderProps {
    children: React.ReactNode;
}

export function ThemeModeStateProvider({ children }: ThemeModeStateProviderProps) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        persistThemeMode(mode).catch(() => { });
    }, []);

    useEffect(() => {
        const init = async () => {
            const savedTheme = await loadPersistedThemeMode();
            if (savedTheme) setThemeModeState(savedTheme);
        };
        init();
    }, []);

    const contextValue: ThemeModeContextValue = useMemo(() => ({
        themeMode,
        setThemeMode,
    }), [themeMode, setThemeMode]);

    return (
        <ThemeModeProvider value={contextValue}>
            {children}
        </ThemeModeProvider>
    );
}
