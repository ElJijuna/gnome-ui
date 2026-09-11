import { PanDown, Search } from '@gnome-ui/icons';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Animated, Dimensions, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import type { MultiSelectDropdownOption } from '@/components/MultiSelectDropdown';
import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export interface FilterableMultiSelectDropdownProps<V extends string = string> {
  /** The list of selectable options. */
  options: MultiSelectDropdownOption<V>[];
  /** The currently selected values. */
  value: V[];
  /** Called with the full updated selection whenever an option is toggled. */
  onChange: (value: V[]) => void;
  /** Placeholder shown on the trigger when no option is selected. */
  placeholder?: string;
  /** Placeholder for the filter field shown once the list is open. */
  filterPlaceholder?: string;
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
const MAX_PANEL_HEIGHT = 320;

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

function filterOptions<V extends string>(
  options: MultiSelectDropdownOption<V>[],
  query: string,
): MultiSelectDropdownOption<V>[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return options;
  }

  return options.filter(
    (o) =>
      o.label.toLowerCase().includes(normalized) ||
      o.description?.toLowerCase().includes(normalized),
  );
}

/**
 * `MultiSelectDropdown` plus a filter field for narrowing long option
 * lists, mirroring `@gnome-ui/react`'s `FilterableMultiSelectDropdown`.
 *
 * Same overall shape and positioning recipe as `MultiSelectDropdown` —
 * duplicated rather than composed, matching how the web source itself
 * relates to `MultiSelectDropdown` (a parallel implementation sharing only
 * the `MultiSelectDropdownOption` type, not a wrapper around it) — with a
 * filter `TextInput` pinned above the list, auto-focused on open via
 * `autoFocus`. Typing narrows `options` to those whose label or
 * description contains the query (case-insensitive); filtering only
 * affects what's shown, never the underlying selection — values selected
 * before a query hides their option stay selected. An empty filtered
 * result renders a centered "No results" message instead of the list.
 *
 * The web version's filter-field keyboard handler (↑/↓ roving highlight,
 * Home/End, Enter-to-toggle) has no RN port — same "RN's touch-first model
 * has no keyboard focus to drive it" reasoning `Dropdown`/`TabBar` already
 * established; RN's own `TextInput` still handles the actual typing (and
 * its software keyboard) natively, only the roving-highlight navigation on
 * top of it is dropped. Selection is by direct tap only, same as
 * `MultiSelectDropdown`.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/drop-down-lists.html
 */
export const FilterableMultiSelectDropdown = <V extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  filterPlaceholder = 'Filter options…',
  accessibilityLabel,
  disabled,
  style,
  testID,
}: FilterableMultiSelectDropdownProps<V>) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [triggerRect, setTriggerRect] = useState<Rect | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  const triggerRef = useRef<View>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const selectedOptions = options.filter((o) => value.includes(o.value));
  const filteredOptions = filterOptions(options, query);

  const openList = () => {
    if (disabled) {
      return;
    }

    setQuery('');
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
    setPanelHeight(Math.min(e.nativeEvent.layout.height, MAX_PANEL_HEIGHT));
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
            style={[
              {
                position: 'absolute',
                maxHeight: MAX_PANEL_HEIGHT,
                backgroundColor: theme.popoverBgColor,
                borderWidth: 1,
                borderColor: theme.cardShadeColor,
                borderRadius: theme.radiusMd,
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardShadeColor,
              }}
            >
              <View style={{ position: 'absolute', left: 16, zIndex: 1 }}>
                <Icon
                  icon={Search}
                  size="sm"
                  color="default"
                  style={{ opacity: theme.opacityDim }}
                />
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={filterPlaceholder}
                placeholderTextColor={theme.windowFgColor}
                accessibilityLabel={filterPlaceholder}
                autoFocus
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  paddingLeft: 28,
                  fontFamily: theme.fontFamily,
                  fontSize: theme.fontSizeBody,
                  color: theme.viewFgColor,
                  backgroundColor: theme.viewBgColor,
                  borderWidth: 1,
                  borderColor: theme.cardShadeColor,
                  borderRadius: theme.radiusMd,
                }}
              />
            </View>

            {filteredOptions.length === 0 ? (
              <Text
                style={{
                  marginVertical: 16,
                  textAlign: 'center',
                  color: theme.windowFgColor,
                  opacity: theme.opacityDim,
                }}
              >
                No results
              </Text>
            ) : (
              <ScrollView role="list" accessible bounces={false} style={{ paddingVertical: 4 }}>
                {filteredOptions.map((opt) => {
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
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};
