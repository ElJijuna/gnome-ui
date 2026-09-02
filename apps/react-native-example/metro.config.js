// Metro's default config only watches this app's own folder. This is a
// standard npm workspaces monorepo, and `@gnome-ui/react-native` is a
// sibling workspace package outside that folder (reached through a
// `node_modules` symlink) — Metro needs `watchFolders` to include the repo
// root so it notices changes there and resolves the workspace-hoisted
// `node_modules` correctly.
// Metro loads this file directly with Node's CommonJS loader — it can't
// consume an ESM `import`, so `require()` here is unavoidable rather than
// a style slip.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
