import { type ReactNode, useRef, useState } from "react";
import styles from "./ColumnView.module.css";

export interface ColumnDef<TRow> {
  id: string;
  header: ReactNode;
  cell: (row: TRow, index: number) => ReactNode;
  sortable?: boolean;
  /** CSS width value — e.g. "200px", "30%". */
  width?: string;
  align?: "start" | "center" | "end";
}

export type SortDirection = "asc" | "desc";

export interface ColumnViewSortState {
  columnId: string;
  direction: SortDirection;
}

export type ColumnViewSelectionMode = "none" | "single" | "multiple";

export interface ColumnViewProps<TRow extends object = Record<string, unknown>> {
  columns: ColumnDef<TRow>[];
  rows: TRow[];
  /** Extract a stable unique key per row. */
  rowKey: (row: TRow) => string | number;
  /** @default "none" */
  selectionMode?: ColumnViewSelectionMode;
  /** Controlled set of selected row keys. */
  selectedRows?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  /** Controlled sort state. */
  sortState?: ColumnViewSortState;
  onSort?: (columnId: string, direction: SortDirection) => void;
  /** Constrains height and enables vertical scroll. */
  height?: string | number;
  /** Rendered when `rows` is empty. */
  emptyState?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

const ALIGN: Record<string, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};

function SortChevron({ direction }: { direction: SortDirection | null }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      className={direction ? styles.sortActive : styles.sortNeutral}
    >
      {direction === "asc" ? (
        <path d="M5 2 L9 8 L1 8 Z" fill="currentColor" />
      ) : direction === "desc" ? (
        <path d="M5 8 L1 2 L9 2 Z" fill="currentColor" />
      ) : (
        <>
          <path d="M5 1 L8 5 L2 5 Z" fill="currentColor" opacity="0.4" />
          <path d="M5 9 L2 5 L8 5 Z" fill="currentColor" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

export function ColumnView<TRow extends object = Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  selectionMode = "none",
  selectedRows = [],
  onSelectionChange,
  sortState,
  onSort,
  height,
  emptyState,
  className,
  ariaLabel,
}: ColumnViewProps<TRow>) {
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const selectedSet = new Set(selectedRows);
  const hasCheckbox = selectionMode === "multiple";
  const colSpan = columns.length + (hasCheckbox ? 1 : 0);

  function handleSort(colId: string) {
    if (!onSort) return;
    const next: SortDirection =
      sortState?.columnId === colId && sortState.direction === "asc"
        ? "desc"
        : "asc";
    onSort(colId, next);
  }

  function toggleRow(key: string | number) {
    if (selectionMode === "none" || !onSelectionChange) return;
    if (selectionMode === "single") {
      onSelectionChange(selectedSet.has(key) ? [] : [key]);
    } else {
      const next = new Set(selectedSet);
      next.has(key) ? next.delete(key) : next.add(key);
      onSelectionChange([...next]);
    }
  }

  function handleRowKey(
    e: React.KeyboardEvent,
    index: number,
    key: string | number,
  ) {
    const rows_els =
      tbodyRef.current?.querySelectorAll<HTMLTableRowElement>("tr") ?? [];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(rows.length - 1, index + 1);
      setFocusedIndex(next);
      rows_els[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(0, index - 1);
      setFocusedIndex(prev);
      rows_els[prev]?.focus();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleRow(key);
    }
  }

  function handleSelectAll(checked: boolean) {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? rows.map(rowKey) : []);
  }

  const containerStyle: React.CSSProperties = height
    ? { height: typeof height === "number" ? `${height}px` : height }
    : {};

  return (
    <div className={[styles.outer, className].filter(Boolean).join(" ")}>
      <div className={styles.scroll} style={containerStyle}>
        <table
          className={styles.table}
          role="grid"
          aria-label={ariaLabel}
          aria-multiselectable={selectionMode === "multiple" || undefined}
        >
          <thead className={styles.thead}>
            <tr>
              {hasCheckbox && (
                <th className={[styles.th, styles.checkboxCol].join(" ")}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={
                      rows.length > 0 && selectedRows.length === rows.length
                    }
                    ref={(el) => {
                      if (el)
                        el.indeterminate =
                          selectedRows.length > 0 &&
                          selectedRows.length < rows.length;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortState?.columnId === col.id;
                return (
                  <th
                    key={col.id}
                    className={[styles.th, col.align ? ALIGN[col.align] : null]
                      .filter(Boolean)
                      .join(" ")}
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={
                      isSorted
                        ? sortState!.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : col.sortable
                          ? "none"
                          : undefined
                    }
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        className={[
                          styles.sortBtn,
                          isSorted ? styles.sortBtnActive : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => handleSort(col.id)}
                      >
                        <span>{col.header}</span>
                        <SortChevron
                          direction={isSorted ? sortState!.direction : null}
                        />
                      </button>
                    ) : (
                      <span className={styles.headerLabel}>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody ref={tbodyRef} className={styles.tbody}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className={styles.emptyCell}>
                  {emptyState ?? (
                    <span className={styles.emptyLabel}>No items</span>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const key = rowKey(row);
                const isSelected = selectedSet.has(key);
                return (
                  <tr
                    key={key}
                    className={[
                      styles.row,
                      isSelected ? styles.rowSelected : null,
                      selectionMode !== "none" ? styles.rowSelectable : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="row"
                    aria-selected={
                      selectionMode !== "none" ? isSelected : undefined
                    }
                    tabIndex={focusedIndex === index ? 0 : -1}
                    onClick={() => toggleRow(key)}
                    onKeyDown={(e) => handleRowKey(e, index, key)}
                    onFocus={() => setFocusedIndex(index)}
                  >
                    {hasCheckbox && (
                      <td className={[styles.td, styles.checkboxCol].join(" ")}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          onClick={(e) => e.stopPropagation()}
                          tabIndex={-1}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={[
                          styles.td,
                          col.align ? ALIGN[col.align] : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        role="gridcell"
                      >
                        {col.cell(row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
