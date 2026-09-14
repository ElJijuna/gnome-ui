/* globals jest */

// `@shopify/react-native-skia`'s own bundled `jestSetup.js` mocks the *commonjs*
// build's `skia/core/Font` module — but this project's Jest preset resolves the
// package through the "react-native"/ESM export condition (`lib/module/*`), so
// that mock silently misses `matchFont`/`useFont` here, letting the real
// implementation run (and throw, since there's no native Skia backend in Jest).
// Mocking the module-variant path directly is the fix.
jest.mock('@shopify/react-native-skia/lib/module/skia/core/Font', () => ({
  useFont: () => null,
  matchFont: () => null,
  listFontFamilies: () => [],
  useFonts: () => null,
}));
