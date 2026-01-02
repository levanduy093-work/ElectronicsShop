export type Theme = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  border: string;
  card: string;
  tabInactive: string;
  tabActive: string;
  badge: string;
};

export const lightTheme: Theme = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  primary: '#2563EB',
  border: '#E5E7EB',
  card: '#FFFFFF',
  tabInactive: '#9CA3AF',
  tabActive: '#2563EB',
  badge: '#EF4444',
};

export const darkTheme: Theme = {
  background: '#121212',
  surface: '#18181B',
  text: '#F5F5F5',
  muted: '#A1A1AA',
  primary: '#3B82F6',
  border: '#262626',
  card: '#18181B',
  tabInactive: '#9CA3AF',
  tabActive: '#3B82F6',
  badge: '#F97316',
};
