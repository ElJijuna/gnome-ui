import blessed from 'blessed';

/** Creates the shared blessed screen used by every interactive CLI step. */
export function createAppScreen(): blessed.Widgets.Screen {
  const screen = blessed.screen({
    fullUnicode: true,
    smartCSR: true,
    title: 'gnomeui',
  });

  screen.key(['C-c'], () => {
    screen.destroy();
    process.exit(130);
  });

  return screen;
}
