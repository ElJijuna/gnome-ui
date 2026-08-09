import type blessed from 'blessed';
import { type AlertTone, alert } from 'blessed-components';

export interface ShowAlertOptions {
  title: string;
  description?: string;
  tone: AlertTone;
  top: number;
}

/** Renders a semantic {@link alert} message at a fixed position. */
export function showAlert(
  screen: blessed.Widgets.Screen,
  { title, description, tone, top }: ShowAlertOptions,
): blessed.Widgets.BoxElement {
  const width = Math.min(96, Number(screen.width) - 2);

  const handle = alert({
    parent: screen,
    box: { top, left: 'center', width, height: description ? 3 : 2 },
    data: { title, description, tone },
  });

  screen.render();

  return handle.element;
}
