module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      'module:@react-native/babel-preset',
      // NativeWind preset injects css-interop transforms for className props
      'nativewind/babel',
    ],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
      // Keep Reanimated / Worklets plugin last
      'react-native-reanimated/plugin',
    ],
  };
};
