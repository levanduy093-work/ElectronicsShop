import { createContext, useContext } from 'react';

export interface NotificationsContextValue {
    notifications: any[];
    isRefreshingNotifications: boolean;
    refreshNotifications: () => Promise<void>;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    setNotificationsActive: (active: boolean) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const NotificationsProvider = NotificationsContext.Provider;

export function useNotificationsOptional(): NotificationsContextValue | null {
    return useContext(NotificationsContext);
}
