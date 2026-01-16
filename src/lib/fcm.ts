import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { updateFcmToken } from './api';

type ForegroundHandler = (payload: {
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown>;
}) => void;

export async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

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

export async function getFcmToken(accessToken?: string) {
  try {
    const token = await messaging().getToken();
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
  return messaging().onTokenRefresh(async token => {
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

export function subscribeForegroundMessage(handler: ForegroundHandler) {
  return messaging().onMessage(async remoteMessage => {
    handler({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
  });
}
