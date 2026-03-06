import React, { createContext, useContext } from 'react';

export interface SettingsContextValue {
    isPushEnabled: boolean;
    setIsPushEnabled: (enabled: boolean) => void;
    isBiometricEnabled: boolean;
    setIsBiometricEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = SettingsContext.Provider;

export function useSettingsOptional(): SettingsContextValue | null {
    return useContext(SettingsContext);
}
