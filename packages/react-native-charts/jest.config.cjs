/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  testEnvironment: '<rootDir>/test/skiaTestEnvironment.cjs',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // The base preset's own pattern only unblocks `react-native`/`@react-native*`
  // — victory-native and its native-module peers all ship untranspiled ESM too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@shopify/react-native-skia|victory-native|react-native-gesture-handler|react-native-reanimated|react-native-worklets|d3-.*|internmap|its-fine)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: [
    '@shopify/react-native-skia/jestSetup.js',
    '<rootDir>/test/skiaFontMock.cjs',
    'react-native-gesture-handler/jestSetup.js',
  ],
  resolver: 'react-native-worklets/jest/resolver.js',
};
