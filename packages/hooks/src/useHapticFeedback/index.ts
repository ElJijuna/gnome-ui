import { useMemo } from "react";
import { isWebKitBridge, postMessage } from "@gnome-ui/platform";

/**
 * GNOME haptic event name following the
 * [GNOME Event Naming Specification](https://honk.sigxcpu.org/projects/feedbackd/doc/Event-naming-spec-0.0.0.html).
 * Third-party / app-specific events must use the `x-` prefix (e.g. `"x-myapp-success"`).
 */
export type GnomeHapticEvent =
  | "button-pressed"
  | "button-released"
  | "window-close"
  | "message-new-instant"
  | "message-new-sms"
  | "phone-incoming-call"
  | "alarm-clock-elapsed"
  | "battery-low"
  | (string & {});

export interface UseHapticFeedbackResult {
  trigger: (event: GnomeHapticEvent) => void;
  /** True if any haptic mechanism is available. */
  isSupported: boolean;
  /** True when running inside a WebKitGTK WebView (feedbackd via bridge). */
  isNativeSupported: boolean;
  /** True when navigator.vibrate is available (browser/PWA fallback). */
  isVibrationApiSupported: boolean;
}

const VIBRATION_PATTERNS: Record<string, number[]> = {
  "button-pressed": [10],
  "button-released": [5],
  "window-close": [50],
  "message-new-instant": [50, 50, 50],
  "message-new-sms": [50, 50, 50],
  "phone-incoming-call": [200, 100, 200],
  "alarm-clock-elapsed": [300, 100, 300],
  "battery-low": [100, 50, 100],
};

const VIBRATION_FALLBACK = [30];

/**
 * Triggers haptic feedback using the platform's best available mechanism.
 *
 * Resolution order:
 *  1. **WebKitGTK WebView** — forwards the event name to the GJS host via the
 *     `hapticFeedback` bridge channel; the host calls `lfb_event_trigger_feedback()`
 *     through feedbackd over DBus.
 *  2. **Browser / PWA** — maps the event name to a `navigator.vibrate()` pattern.
 *  3. **No support** — `trigger` is a no-op; `isSupported` will be `false`.
 *
 * @example
 * const { trigger, isSupported } = useHapticFeedback();
 *
 * function onButtonPress() {
 *   trigger("button-pressed");
 * }
 *
 * @example
 * // Custom app event (x- prefix required)
 * trigger("x-myapp-task-complete");
 */
export function useHapticFeedback(): UseHapticFeedbackResult {
  return useMemo(() => {
    const isNativeSupported = isWebKitBridge();
    const isVibrationApiSupported =
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function";
    const isSupported = isNativeSupported || isVibrationApiSupported;

    function trigger(event: GnomeHapticEvent): void {
      if (isNativeSupported) {
        postMessage("hapticFeedback", { event });
      } else if (isVibrationApiSupported) {
        const pattern = VIBRATION_PATTERNS[event] ?? VIBRATION_FALLBACK;
        navigator.vibrate(pattern);
      }
    }

    return { trigger, isSupported, isNativeSupported, isVibrationApiSupported };
  }, []);
}
