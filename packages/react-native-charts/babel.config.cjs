module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Consuming Expo apps get this for free from `babel-preset-expo`'s own
  // auto-detection, but this package's Jest run only uses the bare RN preset
  // — victory-native's `GestureHandler` calls `useAnimatedStyle` internally,
  // which throws without the worklets plugin transforming it. Must stay last.
  plugins: ['react-native-worklets/plugin'],
};
