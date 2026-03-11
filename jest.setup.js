// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => {
  const messagingInstance = {};
  const requestPermission = jest.fn(() => Promise.resolve(1));
  const getToken = jest.fn(() => Promise.resolve('mock-fcm-token'));
  const deleteToken = jest.fn(() => Promise.resolve());
  const getInitialNotification = jest.fn(() => Promise.resolve(null));
  const onMessage = jest.fn(() => jest.fn());
  const onNotificationOpenedApp = jest.fn(() => jest.fn());
  const onTokenRefresh = jest.fn(() => jest.fn());

  return {
    __esModule: true,
    AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
    getMessaging: jest.fn(() => messagingInstance),
    requestPermission,
    getToken,
    deleteToken,
    getInitialNotification,
    onMessage,
    onNotificationOpenedApp,
    onTokenRefresh,
    default: () => ({
      requestPermission,
      getToken,
      deleteToken,
      onMessage,
      onTokenRefresh,
    }),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-gesture-handler only if installed
try {
  require('react-native-gesture-handler');
  jest.mock('react-native-gesture-handler', () => {
    const { View } = require('react-native');
    return {
      Swipeable: View,
      DrawerLayout: View,
      GestureHandlerRootView: View,
      State: {},
      ScrollView: View,
      gestureHandlerRootHOC: jest.fn((x) => x),
      Directions: {},
    };
  });
} catch {
  // Module not installed, skip mocking
}

// Mock react-native-clipboard
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
}));

// Mock react-native-netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock react-native-dotenv
jest.mock('react-native-dotenv', () => ({
  API_BASE_URL: 'http://localhost:3000',
  API_DEVICE_HOST: undefined,
}));

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ data: { idToken: 'mock-id-token' } })),
    signOut: jest.fn(() => Promise.resolve()),
    revokeAccess: jest.fn(() => Promise.resolve()),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock react-native-biometrics
jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'Biometrics' })),
  simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock @react-native-firebase/auth
jest.mock('@react-native-firebase/auth', () => {
  const auth = () => ({
    signInWithCredential: jest.fn(() =>
      Promise.resolve({
        user: { getIdToken: jest.fn(() => Promise.resolve('mock-firebase-token')) },
      })
    ),
  });
  auth.GoogleAuthProvider = { credential: jest.fn(() => ({})) };
  auth.AppleAuthProvider = { credential: jest.fn(() => ({})) };
  return auth;
});

// Mock @invertase/react-native-apple-authentication
jest.mock('@invertase/react-native-apple-authentication', () => ({
  appleAuth: {
    performRequest: jest.fn(() => Promise.resolve({ identityToken: 'mock-identity', nonce: 'mock-nonce' })),
    Operation: { LOGIN: 'LOGIN' },
    Scope: { EMAIL: 'EMAIL', FULL_NAME: 'FULL_NAME' },
  },
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp',
  DownloadDirectoryPath: '/tmp',
  TemporaryDirectoryPath: '/tmp',
  mkdir: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(false)),
  downloadFile: jest.fn(() => ({ promise: Promise.resolve({ statusCode: 200 }) })),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('')),
  unlink: jest.fn(() => Promise.resolve()),
}));

// Use React's JSX runtime to avoid css-interop side effects in tests
jest.mock('react-native-css-interop/jsx-runtime', () => require('react/jsx-runtime'));
jest.mock('react-native-css-interop/jsx-dev-runtime', () => require('react/jsx-dev-runtime'));

if (!global.window) {
  // @ts-expect-error - jest env doesn't include window by default
  global.window = {};
}
// @ts-expect-error - jest env doesn't include dispatchEvent
global.window.dispatchEvent = jest.fn();

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
