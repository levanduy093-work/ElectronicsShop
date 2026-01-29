import { createContext, useContext } from 'react';

export type Theme = {
  isDark: boolean;
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  border: string;
  card: string;
  error: string;
  tabInactive: string;
  tabActive: string;
  badge: string;
};

export const lightTheme: Theme = {
  isDark: false,
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  primary: '#2563EB',
  border: '#E5E7EB',
  card: '#FFFFFF',
  error: '#EF4444',
  tabInactive: '#9CA3AF',
  tabActive: '#2563EB',
  badge: '#EF4444',
};

export const darkTheme: Theme = {
  isDark: true,
  background: '#121212',
  surface: '#18181B',
  text: '#F5F5F5',
  muted: '#A1A1AA',
  primary: '#3B82F6',
  border: '#262626',
  card: '#18181B',
  error: '#F87171',
  tabInactive: '#9CA3AF',
  tabActive: '#3B82F6',
  badge: '#F97316',
};

type ThemeContextValue = {
  theme: Theme;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDarkMode: false,
});

export const ThemeProvider = ThemeContext.Provider;

export function useTheme() {
  return useContext(ThemeContext);
}
