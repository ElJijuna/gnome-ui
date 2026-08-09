import blessed from 'blessed';

import {
  createNpmLatestVersionFetcher,
  type GnomeDependency,
  getGnomeDependencies,
} from './dependencies.js';
import { loadProjectContext, type ProjectContext } from './project.js';
import { showAlert } from './ui/alert.js';
import { renderComparisonTable } from './ui/comparison-table.js';
import { confirmYesNo } from './ui/confirm.js';
import { createAppScreen } from './ui/screen.js';
import { selectDependenciesToUpdate } from './ui/select-dependencies.js';
import { withSpinner } from './ui/spinner.js';
import { applyUpdates, detectPackageManager } from './update.js';

export interface RunOptions {
  /** Skip the Yes/No confirmation before selecting packages to update. */
  skipConfirm: boolean;
}

type FlowResult =
  | { kind: 'handled' }
  | { kind: 'declined'; dependencies: GnomeDependency[] }
  | { kind: 'apply'; dependencies: GnomeDependency[]; toApply: GnomeDependency[] };

type FetchResult =
  | { kind: 'empty' }
  | { kind: 'ok'; dependencies: GnomeDependency[]; tableBottom: number };

function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function waitForKey(screen: blessed.Widgets.Screen): Promise<void> {
  return new Promise((resolve) => {
    screen.key(['escape', 'q', 'enter', 'space'], () => {
      screen.destroy();
      resolve();
    });
    screen.render();
  });
}

function renderContinueHint(screen: blessed.Widgets.Screen, top: number): void {
  blessed.box({
    parent: screen,
    top,
    left: 'center',
    width: Math.min(96, Number(screen.width) - 2),
    height: 1,
    content: ' Press any key to continue ',
    style: { fg: 'grey' },
  });
}

/**
 * Fetches every `@gnome-ui/*` dependency and either shows the comparison
 * table, or — when there are none — an alert the user dismisses with any
 * key. Shared by the `status`, `verify`, and `update` interactive flows.
 */
async function fetchAndShowTable(
  screen: blessed.Widgets.Screen,
  context: ProjectContext,
): Promise<FetchResult> {
  const dependencies = await withSpinner(screen, 'Fetching latest versions from npm...', () =>
    getGnomeDependencies(context, createNpmLatestVersionFetcher()),
  );

  if (dependencies.length === 0) {
    showAlert(screen, {
      tone: 'info',
      title: 'No @gnome-ui dependencies found',
      description: context.packageJsonPath,
      top: 1,
    });
    renderContinueHint(screen, 4);
    await waitForKey(screen);

    return { kind: 'empty' };
  }

  const table = renderComparisonTable(screen, dependencies, context.packageJsonPath);
  const tableBottom = Number(table.top) + Number(table.height);

  return { kind: 'ok', dependencies, tableBottom };
}

async function runInteractiveStatus(context: ProjectContext): Promise<void> {
  const screen = createAppScreen();

  try {
    const fetched = await fetchAndShowTable(screen, context);

    if (fetched.kind === 'empty') {
      return;
    }

    renderContinueHint(screen, fetched.tableBottom + 1);
    await waitForKey(screen);
  } catch (error) {
    screen.destroy();
    throw error;
  }
}

async function runInteractiveFlow(
  context: ProjectContext,
  options: RunOptions,
): Promise<FlowResult> {
  const screen = createAppScreen();

  try {
    const fetched = await fetchAndShowTable(screen, context);

    if (fetched.kind === 'empty') {
      return { kind: 'handled' };
    }

    const { dependencies, tableBottom } = fetched;
    const outdated = dependencies.filter((dependency) => dependency.status !== 'latest');

    if (outdated.length === 0) {
      showAlert(screen, {
        tone: 'success',
        title: 'All @gnome-ui dependencies are up to date',
        top: tableBottom + 1,
      });
      renderContinueHint(screen, tableBottom + 3);
      await waitForKey(screen);

      return { kind: 'handled' };
    }

    if (!options.skipConfirm) {
      const shouldUpdate = await confirmYesNo(screen, {
        title: 'Update packages',
        message: `${outdated.length} outdated package(s) found. Update now?`,
      });

      if (!shouldUpdate) {
        screen.destroy();

        return { kind: 'declined', dependencies };
      }
    }

    const selected = await selectDependenciesToUpdate(screen, outdated, { top: tableBottom + 1 });

    if (selected.length === 0) {
      screen.destroy();

      return { kind: 'declined', dependencies };
    }

    const packageManager = detectPackageManager(context.projectRoot);
    const shouldInstall = await confirmYesNo(screen, {
      title: 'Install updates',
      message: `Update ${selected.length} package(s) and run \`${packageManager} install\`?`,
    });

    screen.destroy();

    if (!shouldInstall) {
      return { kind: 'declined', dependencies };
    }

    return { kind: 'apply', dependencies, toApply: selected };
  } catch (error) {
    screen.destroy();
    throw error;
  }
}

async function runNonInteractive(context: ProjectContext, options: RunOptions): Promise<void> {
  const dependencies = await getGnomeDependencies(context, createNpmLatestVersionFetcher());

  printPlainComparison(dependencies, context.packageJsonPath);

  const outdated = dependencies.filter((dependency) => dependency.status !== 'latest');

  if (outdated.length === 0) {
    printPlainSummary(dependencies, []);

    return;
  }

  if (!options.skipConfirm) {
    console.log(
      '\nNo interactive terminal detected. Run `gnomeui update` to update automatically.',
    );
    printPlainSummary(dependencies, []);

    return;
  }

  const updated = await applyUpdates(context, outdated);

  printPlainSummary(dependencies, updated);
}

function printPlainComparison(
  dependencies: readonly GnomeDependency[],
  packageJsonPath: string,
): void {
  console.log('\nGNOME UI dependencies');
  console.log(packageJsonPath);

  if (dependencies.length === 0) {
    console.log('\nNo @gnome-ui dependencies found in this project.');

    return;
  }

  console.table(
    dependencies.map((dependency) => ({
      Package: dependency.name,
      Section: dependency.section,
      Current: dependency.current,
      Latest: dependency.latest,
      Status: dependency.status,
    })),
  );
}

function printPlainSummary(
  dependencies: readonly GnomeDependency[],
  updated: readonly GnomeDependency[],
): void {
  const outdatedCount = dependencies.filter((dependency) => dependency.status !== 'latest').length;
  const pending = Math.max(outdatedCount - updated.length, 0);

  console.log('\nSummary');
  console.log(`Total @gnome-ui: ${dependencies.length}`);
  console.log(
    `Up to date: ${dependencies.filter((dependency) => dependency.status === 'latest').length}`,
  );
  console.log(`Updated: ${updated.length}`);
  console.log(`Pending: ${pending}`);
}

async function run(options: RunOptions): Promise<void> {
  const context = await loadProjectContext(process.cwd());

  if (!isInteractive()) {
    await runNonInteractive(context, options);

    return;
  }

  const result = await runInteractiveFlow(context, options);

  if (result.kind === 'handled') {
    return;
  }

  if (result.kind === 'declined') {
    console.log('No changes made.');
    printPlainSummary(result.dependencies, []);

    return;
  }

  const updated = await applyUpdates(context, result.toApply);

  printPlainSummary(result.dependencies, updated);
}

/** Compares installed `@gnome-ui/*` packages with npm `latest` and asks before updating. */
export async function runVerify(): Promise<void> {
  await run({ skipConfirm: false });
}

/** Compares installed `@gnome-ui/*` packages with npm `latest` and lets the user pick which to update, without asking first. */
export async function runUpdate(): Promise<void> {
  await run({ skipConfirm: true });
}

/**
 * Shows installed `@gnome-ui/*` packages and their status against npm
 * `latest` — a read-only report, with no confirmation or update step. This
 * is what runs when the CLI is invoked with no command.
 */
export async function runStatus(): Promise<void> {
  const context = await loadProjectContext(process.cwd());

  if (!isInteractive()) {
    const dependencies = await getGnomeDependencies(context, createNpmLatestVersionFetcher());

    printPlainComparison(dependencies, context.packageJsonPath);
    printPlainSummary(dependencies, []);

    return;
  }

  await runInteractiveStatus(context);
}
