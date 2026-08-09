import { createTheme } from 'blessed-components';

/** Shared theme for every blessed-components widget rendered by this CLI. */
export const theme = createTheme({
  colors: { primary: 'blue' },
});
