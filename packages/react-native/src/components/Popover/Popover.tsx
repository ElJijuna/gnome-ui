import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Animated, BackHandler, Dimensions, Modal, Pressable, View } from 'react-native';

import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  /**
   * The rich content rendered inside the popover panel.
   * Can include interactive elements (buttons, links, forms).
   */
  content: ReactNode;
  /**
   * Preferred placement relative to the trigger.
   * Flips automatically when there is not enough viewport space.
   * Defaults to `"bottom"`.
   */
  placement?: PopoverPlacement;
  /**
   * Whether the popover is open (controlled mode).
   * Omit to use uncontrolled mode where the trigger toggles it.
   */
  open?: boolean;
  /** Called when open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Extra style on the popover panel itself. */
  panelStyle?: StyleProp<ViewStyle>;
  /**
   * The trigger element. Must be a single element built on `Pressable`
   * (e.g. `Button`, `Card`) that forwards its `ref` to the underlying `View`.
   */
  children: ReactElement<PressableProps & { ref?: Ref<View> }>;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

interface Position {
  top: number;
  left: number;
  placement: PopoverPlacement;
}

const GAP = 8;
const MARGIN = 10;
const ARROW = 6;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);

    return;
  }

  (ref as { current: T | null }).current = value;
}

function placementRect(trigger: Rect, panel: Size, placement: PopoverPlacement) {
  switch (placement) {
    case 'top':
      return {
        top: trigger.y - panel.height - GAP,
        left: trigger.x + trigger.width / 2 - panel.width / 2,
      };
    case 'bottom':
      return {
        top: trigger.y + trigger.height + GAP,
        left: trigger.x + trigger.width / 2 - panel.width / 2,
      };
    case 'left':
      return {
        top: trigger.y + trigger.height / 2 - panel.height / 2,
        left: trigger.x - panel.width - GAP,
      };
    case 'right':
      return {
        top: trigger.y + trigger.height / 2 - panel.height / 2,
        left: trigger.x + trigger.width + GAP,
      };
  }
}

function computePosition(trigger: Rect, panel: Size, preferred: PopoverPlacement): Position {
  const { width: vw, height: vh } = Dimensions.get('window');

  const opposite: PopoverPlacement =
    preferred === 'top'
      ? 'bottom'
      : preferred === 'bottom'
        ? 'top'
        : preferred === 'left'
          ? 'right'
          : 'left';
  const placements: PopoverPlacement[] = [preferred, opposite, 'bottom', 'top', 'left', 'right'];

  for (const p of placements) {
    const { top, left } = placementRect(trigger, panel, p);
    const fitsH = left >= MARGIN && left + panel.width <= vw - MARGIN;
    const fitsV = top >= MARGIN && top + panel.height <= vh - MARGIN;

    if (fitsH && fitsV) {
      return {
        top: Math.max(MARGIN, Math.min(top, vh - panel.height - MARGIN)),
        left: Math.max(MARGIN, Math.min(left, vw - panel.width - MARGIN)),
        placement: p,
      };
    }
  }

  const { top, left } = placementRect(trigger, panel, preferred);

  return {
    top: Math.max(MARGIN, Math.min(top, vh - panel.height - MARGIN)),
    left: Math.max(MARGIN, Math.min(left, vw - panel.width - MARGIN)),
    placement: preferred,
  };
}

/**
 * Floating panel anchored to a trigger element, following the Adwaita
 * `GtkPopover` pattern. Unlike `Tooltip`, a popover can contain rich
 * interactive content (buttons, links, forms).
 *
 * Rebuilt with `View`/`Pressable`/`Modal` rather than ported from
 * `@gnome-ui/react`'s DOM `Portal` + manual focus trap, reusing this
 * package's own established pieces rather than re-deriving them: `Tooltip`'s
 * `cloneElement`-onto-an-arbitrary-trigger architecture and 4-placement
 * fallback-cascade positioning (`computePosition`, same shape, no arrow-
 * offset-shift-when-clamped complexity — same simplification `Tooltip`
 * already accepted), and `Dropdown`'s toggle-on-press + full-screen backdrop
 * `Pressable` that closes on an outside tap (the RN analog of the web
 * version's document-level "click outside" listener) plus reduced-motion
 * fade-in.
 *
 * **Deliberate divergence from `Dropdown`'s backdrop structure**: `Dropdown`
 * nests its panel directly inside the backdrop `Pressable` and gets away
 * with it because almost every pixel of its panel is itself a `Pressable`
 * option row, which claims the touch responder before it can bubble to the
 * backdrop. A popover's `content` is arbitrary — likely to have inert
 * padding/whitespace/text with no `Pressable` of its own — so nesting the
 * same way would let a tap on inert panel space fall through to the
 * backdrop and close the popover, unlike the web version's `.contains()`
 * check (which never closes on *any* tap inside the panel). Fixed with
 * `onStartShouldSetResponder={() => true}` on the panel itself: it claims
 * the touch responder for any touch RN's negotiation hasn't already given to
 * a deeper `Pressable` inside `content`, without making the panel itself
 * behave like a button.
 *
 * `BackHandler`'s `hardwareBackPress` (wired the same way `Dialog` already
 * does) is the Android analog of the web version's document-level Escape
 * listener — there is no keyboard `Escape` to catch on a touch-first device.
 * Focus-trapping and focus-restore-on-close have no port: there is no DOM
 * `document.activeElement`/`querySelector` equivalent in RN, the same gap
 * that already left every other floating component in this package (
 * `Dialog`, `Tooltip`, `Dropdown`) without them.
 *
 * The web version's rotated-square-with-matching-background arrow (relying
 * on same-color blending across a straddled panel edge and CSS stacking
 * order) is replaced with `Tooltip`'s simpler transparent-border-triangle
 * technique — same visual affordance (a pointer toward the trigger), a much
 * simpler RN-native primitive.
 *
 * `role="dialog"` on the panel ports 1:1 from RN's newer web-aligned `Role`
 * union (the same one `Dialog`/`Tooltip` already use) — no substitution
 * needed. `aria-haspopup`/`aria-controls` have no RN equivalent (no
 * cross-platform relationship-attribute prop); only `accessibilityState.
 * expanded` is wired on the trigger, the same subset `Dropdown`'s own
 * trigger already exposes.
 *
 * @example
 * <Popover content={<Text>Rich content here</Text>}>
 *   <Button>Open</Button>
 * </Popover>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Popover.html
 */
export const Popover = ({
  content,
  placement: preferredPlacement = 'bottom',
  open: controlledOpen,
  onOpenChange,
  panelStyle,
  children,
}: PopoverProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const [triggerRect, setTriggerRect] = useState<Rect | null>(null);
  const [panelSize, setPanelSize] = useState<Size | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  const triggerRef = useRef<View>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }

      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  // Measure the trigger's on-screen rect as soon as it's asked to show.
  useEffect(() => {
    if (!open) {
      setTriggerRect(null);
      setPanelSize(null);
      setPos(null);

      return;
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerRect({ x, y, width, height });
    });
  }, [open]);

  // Resolve the final position once both the trigger's rect and the panel's
  // own rendered size are known.
  useEffect(() => {
    if (!triggerRect || !panelSize) {
      return;
    }

    setPos(computePosition(triggerRect, panelSize, preferredPlacement));
  }, [triggerRect, panelSize, preferredPlacement]);

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

  // Android hardware back button closes the popover — the analog of the web
  // version's document-level Escape listener, same pattern `Dialog` uses.
  useEffect(() => {
    if (!open) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close();

      return true;
    });

    return () => subscription.remove();
  }, [open, close]);

  const handlePanelLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;

    setPanelSize({ width, height });
  };

  const arrowBase = {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderWidth: ARROW,
    borderColor: 'transparent',
  };

  const arrowStyle = (() => {
    switch (pos?.placement) {
      case 'top':
        return {
          ...arrowBase,
          top: '100%' as const,
          left: '50%' as const,
          marginLeft: -ARROW,
          borderTopColor: theme.popoverBgColor,
        };
      case 'bottom':
        return {
          ...arrowBase,
          bottom: '100%' as const,
          left: '50%' as const,
          marginLeft: -ARROW,
          borderBottomColor: theme.popoverBgColor,
        };
      case 'left':
        return {
          ...arrowBase,
          left: '100%' as const,
          top: '50%' as const,
          marginTop: -ARROW,
          borderLeftColor: theme.popoverBgColor,
        };
      case 'right':
        return {
          ...arrowBase,
          right: '100%' as const,
          top: '50%' as const,
          marginTop: -ARROW,
          borderRightColor: theme.popoverBgColor,
        };
      default:
        return null;
    }
  })();

  const existingRef = (children.props as { ref?: Ref<View> }).ref;

  const trigger = cloneElement(children, {
    ref: (node: View | null) => {
      (triggerRef as { current: View | null }).current = node;
      assignRef(existingRef, node);
    },
    accessibilityState: { expanded: open, ...children.props.accessibilityState },
    onPress: (e: GestureResponderEvent) => {
      toggle();
      children.props.onPress?.(e);
    },
  });

  return (
    <>
      {trigger}
      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable onPress={close} accessible={false} style={{ flex: 1 }}>
          <Animated.View
            onLayout={handlePanelLayout}
            role="dialog"
            accessible
            onStartShouldSetResponder={() => true}
            style={[
              {
                position: 'absolute',
                minWidth: 180,
                maxWidth: 320,
                backgroundColor: theme.popoverBgColor,
                borderWidth: 1,
                borderColor: theme.cardShadeColor,
                borderRadius: theme.radiusLg,
                padding: theme.space2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              },
              pos
                ? { top: pos.top, left: pos.left, opacity: progress }
                : { top: -9999, left: -9999, opacity: 0 },
              panelStyle,
            ]}
          >
            {content}
            {arrowStyle && <View style={arrowStyle} />}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};
