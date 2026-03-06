import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, InteractionManager } from 'react-native';
import { useTranslation } from 'react-i18next';

import { NotificationsProvider, type NotificationsContextValue } from './NotificationsContext';
import { useAppOptional } from './AppContext';
import { mapApiNotificationToUi, type UiNotification } from '../utils/orderNotificationMappers';
import {
    getNotifications as apiGetNotifications,
    markAllNotificationsRead as apiMarkAllNotificationsRead,
    markNotificationRead as apiMarkNotificationRead,
} from '../services/api';
import { socketService } from '../services/socket';

interface NotificationsStateProviderProps {
    children: React.ReactNode;
}

export function NotificationsStateProvider({ children }: NotificationsStateProviderProps) {
    const app = useAppOptional();
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState<UiNotification[]>([]);
    const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);
    const [isNotificationsActive, setIsNotificationsActive] = useState(false);

    const accessToken = app?.authTokens?.accessToken || null;
    const isAuthed = Boolean(app?.isLoggedIn && accessToken);
    const isOffline = app?.networkStatus?.isConnected === false;

    const syncNotificationsFromApi = useCallback((items: any[]) => {
        const translate = typeof t === 'function' ? t : undefined;
        const list = Array.isArray(items) ? items : [];
        const mapped = list
            .map(item => mapApiNotificationToUi(item, translate))
            .filter(item => item.id)
            .sort((a, b) => {
                const timeA = a.sendAt ? new Date(a.sendAt).getTime() : 0;
                const timeB = b.sendAt ? new Date(b.sendAt).getTime() : 0;
                return timeB - timeA;
            });
        setNotifications(mapped);
    }, [t]);

    const loadNotifications = useCallback(async (_options?: { silent?: boolean }) => {
        if (!accessToken) return;
        const showSpinner = !_options?.silent;
        if (showSpinner) setIsRefreshingNotifications(true);
        try {
            const result = await apiGetNotifications(accessToken);
            syncNotificationsFromApi(result);
        } catch (error: any) {
            console.warn('NotificationsStateProvider - Failed to load notifications', error?.message || error);
        } finally {
            if (showSpinner) setIsRefreshingNotifications(false);
        }
    }, [accessToken, syncNotificationsFromApi]);

    const refreshNotifications = useCallback(async () => {
        await loadNotifications({ silent: false });
    }, [loadNotifications]);

    const markNotificationRead = useCallback(async (id: string) => {
        if (!accessToken) return;
        const previous = notifications;
        setNotifications(prev => prev.map(item => (item.id === id ? { ...item, read: true } : item)));
        try {
            const result = await apiMarkNotificationRead(id, accessToken);
            syncNotificationsFromApi(result);
        } catch (error: any) {
            setNotifications(previous);
            console.warn('NotificationsStateProvider - Failed to mark notification read', error?.message || error);
        }
    }, [accessToken, notifications, syncNotificationsFromApi]);

    const markAllNotificationsRead = useCallback(async () => {
        if (!accessToken) return;
        const previous = notifications;
        setNotifications(prev => prev.map(item => ({ ...item, read: true })));
        try {
            const result = await apiMarkAllNotificationsRead(accessToken);
            syncNotificationsFromApi(result);
        } catch (error: any) {
            setNotifications(previous);
            console.warn('NotificationsStateProvider - Failed to mark all notifications read', error?.message || error);
        }
    }, [accessToken, notifications, syncNotificationsFromApi]);

    useEffect(() => {
        if (!isAuthed) {
            setNotifications([]);
            setIsRefreshingNotifications(false);
            return;
        }
        loadNotifications({ silent: true });
    }, [isAuthed, loadNotifications]);

    useEffect(() => {
        if (!isAuthed || isOffline) return;
        const notificationInterval = setInterval(() => {
            if (AppState.currentState !== 'active') return;
            if (!isNotificationsActive) return;
            loadNotifications({ silent: true });
        }, 60000);

        return () => {
            clearInterval(notificationInterval);
        };
    }, [isAuthed, isOffline, isNotificationsActive, loadNotifications]);

    useEffect(() => {
        if (!isAuthed) return;
        let isMounted = true;
        const handler = (payload: any) => {
            if (payload?.collection !== 'notifications') return;
            loadNotifications({ silent: true });
        };

        const task = InteractionManager.runAfterInteractions(() => {
            if (!isMounted) return;
            socketService.on('db_change', handler);
        });

        return () => {
            isMounted = false;
            task.cancel?.();
            socketService.off('db_change', handler);
        };
    }, [isAuthed, loadNotifications]);

    const contextValue: NotificationsContextValue = useMemo(() => ({
        notifications,
        isRefreshingNotifications,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        setNotificationsActive: setIsNotificationsActive,
    }), [
        notifications,
        isRefreshingNotifications,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
    ]);

    return (
        <NotificationsProvider value={contextValue}>
            {children}
        </NotificationsProvider>
    );
}
