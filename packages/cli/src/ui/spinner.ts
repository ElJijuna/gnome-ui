import type blessed from 'blessed';
import { spinner } from 'blessed-components';

import { theme } from './theme.js';

/** Runs `task` while an animated spinner labeled `label` is shown. */
export async function withSpinner<T>(
  screen: blessed.Widgets.Screen,
  label: string,
  task: () => Promise<T>,
): Promise<T> {
  const handle = spinner({
    parent: screen,
    box: { top: 1, left: 'center', width: label.length + 4, height: 1 },
    data: {
      label,
      theme,
      onFrame() {
        screen.render();
      },
    },
  });

  screen.render();

  try {
    return await task();
  } finally {
    handle.destroy();
    screen.render();
  }
}
