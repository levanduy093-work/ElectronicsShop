import {
  AuthorizationStatus,
  deleteToken as deleteFcmTokenModular,
  getMessaging,
  getToken as getFcmTokenModular,
  getInitialNotification as getInitialNotificationModular,
  onMessage as onMessageModular,
  onNotificationOpenedApp as onNotificationOpenedAppModular,
  onTokenRefresh as onTokenRefreshModular,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  requestPermission as requestPermissionModular,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { updateFcmToken } from './api';

type NotificationPayload = {
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown>;
};

type NotificationHandler = (payload: NotificationPayload) => void;

export async function requestUserPermission() {
  const messaging = getMessaging();
  if (Platform.OS === 'ios') {
    const authStatus = await requestPermissionModular(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    return enabled;
  } else if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  return false;
}

async function ensureDeviceRegistered() {
  const messaging = getMessaging();
  try {
    const registered = isDeviceRegisteredForRemoteMessages(messaging);
    if (!registered) {
      // Needed mostly on Android or when auto-registration disabled
      await registerDeviceForRemoteMessages(messaging);
    }
  } catch (err) {
    console.warn('FCM registration check failed (ignored):', err);
  }
  return messaging;
}

export async function getFcmToken(accessToken?: string) {
  try {
    const messaging = await ensureDeviceRegistered();
    const token = await getFcmTokenModular(messaging);
    console.log('FCM Token:', token);
    if (token && accessToken) {
      try {
        await updateFcmToken(token, accessToken);
        console.log('FCM token synced to backend');
      } catch (err) {
        console.warn('Failed to sync FCM token to backend', err);
      }
    }
    return token;
  } catch (error) {
    console.warn('Failed to get FCM token:', error);
    return null;
  }
}

export function subscribeToFcmTokenRefresh(accessToken?: string) {
  const messaging = getMessaging();
  return onTokenRefreshModular(messaging, async token => {
    console.log('FCM token refreshed:', token);
    if (token && accessToken) {
      try {
        await updateFcmToken(token, accessToken);
        console.log('Refreshed FCM token synced to backend');
      } catch (err) {
        console.warn('Failed to sync refreshed FCM token', err);
      }
    }
  });
}

export async function deleteFcmToken() {
  try {
    const messaging = await ensureDeviceRegistered();
    await deleteFcmTokenModular(messaging);
    console.log('FCM token deleted');
  } catch (error) {
    console.warn('Failed to delete FCM token:', error);
  }
}

export function subscribeForegroundMessage(handler: NotificationHandler) {
  const messaging = getMessaging();
  return onMessageModular(messaging, async remoteMessage => {
    handler({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
  });
}

export function subscribeNotificationOpened(handler: NotificationHandler) {
  const messaging = getMessaging();
  return onNotificationOpenedAppModular(messaging, remoteMessage => {
    handler({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
  });
}

export async function getInitialNotificationOpen(): Promise<NotificationPayload | null> {
  try {
    const messaging = getMessaging();
    const initial = await getInitialNotificationModular(messaging);
    if (!initial) return null;
    return {
      title: initial.notification?.title,
      body: initial.notification?.body,
      data: initial.data,
    };
  } catch (error) {
    console.warn('Failed to read initial notification', error);
    return null;
  }
}
