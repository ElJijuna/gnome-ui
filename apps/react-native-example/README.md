# @gnome-ui/react-native-example

A Storybook-style gallery app for [`@gnome-ui/react-native`](../../packages/react-native), runnable in [Expo Go](https://expo.dev/go) on a physical device or simulator — no native build required.

Home screen lists every shipped component; tapping one opens a demo screen with its states and variants, similar to a Storybook story. A top toolbar built from the library's own `Button` cycles `GnomeProvider`'s three knobs — `colorScheme`, `contrast`, `accentColor` — live, across every screen.

## Running it

From the repo root:

```bash
npm install
npm start --workspace=@gnome-ui/react-native-example
```

`npm start` first rebuilds `@gnome-ui/react-native` (via its own `prestart` hook), then starts the Expo dev server. Scan the printed QR code with the **Expo Go** app (iOS/Android) or press `i`/`a` for a simulator.

### Iterating on the library itself

`@gnome-ui/react-native` is consumed through its built `dist/` output (its `package.json` `main`/`exports` point there, same as any published package), not its `src/`. Editing library source won't show up until it's rebuilt. In a second terminal, keep it rebuilding on save:

```bash
npm run build --workspace=@gnome-ui/react-native -- --watch
```

Metro (configured in `metro.config.js` to watch the whole monorepo, not just this app's own folder) picks up the changed `dist/` files and reloads automatically.

### `expo-doctor` and the React/React Native patch mismatch

`npx expo-doctor` flags `react`/`react-native` as one patch version behind
what Expo SDK 57 expects (`19.2.8`/`0.86.2` vs. `19.2.3`/`0.86.3`). That's
deliberate: `package.json` pins them with the same caret ranges
`@gnome-ui/react-native` already uses (`^19.0.0`/`^0.86.2`) so npm hoists
this app onto the exact copies the rest of the monorepo already installs,
rather than the template's exact pins pulling in a second, duplicate React
— which would be a correctness bug (duplicate React copies break hooks and
context), not just a lint nag. Both versions satisfy Expo's ranges; this is
safe to ignore.

## Structure

- `App.tsx` — `GnomeProvider` + the controls toolbar + the home/detail screen switch (plain `useState`, no navigation library — the gallery is small enough not to need one).
- `src/ControlsBar.tsx` — the color-scheme/contrast/accent-color toggles.
- `src/HomeScreen.tsx` — the component list.
- `src/screens/*Screen.tsx` — one demo per shipped component.
- `src/Section.tsx` — the labeled-group wrapper reused across every demo screen.
