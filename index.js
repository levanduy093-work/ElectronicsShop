/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { ToastProvider } from './src/components/common/ToastProvider';
import { name as appName } from './app.json';

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
