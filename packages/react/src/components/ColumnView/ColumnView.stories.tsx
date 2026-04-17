import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ColumnView } from "./ColumnView";
import type { ColumnDef, ColumnViewSortState, SortDirection } from "./ColumnView";

const meta: Meta<typeof ColumnView> = {
  title: "Data Display/ColumnView",
  component: ColumnView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Multi-column sortable data table styled with Adwaita design tokens.

Mirrors \`GtkColumnView\` / \`AdwColumnView\` — the canonical GNOME widget for tabular data in file managers, settings lists, and dashboards.

**Guidelines (GNOME HIG):**
- Use for datasets where users benefit from comparing values across columns.
- Prefer \`selectionMode="single"\` for navigation (open on click) and \`"multiple"\` for batch operations.
- Always provide an \`ariaLabel\` describing the data set.
- Set \`height\` when the dataset may exceed the viewport — this enables vertical scroll with a sticky header.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColumnView>;

interface FileRow {
  id: number;
  name: string;
  type: string;
  size: string;
  modified: string;
}

const FILES: FileRow[] = [
  { id: 1, name: "Documents", type: "Folder", size: "—", modified: "2 days ago" },
  { id: 2, name: "Downloads", type: "Folder", size: "—", modified: "Today" },
  { id: 3, name: "Pictures", type: "Folder", size: "—", modified: "Last week" },
  { id: 4, name: "Music", type: "Folder", size: "—", modified: "1 month ago" },
  { id: 5, name: "report.pdf", type: "PDF", size: "1.2 MB", modified: "Yesterday" },
  { id: 6, name: "photo.jpg", type: "Image", size: "3.8 MB", modified: "3 days ago" },
  { id: 7, name: "notes.txt", type: "Text", size: "4 KB", modified: "Today" },
  { id: 8, name: "backup.zip", type: "Archive", "size": "48 MB", modified: "Last month" },
];

const FILE_COLUMNS: ColumnDef<FileRow>[] = [
  { id: "name", header: "Name", cell: (r) => r.name, sortable: true, width: "40%" },
  { id: "type", header: "Type", cell: (r) => r.type, sortable: true },
  { id: "size", header: "Size", cell: (r) => r.size, align: "end" },
  { id: "modified", header: "Modified", cell: (r) => r.modified, sortable: true },
];

export const Default: Story = {
  render: () => (
    <ColumnView
      columns={FILE_COLUMNS}
      rows={FILES}
      rowKey={(r) => r.id}
      ariaLabel="Files"
    />
  ),
};

export const WithSort: Story = {
  render: () => {
    const [sort, setSort] = useState<ColumnViewSortState>({
      columnId: "name",
      direction: "asc",
    });

    const sorted = [...FILES].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      const key = sort.columnId as keyof FileRow;
      return String(a[key]).localeCompare(String(b[key])) * dir;
    });

    return (
      <ColumnView
        columns={FILE_COLUMNS}
        rows={sorted}
        rowKey={(r) => r.id}
        sortState={sort}
        onSort={(columnId, direction) => setSort({ columnId, direction })}
        ariaLabel="Files — sortable"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Controlled sort state. Click a column header to sort; click again to toggle direction.",
      },
    },
  },
};

export const SingleSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<(string | number)[]>([]);
    return (
      <ColumnView
        columns={FILE_COLUMNS}
        rows={FILES}
        rowKey={(r) => r.id}
        selectionMode="single"
        selectedRows={selected}
        onSelectionChange={setSelected}
        ariaLabel="Files — single selection"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click a row to select it; click again to deselect. Use ↑/↓ to navigate, Space/Enter to toggle.",
      },
    },
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<(string | number)[]>([2, 5]);
    return (
      <ColumnView
        columns={FILE_COLUMNS}
        rows={FILES}
        rowKey={(r) => r.id}
        selectionMode="multiple"
        selectedRows={selected}
        onSelectionChange={setSelected}
        ariaLabel="Files — multiple selection"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Checkbox column added automatically. Header checkbox selects/deselects all rows and shows indeterminate state for partial selection.",
      },
    },
  },
};

export const FixedHeight: Story = {
  render: () => {
    const [sort, setSort] = useState<ColumnViewSortState>({ columnId: "name", direction: "asc" });
    const [selected, setSelected] = useState<(string | number)[]>([]);

    const sorted = [...FILES].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      const key = sort.columnId as keyof FileRow;
      return String(a[key]).localeCompare(String(b[key])) * dir;
    });

    return (
      <ColumnView
        columns={FILE_COLUMNS}
        rows={sorted}
        rowKey={(r) => r.id}
        selectionMode="single"
        selectedRows={selected}
        onSelectionChange={setSelected}
        sortState={sort}
        onSort={(id, dir: SortDirection) => setSort({ columnId: id, direction: dir })}
        height={260}
        ariaLabel="Files — scrollable"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fixed `height` enables vertical scroll with a sticky header. Combines sort and single selection.",
      },
    },
  },
};

export const EmptyState: Story = {
  render: () => (
    <ColumnView
      columns={FILE_COLUMNS}
      rows={[]}
      rowKey={(r) => r.id}
      ariaLabel="Files — empty"
    />
  ),
  parameters: {
    docs: {
      description: { story: "When `rows` is empty the default \"No items\" label is shown." },
    },
  },
};

export const CustomEmptyState: Story = {
  render: () => (
    <ColumnView
      columns={FILE_COLUMNS}
      rows={[]}
      rowKey={(r) => r.id}
      ariaLabel="Search results"
      emptyState={
        <span style={{ fontStyle: "italic", opacity: 0.6 }}>
          No files match your search.
        </span>
      }
    />
  ),
};
