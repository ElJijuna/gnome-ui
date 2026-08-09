import type blessed from 'blessed';
import { confirmDialog } from 'blessed-components';

import { theme } from './theme.js';

export interface ConfirmYesNoOptions {
  title: string;
  message: string;
}

/**
 * Shows a Yes/No {@link confirmDialog} and resolves once the user picks
 * one — `true` for confirm, `false` for cancel (including Escape).
 */
export function confirmYesNo(
  screen: blessed.Widgets.Screen,
  options: ConfirmYesNoOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = confirmDialog({
      parent: screen,
      data: {
        id: 'confirm-update',
        title: options.title,
        message: options.message,
        confirmLabel: 'Yes',
        cancelLabel: 'No',
        defaultOpen: true,
        theme,
        onResult(result) {
          dialog.destroy();
          screen.render();
          resolve(result === 'confirm');
        },
      },
    });

    screen.render();
  });
}
