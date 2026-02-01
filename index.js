/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';

// Ignore SafeAreaView deprecation (use react-native-safe-area-context instead)
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'SafeAreaView',
]);

import { enableScreens } from 'react-native-screens';
enableScreens();

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { ToastProvider } from './src/components/common/ToastProvider';
import { name as appName } from './app.json';
import './global.css';

try {
  setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
    console.log('Handled background message', remoteMessage?.messageId || remoteMessage?.data);
  });
} catch (error) {
  console.warn('Failed to register background message handler', error);
}

const Root = () => (
  <SafeAreaProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
