import type { IconDefinition } from '@gnome-ui/icons';
import { DocumentEdit } from '@gnome-ui/icons';
import { type ReactNode, useState } from 'react';

import { ActionRow } from '@/components/ActionRow';
import { BottomSheet } from '@/components/BottomSheet';
import { BoxedList } from '@/components/BoxedList';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Modal } from '@/components/Modal';
import { StatusPage } from '@/components/StatusPage';

import styles from './WidgetManager.module.css';

export interface WidgetDefinition {
  /** Stable unique identifier. Also the value stored in `value`. */
  id: string;
  /** Row label shown in the picker catalog and above the widget once added. */
  label: string;
  /** Optional secondary line shown below `label` in the picker row. */
  description?: string;
  /** Icon shown in the picker row and in the widget's own header once added. */
  icon?: IconDefinition;
  /** Renders the widget's body once it has been added to the manager. */
  render: () => ReactNode;
}

export type WidgetManagerPickerSurface = 'modal' | 'bottomSheet' | 'drawer';

export interface WidgetManagerProps {
  /** Full catalog of widgets available to add. */
  catalog: WidgetDefinition[];
  /** Controlled list of added widget ids, in display order. */
  value: string[];
  /** Called with the new id list when the user confirms the picker. */
  onChange: (value: string[]) => void;
  /** Header title. */
  title: string;
  /** Icon shown at the leading edge of the header. */
  icon?: IconDefinition;
  /** Which overlay renders the catalog picker. Defaults to `"modal"`. */
  pickerSurface?: WidgetManagerPickerSurface;
  /** Label for the dashed "add widget" trigger. Defaults to `"Add Widget"`. */
  addTriggerLabel?: string;
  /** Message shown when there are no widgets and not in edit mode. Defaults to `"No widgets added"`. */
  emptyStateLabel?: string;
  /** Heading of the picker overlay. Defaults to `"Widgets"`. */
  pickerTitle?: string;
  /** Label for a catalog row's add action. Defaults to `"Add"`. */
  addLabel?: string;
  /** Label for a catalog row's remove action (already staged). Defaults to `"Remove"`. */
  removeLabel?: string;
  /** Label for the picker's confirm action. Defaults to `"Accept"`. */
  confirmLabel?: string;
  /** Label for the picker's cancel action. Defaults to `"Cancel"`. */
  cancelLabel?: string;
  /** Accessible name of the header's edit-mode toggle button. Defaults to `"Edit widgets"`. */
  editLabel?: string;
  className?: string;
}

/**
 * Card that manages a controlled collection of "widgets" — pick which ones
 * are visible from a catalog, each rendering its own arbitrary content.
 *
 * The header's edit button toggles a local `editing` state: in view mode
 * only the added widgets (or an empty-state message) are shown; in edit
 * mode a dashed "add widget" trigger also appears, opening a catalog picker
 * (`pickerSurface`: `Modal`, `BottomSheet`, or `Drawer`). Adding/removing is
 * staged inside the picker and only applied — via `onChange` — when the
 * user confirms; canceling or dismissing the picker discards the staging.
 *
 * Widgets can only be removed through the picker, never inline in the card.
 */
export const WidgetManager = ({
  catalog,
  value,
  onChange,
  title,
  icon,
  pickerSurface = 'modal',
  addTriggerLabel = 'Add Widget',
  emptyStateLabel = 'No widgets added',
  pickerTitle = 'Widgets',
  addLabel = 'Add',
  removeLabel = 'Remove',
  confirmLabel = 'Accept',
  cancelLabel = 'Cancel',
  editLabel = 'Edit widgets',
  className,
}: WidgetManagerProps) => {
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [stagedIds, setStagedIds] = useState<string[]>(value);

  const openPicker = () => {
    setStagedIds(value);
    setPickerOpen(true);
  };

  const toggleStaged = (id: string) => {
    setStagedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirm = () => {
    onChange(stagedIds);
    setPickerOpen(false);
  };

  const cancel = () => {
    setPickerOpen(false);
  };

  const addedWidgets = value
    .map((id) => catalog.find((widget) => widget.id === id))
    .filter((widget): widget is WidgetDefinition => widget !== undefined);

  const hasWidgets = addedWidgets.length > 0;
  const showEmptyState = !editing && !hasWidgets;

  const catalogList = (
    <BoxedList>
      {catalog.map((widget) => {
        const staged = stagedIds.includes(widget.id);

        return (
          <ActionRow
            key={widget.id}
            leading={widget.icon && <Icon icon={widget.icon} />}
            title={widget.label}
            subtitle={widget.description}
            trailing={
              <Button
                type="button"
                variant={staged ? 'default' : 'suggested'}
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleStaged(widget.id);
                }}
              >
                {staged ? removeLabel : addLabel}
              </Button>
            }
          />
        );
      })}
    </BoxedList>
  );

  const pickerFooter = (
    <div className={styles.footer}>
      <Button type="button" variant="flat" onClick={cancel}>
        {cancelLabel}
      </Button>
      <Button type="button" variant="suggested" onClick={confirm}>
        {confirmLabel}
      </Button>
    </div>
  );

  return (
    <div className={[styles.manager, className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          {icon && (
            <span className={styles.badge} aria-hidden="true">
              <Icon icon={icon} />
            </span>
          )}
          <span className={styles.title}>{title}</span>
        </div>
        <IconButton
          icon={DocumentEdit}
          label={editLabel}
          variant="flat"
          size="sm"
          aria-pressed={editing}
          onClick={() => setEditing((prev) => !prev)}
        />
      </div>

      <div className={styles.body}>
        {showEmptyState && <StatusPage compact title={emptyStateLabel} />}

        {hasWidgets && (
          <div className={styles.widgetList}>
            {addedWidgets.map((widget) => (
              <div key={widget.id} className={styles.widget}>
                <div className={styles.widgetHeader}>
                  {widget.icon && (
                    <span className={styles.badge} aria-hidden="true">
                      <Icon icon={widget.icon} />
                    </span>
                  )}
                  <span className={styles.widgetTitle}>{widget.label}</span>
                </div>
                <div className={styles.widgetContent}>{widget.render()}</div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <button type="button" className={styles.addTrigger} onClick={openPicker}>
            {addTriggerLabel}
          </button>
        )}
      </div>

      {pickerSurface === 'modal' && (
        <Modal
          open={pickerOpen}
          title={pickerTitle}
          onClose={cancel}
          secondaryActions={[{ label: cancelLabel, onClick: cancel }]}
          primaryAction={{ label: confirmLabel, onClick: confirm }}
        >
          {catalogList}
        </Modal>
      )}

      {pickerSurface === 'bottomSheet' && (
        <BottomSheet open={pickerOpen} title={pickerTitle} onClose={cancel}>
          {catalogList}
          {pickerFooter}
        </BottomSheet>
      )}

      {pickerSurface === 'drawer' && (
        <Drawer open={pickerOpen} title={pickerTitle} onClose={cancel}>
          {catalogList}
          {pickerFooter}
        </Drawer>
      )}
    </div>
  );
};
