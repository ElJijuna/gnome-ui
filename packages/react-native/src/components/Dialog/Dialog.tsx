import { type ReactNode, useEffect, useRef } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Animated, BackHandler, Easing, Modal, Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';

/**
 * `Animated`'s style interpolation only takes effect on `Animated.*` host
 * components — a plain `Pressable` would silently ignore the animated
 * `opacity` in its style, the same gotcha already documented on `Toast`.
 * Hoisted to module scope so it isn't recreated on every render.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type DialogButtonVariant = 'default' | 'suggested' | 'destructive';

export interface DialogButton {
  /** Button label. */
  label: string;
  /** Visual variant. Defaults to `"default"`. */
  variant?: DialogButtonVariant;
  /** Called when the button is pressed. */
  onPress: () => void;
  /** Whether the button is disabled. */
  disabled?: boolean;
}

export type AlertDialogResponseVariant = DialogButtonVariant;

export interface AlertDialogResponse {
  /**
   * Unique identifier returned via `onResponse`.
   * Use `"cancel"` by convention for the dismissive action.
   */
  id: string;
  /** Button label. */
  label: string;
  /** Visual emphasis. Defaults to `"default"`. */
  variant?: AlertDialogResponseVariant;
  /** Disables the button. */
  disabled?: boolean;
}

export interface DialogProps {
  /** Whether the dialog is visible. */
  open: boolean;

  // ── Standard dialog ────────────────────────────────────────────────────

  /** Dialog heading. */
  title?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Action buttons (standard dialog API). */
  buttons?: DialogButton[];
  /** Called on Android back button / backdrop press. */
  onClose?: () => void;
  /** Whether pressing the backdrop closes the dialog. Defaults to `true`. */
  closeOnBackdrop?: boolean;

  // ── AlertDialog extension ───────────────────────────────────────────────

  /**
   * Use `"alertdialog"` for confirmations and destructive warnings — screen
   * readers announce it immediately. Defaults to `"dialog"`.
   *
   * When using `role="alertdialog"`, prefer the `responses`/`onResponse` API
   * over `buttons`/`onPress` for semantic clarity.
   */
  role?: 'dialog' | 'alertdialog';

  /**
   * Response buttons (AlertDialog API). Alternative to `buttons` — each
   * response has a semantic `id` returned via `onResponse`. The Android back
   * button and backdrop press fire the first non-destructive response.
   */
  responses?: AlertDialogResponse[];

  /**
   * Called with the `id` of the response button pressed.
   * Required when `responses` is provided.
   */
  onResponse?: (id: string) => void;

  style?: StyleProp<ViewStyle>;
  /** Forwarded to the backdrop — useful for testing. */
  testID?: string;
}

/**
 * Blocking modal dialog following the Adwaita pattern.
 *
 * **Standard** — `title` + `children` + `buttons[]`.
 *
 * **Alert** — add `role="alertdialog"` + `responses[]` + `onResponse`.
 * Uses a semantic response id instead of per-button `onPress`. The Android
 * back button / backdrop press fire the first non-destructive response.
 * Mirrors `AdwAlertDialog`.
 *
 * Built on RN's own `Modal` rather than `@gnome-ui/react`'s DOM `Portal` +
 * manual focus trap: `Modal` already floats above everything with no portal
 * target needed, already blocks interaction with the screen behind it (no
 * `useBodyScrollLock` equivalent needed), and its `onRequestClose` fires on
 * the Android hardware back button — the direct analog of the web version's
 * document-level Escape listener. Focus-trapping (`Tab`/`Shift+Tab` cycling)
 * has no port: there is no keyboard `Tab` concept in RN's touch-first model,
 * the same reasoning that already dropped `TabBar`'s roving-tabindex arrow
 * keys.
 *
 * `role` is passed straight through as RN's own `role` prop (not
 * `accessibilityRole`) — RN's newer, web-aligned `Role` union has real
 * `"dialog"`/`"alertdialog"` values, unlike the older `AccessibilityRole`
 * enum `Toast`/`Banner` had to substitute `"alert"` into for the web's
 * `role="status"`. `accessibilityViewIsModal` (iOS) is the closest match to
 * `aria-modal="true"`, restricting VoiceOver to the dialog's subtree.
 *
 * There is no exit animation on either platform — the source CSS only
 * defines entrance keyframes, and `Modal`'s `visible={false}` unmounts
 * immediately, matching the web version returning `null` outright when
 * `!open`. Entrance is an `Animated.timing` fading + scaling + sliding the
 * card in (mirrors `@keyframes dialog-in`) alongside a plain backdrop fade
 * (`@keyframes backdrop-in`), replayed via a `useEffect` keyed on `open`
 * since — unlike `Toast`, which mounts once per instance — the same
 * `Dialog` element toggles `open` repeatedly while `Modal` itself
 * mounts/unmounts internally. `useReducedMotion()` skips straight to the
 * settled state.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Dialog.html
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.AlertDialog.html
 */
export const Dialog = ({
  open,
  title,
  children,
  buttons = [],
  onClose,
  closeOnBackdrop = true,
  role = 'dialog',
  responses,
  onResponse,
  style,
  testID,
}: DialogProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  const isAlert = !!responses;

  const dismissAlert = () => {
    const cancel = responses?.find((r) => r.variant !== 'destructive' && !r.disabled);

    if (cancel) {
      onResponse?.(cancel.id);
    }
  };

  const handleEscape = () => {
    if (isAlert) {
      dismissAlert();
    } else {
      onClose?.();
    }
  };

  const handleBackdropPress = isAlert ? dismissAlert : closeOnBackdrop ? onClose : undefined;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (reducedMotion) {
      progress.setValue(1);

      return;
    }

    progress.setValue(0);

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(progress, {
      toValue: 1,
      duration: theme.durationNormal,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: true,
    }).start();
  }, [open, reducedMotion, progress, theme.durationNormal, theme.easingDefault]);

  // Only the topmost dialog reacts to the Android back button, mirroring
  // the web version's "topmost modal only" Escape behavior for stacked
  // dialogs.
  useEffect(() => {
    if (!open) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleEscape();

      return true;
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAlert, responses, onResponse, onClose]);

  const renderButtons = () => {
    const rows = isAlert && responses ? responses : buttons;

    if (rows.length === 0) {
      return null;
    }

    return (
      <View style={{ borderTopWidth: 1, borderTopColor: theme.cardShadeColor }}>
        {rows.map((row, index) => {
          const variant = row.variant ?? 'default';
          const color = variant === 'destructive' ? theme.destructiveColor : theme.accentColor;
          const onPress = isAlert
            ? () => onResponse?.((row as AlertDialogResponse).id)
            : (row as DialogButton).onPress;

          return (
            <Pressable
              key={isAlert ? (row as AlertDialogResponse).id : row.label}
              accessibilityRole="button"
              accessibilityState={{ disabled: row.disabled }}
              disabled={row.disabled}
              onPress={onPress}
              style={({ pressed }) => ({
                paddingVertical: 14,
                paddingHorizontal: theme.space4,
                borderBottomWidth: index < rows.length - 1 ? 1 : 0,
                borderBottomColor: theme.cardShadeColor,
                backgroundColor: pressed ? theme.activeOverlay : 'transparent',
                opacity: row.disabled ? theme.opacityDisabled : 1,
              })}
            >
              <Text
                variant="body"
                style={{
                  textAlign: 'center',
                  color,
                  fontWeight:
                    variant === 'suggested'
                      ? (String(theme.fontWeightSemibold) as TextStyle['fontWeight'])
                      : undefined,
                }}
              >
                {row.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const shadow =
    scheme === 'dark'
      ? { shadowOpacity: 0.5, shadowRadius: 32, elevation: 12 }
      : { shadowOpacity: 0.25, shadowRadius: 32, elevation: 8 };

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleEscape}
    >
      <AnimatedPressable
        testID={testID}
        onPress={handleBackdropPress}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          backgroundColor: theme.dialogBackdropColor,
          opacity: progress,
        }}
      >
        <Pressable onPress={() => {}} accessible={false} style={{ width: '100%', maxWidth: 480 }}>
          <Animated.View
            accessible
            role={role}
            accessibilityViewIsModal
            style={[
              {
                backgroundColor: theme.dialogBgColor,
                borderRadius: theme.radiusXl,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                ...shadow,
                opacity: progress,
                transform: [
                  {
                    translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
                  },
                  { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                ],
              },
              style,
            ]}
          >
            {title && (
              <Text
                variant="title-4"
                style={{
                  padding: theme.space4,
                  paddingBottom: children ? 0 : theme.space4,
                  textAlign: 'center',
                  fontWeight: String(theme.fontWeightBold) as TextStyle['fontWeight'],
                }}
              >
                {title}
              </Text>
            )}

            {children && (
              <View style={{ paddingVertical: theme.space2, paddingHorizontal: theme.space4 }}>
                {typeof children === 'string' ? (
                  <Text variant="body" style={{ textAlign: 'center', opacity: theme.opacityDim }}>
                    {children}
                  </Text>
                ) : (
                  children
                )}
              </View>
            )}

            {renderButtons()}
          </Animated.View>
        </Pressable>
      </AnimatedPressable>
    </Modal>
  );
};
