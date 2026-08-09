import blessed from 'blessed';
import { type MultiSelectData, type MultiSelectItem, multiSelect } from 'blessed-components';

import type { GnomeDependency } from '../dependencies.js';

const HELP_TEXT =
  ' ↑/↓ move · space/enter toggle · a select all · n select none · y confirm · q cancel ';

/**
 * Lets the user narrow down which outdated `@gnome-ui/*` packages to
 * update, defaulting to all of them selected. Resolves with the selected
 * subset, or an empty array when the user cancels.
 */
export function selectDependenciesToUpdate(
  screen: blessed.Widgets.Screen,
  outdated: readonly GnomeDependency[],
  { top }: { top: number },
): Promise<GnomeDependency[]> {
  return new Promise((resolve) => {
    let selectedIds = new Set(outdated.map((dependency) => dependency.name));

    const items: MultiSelectItem[] = outdated.map((dependency) => ({
      id: dependency.name,
      label: `${dependency.name}  ${dependency.current} -> ${dependency.latest}`,
    }));

    const width = Math.min(96, Number(screen.width) - 2);
    const height = Math.min(Number(screen.height) - top - 3, items.length + 2);

    function buildData(): MultiSelectData {
      return {
        items,
        open: true,
        values: [...selectedIds],
        placeholder: 'Select packages to update',
        onValuesChange(values) {
          selectedIds = new Set(values);
          handle.setData(buildData());
          screen.render();
        },
      };
    }

    const handle = multiSelect({
      parent: screen,
      box: {
        top,
        left: 'center',
        width,
        height,
        border: 'line',
        label: ' Select packages to update ',
      },
      data: buildData(),
    });

    const help = blessed.box({
      parent: screen,
      top: top + height,
      left: 'center',
      width,
      height: 1,
      content: HELP_TEXT,
      style: { fg: 'grey' },
    });

    function finish(ids: ReadonlySet<string>) {
      screen.unkey('a', onSelectAll);
      screen.unkey('n', onSelectNone);
      screen.unkey('y', onConfirm);
      screen.unkey('q', onCancel);
      screen.unkey('escape', onCancel);
      screen.unkey('C-c', onCancel);
      handle.destroy();
      help.destroy();
      screen.render();
      resolve(outdated.filter((dependency) => ids.has(dependency.name)));
    }

    function onSelectAll() {
      selectedIds = new Set(outdated.map((dependency) => dependency.name));
      handle.setData(buildData());
      screen.render();
    }

    function onSelectNone() {
      selectedIds = new Set();
      handle.setData(buildData());
      screen.render();
    }

    function onConfirm() {
      finish(selectedIds);
    }

    function onCancel() {
      finish(new Set());
    }

    screen.key(['a'], onSelectAll);
    screen.key(['n'], onSelectNone);
    screen.key(['y'], onConfirm);
    screen.key(['q', 'escape', 'C-c'], onCancel);

    handle.focus();
    screen.render();
  });
}
