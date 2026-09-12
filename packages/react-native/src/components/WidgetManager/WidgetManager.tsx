import type { IconDefinition } from '@gnome-ui/icons';
import { DocumentEdit } from '@gnome-ui/icons';
import { type ReactNode, useState } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { ActionRow } from '@/components/ActionRow';
import { BottomSheet } from '@/components/BottomSheet';
import { BoxedList } from '@/components/BoxedList';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { Drawer } from '@/components/Drawer';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { StatusPage } from '@/components/StatusPage';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

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

/**
 * `@gnome-ui/react`'s `pickerSurface` calls this option `"modal"`, naming it
 * after its own `Modal` component. This package's `Modal` counterpart is
 * `Dialog` (RN's own `Modal` primitive is a different, lower-level thing —
 * see the main `ROADMAP.md`'s note on that exact naming trap), so the option
 * is named after what it actually renders here instead of ported verbatim.
 */
export type WidgetManagerPickerSurface = 'dialog' | 'bottomSheet' | 'drawer';

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
  /** Which overlay renders the catalog picker. Defaults to `"dialog"`. */
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
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const semibold = (theme: { fontWeightSemibold: number }): TextStyle['fontWeight'] =>
  String(theme.fontWeightSemibold) as TextStyle['fontWeight'];

/**
 * Card that manages a controlled collection of "widgets" — pick which ones
 * are visible from a catalog, each rendering its own arbitrary content.
 * Mirrors `@gnome-ui/react`'s own `WidgetManager`.
 *
 * The header's edit button toggles a local `editing` state: in view mode
 * only the added widgets (or an empty-state message) are shown; in edit
 * mode a dashed "add widget" trigger also appears, opening a catalog picker
 * (`pickerSurface`: `"dialog"`, `"bottomSheet"`, or `"drawer"`, each backed
 * by the already-shipped `Dialog`/`BottomSheet`/`Drawer`). Adding/removing
 * is staged inside the picker and only applied — via `onChange` — when the
 * user confirms; canceling or dismissing the picker discards the staging.
 * Widgets can only be removed through the picker, never inline in the card.
 *
 * The catalog list is wrapped in its own `ScrollView` (capped at 360dp)
 * before being handed to whichever picker surface renders it — unlike the
 * web version's `overflow-y: auto` on the `Modal`/`BottomSheet`/`Drawer`
 * body, none of this package's three overlay components scroll their
 * `children` for you, so a long catalog needs that scroll container built
 * in here rather than assumed.
 *
 * `Dialog` already renders its own confirm/cancel action row from a
 * `buttons` array, so only `bottomSheet`/`drawer` need the hand-rolled
 * footer row the web version calls `pickerFooter` — the exact same split
 * the web source itself documents ("Modal uses its own actions").
 *
 * Not ported: `aria-pressed` on the edit toggle — `Button`/`IconButton` set
 * their own internal `accessibilityState={{ disabled }}` on the underlying
 * `Pressable`, and RN merges a spread prop object outright rather than
 * key-by-key, so passing a second `accessibilityState` here would silently
 * replace rather than merge with it (the same `Popover`-trigger clobber
 * `SplitButton` already worked around) — dropped rather than routed around
 * for one decorative toggle-state announcement.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.WidgetManager.html
 */
export const WidgetManager = ({
  catalog,
  value,
  onChange,
  title,
  icon,
  pickerSurface = 'dialog',
  addTriggerLabel = 'Add Widget',
  emptyStateLabel = 'No widgets added',
  pickerTitle = 'Widgets',
  addLabel = 'Add',
  removeLabel = 'Remove',
  confirmLabel = 'Accept',
  cancelLabel = 'Cancel',
  editLabel = 'Edit widgets',
  style,
  testID,
}: WidgetManagerProps) => {
  const theme = useGnomeTheme();
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

  const cancel = () => setPickerOpen(false);

  const addedWidgets = value
    .map((id) => catalog.find((widget) => widget.id === id))
    .filter((widget): widget is WidgetDefinition => widget !== undefined);

  const hasWidgets = addedWidgets.length > 0;
  const showEmptyState = !editing && !hasWidgets;

  const badge = (widgetIcon: IconDefinition, background: string) => (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        backgroundColor: background,
      }}
    >
      <Icon icon={widgetIcon} />
    </View>
  );

  const catalogList = (
    <ScrollView style={{ maxHeight: 360 }}>
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
                  variant={staged ? 'default' : 'suggested'}
                  size="sm"
                  onPress={() => toggleStaged(widget.id)}
                >
                  {staged ? removeLabel : addLabel}
                </Button>
              }
            />
          );
        })}
      </BoxedList>
    </ScrollView>
  );

  const pickerFooter = (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.space2,
        paddingTop: theme.space2,
      }}
    >
      <Button variant="flat" onPress={cancel}>
        {cancelLabel}
      </Button>
      <Button variant="suggested" onPress={confirm}>
        {confirmLabel}
      </Button>
    </View>
  );

  return (
    <View
      testID={testID}
      style={[
        {
          gap: theme.space3,
          padding: theme.space4,
          backgroundColor: theme.cardBgColor,
          borderWidth: 1,
          borderColor: theme.cardShadeColor,
          borderRadius: theme.radiusLg,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space2 }}>
        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space2,
          }}
        >
          {icon && badge(icon, theme.viewBgColor)}
          <Text variant="body" numberOfLines={1} style={{ fontWeight: semibold(theme) }}>
            {title}
          </Text>
        </View>

        <IconButton
          icon={DocumentEdit}
          label={editLabel}
          variant="flat"
          size="sm"
          onPress={() => setEditing((prev) => !prev)}
        />
      </View>

      <View style={{ gap: theme.space3 }}>
        {showEmptyState && <StatusPage compact title={emptyStateLabel} />}

        {hasWidgets && (
          <View style={{ gap: theme.space3 }}>
            {addedWidgets.map((widget) => (
              <View
                key={widget.id}
                style={{
                  gap: theme.space2,
                  padding: theme.space3,
                  backgroundColor: theme.viewBgColor,
                  borderRadius: theme.radiusMd,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space2 }}>
                  {widget.icon && badge(widget.icon, theme.cardBgColor)}
                  <Text variant="body" style={{ fontWeight: semibold(theme) }}>
                    {widget.label}
                  </Text>
                </View>
                <View style={{ minWidth: 0 }}>{widget.render()}</View>
              </View>
            ))}
          </View>
        )}

        {editing && (
          <Pressable
            accessibilityRole="button"
            onPress={openPicker}
            style={({ pressed }) => ({
              width: '100%',
              paddingVertical: theme.space4,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: pressed ? theme.accentColor : theme.cardShadeColor,
              borderRadius: theme.radiusLg,
              opacity: pressed ? 1 : theme.opacityDim,
            })}
          >
            <Text variant="body" style={{ fontWeight: semibold(theme) }}>
              {addTriggerLabel}
            </Text>
          </Pressable>
        )}
      </View>

      {pickerSurface === 'dialog' && (
        <Dialog
          open={pickerOpen}
          title={pickerTitle}
          onClose={cancel}
          buttons={[
            { label: cancelLabel, onPress: cancel },
            { label: confirmLabel, variant: 'suggested', onPress: confirm },
          ]}
        >
          {catalogList}
        </Dialog>
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
    </View>
  );
};
