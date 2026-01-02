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
  background: '#0F172A',
  surface: '#111827',
  text: '#F9FAFB',
  muted: '#9CA3AF',
  primary: '#3B82F6',
  border: '#1F2937',
  card: '#111827',
  tabInactive: '#9CA3AF',
  tabActive: '#3B82F6',
  badge: '#F97316',
};
