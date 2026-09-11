import { PanDown } from '@gnome-ui/icons';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Animated, Dimensions, Modal, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export interface MultiSelectDropdownOption<V extends string = string> {
  /** The value included in `value` when this option is selected. */
  value: V;
  /** Display label shown in the list and (when only one is selected) the trigger. */
  label: string;
  /** Optional descriptive text shown below the label. */
  description?: string;
  /** Whether the option is selectable. */
  disabled?: boolean;
}

export interface MultiSelectDropdownProps<V extends string = string> {
  /** The list of selectable options. */
  options: MultiSelectDropdownOption<V>[];
  /** The currently selected values. */
  value: V[];
  /** Called with the full updated selection whenever an option is toggled. */
  onChange: (value: V[]) => void;
  /** Placeholder shown on the trigger when no option is selected. */
  placeholder?: string;
  /** Accessible label for the control. */
  accessibilityLabel?: string;
  /** Disables the entire control. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Position {
  top: number;
  left: number;
  width: number;
  flipUp: boolean;
}

const GAP = 4;
const MARGIN = 8;
const MAX_LIST_HEIGHT = 280;

function computePosition(trigger: Rect, panelHeight: number): Position {
  const { height: vh } = Dimensions.get('window');
  const spaceBelow = vh - (trigger.y + trigger.height);
  const flipUp = spaceBelow < panelHeight && trigger.y > panelHeight;
  const top = flipUp ? trigger.y - panelHeight - GAP : trigger.y + trigger.height + GAP;

  return {
    top: Math.max(MARGIN, Math.min(top, vh - panelHeight - MARGIN)),
    left: trigger.x,
    width: trigger.width,
    flipUp,
  };
}

function summarize(count: number, selected: { label: string }[]): string {
  if (count === 1) {
    return selected[0].label;
  }

  return `${count} selected`;
}

/**
 * Checkbox-list variant of `Dropdown` for selecting multiple values from a
 * single trigger, mirroring `@gnome-ui/react`'s `MultiSelectDropdown`.
 *
 * `Dropdown`/`ComboRow` are single-select only — use `MultiSelectDropdown`
 * when more than one value can be chosen at once. Toggling an option keeps
 * the panel open so the user can pick several in a row (unlike `Dropdown`,
 * whose `selectOption` closes the panel); close it via the backdrop tap.
 *
 * The `Modal` + backdrop + independently-measured-then-combined
 * trigger-rect/panel-height positioning (`Rect`/`Position`/
 * `computePosition`/`GAP`/`MARGIN`/`MAX_LIST_HEIGHT`) is duplicated
 * verbatim from `Dropdown` rather than extracted to a shared hook — same
 * "genuinely different, not save-able" judgment call already applied to
 * `Tooltip`/`Dropdown`'s own position-code duplication, though this is now
 * the third near-identical copy of the up/down-flip-clamp-to-width shape
 * specifically (not `Tooltip`'s 4-directional cascade) — worth extracting
 * into a shared hook in a future pass if a fourth caller needs it, since
 * unlike `Tooltip` these two are not just similarly-shaped but identical.
 *
 * Each option row gets a leading checkbox-square visual (border/background
 * only, no animation — `Dropdown`'s own per-option content has none
 * either) instead of `Dropdown`'s single trailing checkmark-when-selected,
 * since more than one row can be checked at once.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/drop-down-lists.html
 */
export const MultiSelectDropdown = <V extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  accessibilityLabel,
  disabled,
  style,
  testID,
}: MultiSelectDropdownProps<V>) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<Rect | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  const triggerRef = useRef<View>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const selectedOptions = options.filter((o) => value.includes(o.value));

  const openList = () => {
    if (disabled) {
      return;
    }

    setOpen(true);
  };

  const closeList = () => setOpen(false);

  const toggleOption = (opt: MultiSelectDropdownOption<V>) => {
    if (opt.disabled) {
      return;
    }

    onChange(
      value.includes(opt.value) ? value.filter((v) => v !== opt.value) : [...value, opt.value],
    );
  };

  useEffect(() => {
    if (!open) {
      setTriggerRect(null);
      setPanelHeight(null);
      setPos(null);

      return;
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerRect({ x, y, width, height });
    });
  }, [open]);

  useEffect(() => {
    if (triggerRect === null || panelHeight === null) {
      return;
    }

    setPos(computePosition(triggerRect, panelHeight));
  }, [triggerRect, panelHeight]);

  useEffect(() => {
    if (!pos) {
      return;
    }

    if (reducedMotion) {
      progress.setValue(1);

      return;
    }

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: theme.durationFast,
      useNativeDriver: true,
    }).start();
  }, [pos, reducedMotion, progress, theme.durationFast]);

  const handlePanelLayout = (e: LayoutChangeEvent) => {
    setPanelHeight(Math.min(e.nativeEvent.layout.height, MAX_LIST_HEIGHT));
  };

  return (
    <View style={style}>
      <Pressable
        ref={triggerRef}
        testID={testID}
        role="combobox"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        disabled={disabled}
        onPress={() => (open ? closeList() : openList())}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.space1,
          minHeight: 36,
          minWidth: 160,
          paddingVertical: 7,
          paddingHorizontal: theme.space2,
          backgroundColor: pressed ? theme.activeOverlay : theme.cardBgColor,
          borderWidth: 1,
          borderColor: open ? theme.accentColor : theme.cardShadeColor,
          borderRadius: theme.radiusMd,
          opacity: disabled ? theme.opacityDisabled : 1,
        })}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: theme.fontSizeBody,
            color: theme.windowFgColor,
            opacity: selectedOptions.length === 0 ? theme.opacityDim : 1,
          }}
        >
          {selectedOptions.length === 0
            ? placeholder
            : summarize(selectedOptions.length, selectedOptions)}
        </Text>
        <Icon
          icon={PanDown}
          size="md"
          color="default"
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="none" statusBarTranslucent>
        <Pressable
          onPress={closeList}
          accessible={false}
          style={{ flex: 1 }}
          testID={testID ? `${testID}-backdrop` : undefined}
        >
          <Animated.View
            onLayout={handlePanelLayout}
            role="list"
            accessible
            style={[
              {
                position: 'absolute',
                maxHeight: MAX_LIST_HEIGHT,
                backgroundColor: theme.popoverBgColor,
                borderWidth: 1,
                borderColor: theme.cardShadeColor,
                borderRadius: theme.radiusMd,
                paddingVertical: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              },
              pos
                ? { top: pos.top, left: pos.left, width: pos.width, opacity: progress }
                : { top: -9999, left: -9999, width: 200, opacity: 0 },
            ]}
          >
            <ScrollView bounces={false}>
              {options.map((opt) => {
                const checked = value.includes(opt.value);

                return (
                  <Pressable
                    key={opt.value}
                    role="option"
                    accessibilityState={{ selected: checked, disabled: !!opt.disabled }}
                    disabled={opt.disabled}
                    onPress={() => toggleOption(opt)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.space2,
                      minHeight: 40,
                      paddingVertical: 8,
                      paddingHorizontal: theme.space2,
                      backgroundColor: pressed ? theme.activeOverlay : 'transparent',
                      opacity: opt.disabled ? theme.opacityDisabled : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: theme.radiusSm,
                        borderWidth: 1.5,
                        borderColor: checked ? theme.accentBgColor : theme.cardShadeColor,
                        backgroundColor: checked ? theme.accentBgColor : 'transparent',
                      }}
                    >
                      {checked && (
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 'bold',
                            lineHeight: 11,
                          }}
                        >
                          {'✓'}
                        </Text>
                      )}
                    </View>

                    <View style={{ flex: 1, gap: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: theme.fontSizeBody,
                          color: theme.windowFgColor,
                          fontWeight: checked
                            ? (String(theme.fontWeightSemibold) as TextStyle['fontWeight'])
                            : undefined,
                        }}
                      >
                        {opt.label}
                      </Text>
                      {opt.description && (
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: theme.fontSizeCaption,
                            color: theme.windowFgColor,
                            opacity: theme.opacityDim,
                          }}
                        >
                          {opt.description}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};
