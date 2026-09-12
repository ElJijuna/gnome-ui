import { useRef, useState } from 'react';
import type {
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  TextInputKeyPressEventData,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Pressable, TextInput as RNTextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { WrapBox } from '@/components/WrapBox';
import { useGnomeTheme, useResolvedContrast } from '@/GnomeProvider';

export interface TagInputProps {
  /** Current list of tags. */
  value: string[];
  /** Called when a tag is added or removed. */
  onChange: (value: string[]) => void;
  /** Visible label rendered above the input. */
  label?: string;
  /** Placeholder shown in the draft input while empty. */
  placeholder?: string;
  /** Helper text rendered below the input. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message rendered below the input in place of `helperText`.
   * Also applies the error visual state to the border.
   */
  error?: string;
  /** Maximum number of tags allowed. Once reached, the draft input is hidden. */
  maxTags?: number;
  /** Reject a new tag that already exists (case-insensitive). Defaults to `true`. */
  preventDuplicates?: boolean;
  /** Disables the whole control. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Duplicated from `TextField.tsx` — see that component for the full reasoning. */
function dimColor(color: string, factor: number): string {
  const match = color.match(/^rgba?\(([^,]+),([^,]+),([^,]+),?([^)]+)?\)$/);

  if (!match) {
    return color;
  }

  const [, r, g, b, a] = match;
  const alpha = (a ? Number.parseFloat(a) : 1) * factor;

  return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${alpha})`;
}

/**
 * Type-to-add multi-value input rendering entries as removable `Chip`s in a
 * `WrapBox`, mirroring `@gnome-ui/react`'s own `TagInput`.
 *
 * `WrapBox`/`Chip` alone only support static, pre-populated display —
 * `TagInput` adds interactive entry: type and press Return, or type a `,`,
 * to commit a tag; paste a comma/newline-separated list to add several at
 * once; Backspace on an empty draft removes the last one.
 *
 * The web version wires typed-`,` and pasted-list handling as two separate
 * handlers (`onKeyDown`'s `,` case, `onPaste`). RN's `TextInput` has no
 * `paste` event to mirror — but a paste still flows through `onChangeText`
 * with the full resulting text, exactly like a typed `,` does, so both
 * collapse into one `handleChangeText`: whenever the text contains a `,` or
 * newline, split on it and commit every non-empty part (typing "foo,"
 * commits "foo" via the same path a paste of "foo,bar" commits both).
 * Return is handled separately via `onSubmitEditing`, since RN has no
 * `Enter` keystroke to catch on a single-line field the way the web version
 * catches it in `onKeyDown`. Backspace-on-empty uses `onKeyPress`, the one
 * RN `TextInput` event that still fires with the field already empty
 * (`onChangeText` doesn't fire deleting from nothing).
 *
 * The tag box is a `Pressable` (mirrors the web version's
 * `onClick={() => inputRef.current?.focus()}` on the container) with
 * `accessible={false}` explicitly — `Pressable` defaults `accessible` to
 * `true`, which would collapse every `Chip`'s remove button and the draft
 * input into a single VoiceOver stop, the same container-swallows-subtree
 * trap already documented for `ToggleGroup`/`Sidebar`'s bare-`View`-plus-role
 * case, here hit via `Pressable`'s own default instead.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/text-fields.html
 */
export const TagInput = ({
  value,
  onChange,
  label,
  placeholder,
  helperText,
  error,
  maxTags,
  preventDuplicates = true,
  disabled = false,
  style,
  testID,
}: TagInputProps) => {
  const theme = useGnomeTheme();
  const contrast = useResolvedContrast();
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const atMax = maxTags !== undefined && value.length >= maxTags;
  const hint = error ?? helperText;

  const isDuplicate = (tag: string) =>
    preventDuplicates && value.some((v) => v.toLowerCase() === tag.toLowerCase());

  const commit = (raw: string) => {
    const tag = raw.trim();

    setDraft('');

    if (!tag || atMax || isDuplicate(tag)) {
      return;
    }

    onChange([...value, tag]);
  };

  const handleChangeText = (text: string) => {
    if (!text.includes(',') && !text.includes('\n')) {
      setDraft(text);

      return;
    }

    const next = [...value];

    for (const part of text.split(/[,\n]/)) {
      const tag = part.trim();

      if (!tag || (maxTags !== undefined && next.length >= maxTags)) {
        continue;
      }
      if (preventDuplicates && next.some((v) => v.toLowerCase() === tag.toLowerCase())) {
        continue;
      }
      next.push(tag);
    }

    setDraft('');
    onChange(next);
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <View
      testID={testID}
      style={[{ gap: theme.space1, opacity: disabled ? theme.opacityDisabled : 1 }, style]}
    >
      {label && (
        <Text
          variant="body"
          style={{ fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'] }}
        >
          {label}
        </Text>
      )}

      <Pressable
        accessible={false}
        disabled={disabled}
        onPress={() => inputRef.current?.focus()}
        style={{
          width: '100%',
          minHeight: 40,
          paddingVertical: 6,
          paddingHorizontal: theme.space2,
          backgroundColor: theme.viewBgColor,
          borderRadius: theme.radiusMd,
          borderWidth: contrast === 'more' ? 2 : 1,
          borderColor: error ? theme.errorColor : focused ? theme.accentColor : theme.borderSubtle,
        }}
      >
        <WrapBox childSpacing={6}>
          {value.map((tag, i) => (
            <Chip
              key={`${tag}-${i}`}
              label={tag}
              disabled={disabled}
              onRemove={disabled ? undefined : () => removeAt(i)}
            />
          ))}

          {!atMax && (
            <RNTextInput
              ref={inputRef}
              value={draft}
              editable={!disabled}
              placeholder={placeholder}
              placeholderTextColor={dimColor(theme.windowFgColor, theme.opacityDim)}
              accessibilityLabel={label}
              accessibilityHint={hint}
              onChangeText={handleChangeText}
              onSubmitEditing={() => commit(draft)}
              onKeyPress={handleKeyPress}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                flexGrow: 1,
                minWidth: 80,
                paddingVertical: 2,
                paddingHorizontal: 4,
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSizeBody,
                color: theme.viewFgColor,
              }}
            />
          )}
        </WrapBox>
      </Pressable>

      {hint && (
        <Text
          variant="caption"
          style={{
            color: error ? theme.errorColor : theme.windowFgColor,
            opacity: error ? 1 : theme.opacityDim,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
};
