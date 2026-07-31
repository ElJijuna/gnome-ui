import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ColumnView, type ColumnDef } from './ColumnView';

interface Row {
  id: number;
  name: string;
}

const rows: Row[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const columns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
];

describe('ColumnView', () => {
  describe('rendering', () => {
    it('renders column headers', () => {
      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} />);
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    });

    it('renders a row per item with cell content', () => {
      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 rows
    });

    it('renders a default empty state when rows is empty', () => {
      render(<ColumnView columns={columns} rows={[]} rowKey={(r) => r.id} />);
      expect(screen.getByText('No items')).toBeInTheDocument();
    });

    it('renders a custom empty state', () => {
      render(
        <ColumnView
          columns={columns}
          rows={[]}
          rowKey={(r) => r.id}
          emptyState={<span>Nothing here</span>}
        />,
      );

      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('sets the accessible name via ariaLabel', () => {
      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} ariaLabel="People" />);
      expect(screen.getByRole('table')).toHaveAccessibleName('People');
    });
  });

  describe('sorting', () => {
    it('renders a sort button for sortable columns when onSort is provided', () => {
      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} onSort={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
    });

    it('does not render a sort button without onSort', () => {
      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} />);
      expect(screen.queryByRole('button', { name: 'Name' })).not.toBeInTheDocument();
    });

    it('calls onSort with "asc" the first time a column header is clicked', async () => {
      const onSort = vi.fn();

      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} onSort={onSort} />);
      await userEvent.click(screen.getByRole('button', { name: 'Name' }));

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('toggles to "desc" when already sorted ascending', async () => {
      const onSort = vi.fn();

      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onSort={onSort}
          sortState={{ columnId: 'name', direction: 'asc' }}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Name' }));

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('sets aria-sort on the sorted column header', () => {
      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onSort={vi.fn()}
          sortState={{ columnId: 'name', direction: 'asc' }}
        />,
      );

      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
        'aria-sort',
        'ascending',
      );
    });
  });

  describe('single selection', () => {
    it('selects a row on click and calls onSelectionChange', async () => {
      const onSelectionChange = vi.fn();

      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        />,
      );

      await userEvent.click(screen.getByText('Alice'));
      expect(onSelectionChange).toHaveBeenCalledWith([1]);
    });

    it('deselects when clicking an already-selected row', async () => {
      const onSelectionChange = vi.fn();

      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="single"
          selectedRows={[1]}
          onSelectionChange={onSelectionChange}
        />,
      );

      await userEvent.click(screen.getByText('Alice'));
      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('marks the selected row aria-selected=true', () => {
      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="single"
          selectedRows={[1]}
          onSelectionChange={vi.fn()}
        />,
      );

      expect(screen.getByText('Alice').closest('tr')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Bob').closest('tr')).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('multiple selection', () => {
    it('renders a select-all checkbox and a per-row checkbox', () => {
      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="multiple"
          onSelectionChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeInTheDocument();
    });

    it('adds/removes a row from the selection independently', async () => {
      const onSelectionChange = vi.fn();

      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="multiple"
          selectedRows={[1]}
          onSelectionChange={onSelectionChange}
        />,
      );

      await userEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
      expect(onSelectionChange).toHaveBeenCalledWith([1, 2]);
    });

    it('selects all rows when the select-all checkbox is checked', async () => {
      const onSelectionChange = vi.fn();

      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        />,
      );

      await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
      expect(onSelectionChange).toHaveBeenCalledWith([1, 2]);
    });

    it('clears the selection when the select-all checkbox is unchecked', async () => {
      const onSelectionChange = vi.fn();

      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="multiple"
          selectedRows={[1, 2]}
          onSelectionChange={onSelectionChange}
        />,
      );

      await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('marks the select-all checkbox indeterminate for a partial selection', () => {
      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="multiple"
          selectedRows={[1]}
          onSelectionChange={vi.fn()}
        />,
      );

      const selectAll = screen.getByRole('checkbox', {
        name: 'Select all rows',
      }) as HTMLInputElement;
      expect(selectAll.indeterminate).toBe(true);
    });

    it('sets aria-multiselectable on the table', () => {
      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="multiple"
          onSelectionChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('table')).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowDown/ArrowUp move focus between rows', async () => {
      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} />);
      const firstRow = screen.getByText('Alice').closest('tr') as HTMLElement;
      const secondRow = screen.getByText('Bob').closest('tr') as HTMLElement;

      firstRow.focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(secondRow).toHaveFocus();

      await userEvent.keyboard('{ArrowUp}');
      expect(firstRow).toHaveFocus();
    });

    it('Enter/Space toggle selection on the focused row', async () => {
      const onSelectionChange = vi.fn();

      render(
        <ColumnView
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        />,
      );

      const firstRow = screen.getByText('Alice').closest('tr') as HTMLElement;
      firstRow.focus();
      await userEvent.keyboard(' ');

      expect(onSelectionChange).toHaveBeenCalledWith([1]);
    });

    it('only the focused row is in the tab order (roving tabindex)', () => {
      render(<ColumnView columns={columns} rows={rows} rowKey={(r) => r.id} />);

      expect(screen.getByText('Alice').closest('tr')).toHaveAttribute('tabIndex', '0');
      expect(screen.getByText('Bob').closest('tr')).toHaveAttribute('tabIndex', '-1');
    });
  });

  it('does not toggle row selection when clicking a row checkbox (stopPropagation)', async () => {
    const onSelectionChange = vi.fn();

    render(
      <ColumnView
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));

    // Only the checkbox's own onChange should have fired once, not also the row's onClick.
    expect(onSelectionChange).toHaveBeenCalledOnce();
  });

  it('renders custom cell content via the column cell renderer', () => {
    const withRenderer: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', cell: (row, index) => `${index}: ${row.name}` },
    ];

    render(<ColumnView columns={withRenderer} rows={rows} rowKey={(r) => r.id} />);
    expect(within(screen.getByRole('table')).getByText('0: Alice')).toBeInTheDocument();
  });
});
