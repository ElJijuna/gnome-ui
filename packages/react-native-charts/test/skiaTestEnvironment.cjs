// This package needs both `@react-native/jest-preset`'s custom export-condition
// resolution (so Metro-only "react-native" package exports resolve the same way
// in Jest) AND `@shopify/react-native-skia`'s own test environment (which seeds
// `global.CanvasKit` for its mock renderer) — upstream ships them as two
// separate, mutually-exclusive `testEnvironment` classes, so this combines them.
// Jest loads this file directly with Node's CommonJS loader, so `require()`
// here is unavoidable rather than a style slip.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TestEnvironment: NodeEnv } = require('jest-environment-node');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CanvasKitInit = require('canvaskit-wasm/bin/full/canvaskit');

module.exports = class SkiaReactNativeEnv extends NodeEnv {
  customExportConditions = ['require', 'react-native'];

  async setup() {
    await super.setup();
    const CanvasKit = await CanvasKitInit({});
    this.global.CanvasKit = CanvasKit;
  }
};
