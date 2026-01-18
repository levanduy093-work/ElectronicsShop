/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { ToastProvider } from './src/components/common/ToastProvider';
import { name as appName } from './app.json';

const Root = () => (
  <SafeAreaProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
