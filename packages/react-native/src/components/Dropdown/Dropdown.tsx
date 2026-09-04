import { Check, PanDown } from '@gnome-ui/icons';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Animated, Dimensions, Modal, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export interface DropdownOption<V extends string = string> {
  /** The value submitted / returned on selection. */
  value: V;
  /** Display label shown in the list and trigger. */
  label: string;
  /** Optional descriptive text shown below the label. */
  description?: string;
  /** Whether the option is selectable. */
  disabled?: boolean;
}

export interface DropdownProps<V extends string = string> {
  /** The list of selectable options. */
  options: DropdownOption<V>[];
  /** The currently selected value. */
  value?: V;
  /** Called when the user selects an option. */
  onChange?: (value: V) => void;
  /** Placeholder shown when no option is selected. */
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

/**
 * Expandable option list following the Adwaita combo-row / drop-down
 * pattern, mirroring `@gnome-ui/react`'s `Dropdown`.
 *
 * Built on RN's own `Modal` (transparent) — the same portal-substitute
 * `Dialog`/`Tooltip` already use — with a full-screen backdrop `Pressable`
 * (not `pointerEvents="box-none"` like `Tooltip`'s: unlike a tooltip, this
 * panel is meant to catch and close on an outside tap, the RN analog of the
 * web version's document-level "click outside" listener). `open` flips
 * synchronously on trigger press; the trigger's on-screen rect
 * (`measureInWindow`) and the panel's own rendered height (`onLayout`) each
 * resolve independently into state, combined by a separate effect into the
 * final `top`/`left`/`width`/`flipUp` — the same two-independent-
 * async-measurements pattern `Tooltip` established (and for the same
 * reason: gating `open` itself on the native measurement callback would
 * make the component untestable in this package's Jest environment, where
 * `measureInWindow` never calls back).
 *
 * Keyboard navigation (↑/↓ roving highlight, Home/End, type-ahead) has no
 * port — RN's touch-first model has no keyboard focus to drive it, the
 * same reasoning that already dropped `TabBar`'s roving-tabindex arrow
 * keys. Selection is by direct tap only.
 *
 * `role="combobox"` on the trigger ports 1:1. RN's `Role` union has no
 * `"listbox"` value (unlike `"option"`, which does exist) — the panel uses
 * `role="list"` instead, the same closest-available substitution `BoxedList`
 * already established for a plain list container.
 */
export const Dropdown = <V extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  accessibilityLabel,
  disabled,
  style,
  testID,
}: DropdownProps<V>) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<Rect | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  const triggerRef = useRef<View>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const selected = options.find((o) => o.value === value);

  const openList = () => {
    if (disabled) {
      return;
    }

    setOpen(true);
  };

  const closeList = () => setOpen(false);

  const selectOption = (opt: DropdownOption<V>) => {
    if (opt.disabled) {
      return;
    }

    onChange?.(opt.value);
    closeList();
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
            opacity: selected ? 1 : theme.opacityDim,
          }}
        >
          {selected?.label ?? placeholder}
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
                const isSelected = opt.value === value;

                return (
                  <Pressable
                    key={opt.value}
                    role="option"
                    accessibilityState={{ selected: isSelected, disabled: !!opt.disabled }}
                    disabled={opt.disabled}
                    onPress={() => selectOption(opt)}
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
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: theme.fontSizeBody,
                          color: theme.windowFgColor,
                          fontWeight: isSelected
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
                    {isSelected && <Icon icon={Check} size="md" color="blue" />}
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
