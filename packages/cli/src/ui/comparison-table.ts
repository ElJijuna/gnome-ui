import blessed from 'blessed';
import { renderStatus, renderTable, type TableColumn, type TableRow } from 'blessed-components';

import type { GnomeDependency } from '../dependencies.js';

interface ComparisonRow extends TableRow {
  package: string;
  section: string;
  current: string;
  latest: string;
  statusText: string;
}

const COLUMNS: readonly TableColumn<ComparisonRow>[] = [
  { id: 'package', header: 'Package', accessor: (row) => row.package },
  { id: 'section', header: 'Section', accessor: (row) => row.section, width: 18 },
  { id: 'current', header: 'Current', accessor: (row) => row.current, width: 12 },
  { id: 'latest', header: 'Latest', accessor: (row) => row.latest, width: 12 },
  { id: 'status', header: 'Status', accessor: (row) => row.statusText, width: 14 },
];

function statusText(status: GnomeDependency['status']): string {
  if (status === 'latest') {
    return renderStatus({ label: 'Latest', tone: 'success' });
  }

  if (status === 'outdated') {
    return renderStatus({ label: 'Outdated', tone: 'warning' });
  }

  return renderStatus({ label: 'Unknown', tone: 'neutral' });
}

/**
 * Renders a read-only comparison of installed vs. latest `@gnome-ui/*`
 * versions using the pure {@link renderTable} renderer — no interactivity
 * is needed here, so the interactive Table adapter is unnecessary.
 */
export function renderComparisonTable(
  screen: blessed.Widgets.Screen,
  dependencies: readonly GnomeDependency[],
  packageJsonPath: string,
): blessed.Widgets.BoxElement {
  const rows: ComparisonRow[] = dependencies.map((dependency) => ({
    id: `${dependency.section}:${dependency.name}`,
    package: dependency.name,
    section: dependency.section,
    current: dependency.current,
    latest: dependency.latest,
    statusText: statusText(dependency.status),
  }));

  const width = Math.min(96, Number(screen.width) - 2);
  const height = Math.min(Number(screen.height) - 4, rows.length + 3);

  const content = renderTable({
    columns: COLUMNS,
    rows,
    width,
    height,
    emptyText: 'No @gnome-ui dependencies found',
  });

  return blessed.box({
    parent: screen,
    top: 1,
    left: 'center',
    width: width + 2,
    height: height + 2,
    border: 'line',
    label: ` GNOME UI dependencies — ${packageJsonPath} `,
    content,
    tags: false,
  });
}
