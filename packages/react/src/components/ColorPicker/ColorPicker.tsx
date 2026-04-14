import {
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import styles from "./ColorPicker.module.css";

// ─── ColorSwatch ─────────────────────────────────────────────────────────────

export type ColorSwatchSize = "sm" | "md" | "lg";

export interface ColorSwatchProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "onClick" | "onSelect"> {
  /** CSS color value displayed as the swatch background. */
  color: string;
  /** Whether this swatch is the currently selected color. */
  selected?: boolean;
  /** Swatch diameter. Defaults to `"md"`. */
  size?: ColorSwatchSize;
  /** Called when the user clicks or activates the swatch. */
  onSelect?: (color: string) => void;
  /** Accessible label. Defaults to the color value. */
  "aria-label"?: string;
  disabled?: boolean;
}

/**
 * Single circular color swatch button.
 *
 * Can be used standalone or composed inside `ColorPicker`.
 * Shows a white checkmark when `selected`.
 */
export function ColorSwatch({
  color,
  selected = false,
  size = "md",
  onSelect,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel ?? color}
      disabled={disabled}
      className={[
        styles.swatch,
        styles[`swatch-${size}`],
        selected ? styles.swatchSelected : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--swatch-color": color, ...style } as CSSProperties}
      onClick={() => onSelect?.(color)}
      {...props}
    >
      {selected && (
        <svg
          className={styles.checkmark}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8l3.5 3.5L13 5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

// ─── ColorPicker ─────────────────────────────────────────────────────────────

export interface ColorPickerColor {
  /** CSS color value (hex recommended). */
  value: string;
  /** Human-readable name shown as aria-label and tooltip. */
  label?: string;
}

/** Default Adwaita-named palette (matches Avatar color set). */
export const GNOME_PALETTE: ColorPickerColor[] = [
  { value: "#3584e4", label: "Blue"   },
  { value: "#2ec27e", label: "Green"  },
  { value: "#f6d32d", label: "Yellow" },
  { value: "#ff7800", label: "Orange" },
  { value: "#e01b24", label: "Red"    },
  { value: "#9141ac", label: "Purple" },
  { value: "#986a44", label: "Brown"  },
  { value: "#2190a4", label: "Teal"   },
  { value: "#5e5c64", label: "Slate"  },
];

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Currently selected color value. */
  value?: string;
  /** Called when the user selects a color. */
  onChange?: (value: string) => void;
  /**
   * Palette of colors to display.
   * Defaults to `GNOME_PALETTE` (the 9 Adwaita named colors).
   */
  colors?: ColorPickerColor[];
  /**
   * Show a "Custom…" button at the end that opens a native color picker.
   * When a custom color is chosen it is passed to `onChange` and shown
   * as a selected swatch until another palette color is picked.
   * Defaults to `false`.
   */
  allowCustom?: boolean;
  /** Swatch size. Defaults to `"md"`. */
  size?: ColorSwatchSize;
}

/**
 * Color palette picker following the Adwaita `GtkColorButton` + swatch pattern.
 *
 * Renders a row of circular `ColorSwatch` items. Keyboard navigation uses
 * arrow keys (roving tabindex). Optionally adds a "Custom…" button backed
 * by a hidden `<input type="color">`.
 *
 * ```tsx
 * <ColorPicker value={color} onChange={setColor} />
 * <ColorPicker value={color} onChange={setColor} allowCustom />
 * <ColorPicker
 *   value={color}
 *   onChange={setColor}
 *   colors={[{ value: "#ff0000", label: "Red" }, …]}
 * />
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ColorButton.html
 */
export function ColorPicker({
  value,
  onChange,
  colors = GNOME_PALETTE,
  allowCustom = false,
  size = "md",
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: ColorPickerProps) {
  const customInputRef = useRef<HTMLInputElement>(null);

  // Roving tabindex: only the selected (or first) swatch is in the tab order.
  const activeIndex = colors.findIndex((c) => c.value === value);
  const rovingIndex = activeIndex >= 0 ? activeIndex : 0;

  // Arrow-key navigation within the radiogroup.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const all = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>(
        `[role="radio"]:not([disabled])`
      )
    );
    const focused = document.activeElement as HTMLButtonElement;
    const idx = all.indexOf(focused);
    if (idx === -1) return;

    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = (idx + 1) % all.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = (idx - 1 + all.length) % all.length;
    }
    if (next >= 0) {
      all[next].focus();
      const color = all[next].dataset.color;
      if (color) onChange?.(color);
    }
  }

  // Decide whether the current `value` is a custom (not in palette) color.
  const isCustom =
    value !== undefined && !colors.some((c) => c.value === value);

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? "Color"}
      className={[styles.picker, className].filter(Boolean).join(" ")}
      style={style}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {colors.map((color, i) => (
        <ColorSwatch
          key={color.value}
          color={color.value}
          size={size}
          selected={color.value === value}
          onSelect={onChange}
          aria-label={color.label ?? color.value}
          tabIndex={i === rovingIndex && !isCustom ? 0 : -1}
          data-color={color.value}
        />
      ))}

      {allowCustom && (
        <>
          {/* Custom swatch — shows the picked color when active */}
          {isCustom && value && (
            <ColorSwatch
              color={value}
              size={size}
              selected
              onSelect={() => customInputRef.current?.click()}
              aria-label="Custom color"
              tabIndex={0}
              data-color={value}
            />
          )}

          {/* + button that opens the native color input */}
          <button
            type="button"
            aria-label="Choose custom color"
            className={[styles.swatch, styles[`swatch-${size}`], styles.customButton]
              .filter(Boolean)
              .join(" ")}
            tabIndex={isCustom ? -1 : -1}
            onClick={() => customInputRef.current?.click()}
          >
            <svg viewBox="0 0 16 16" className={styles.plusIcon} aria-hidden="true">
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <input
            ref={customInputRef}
            type="color"
            value={isCustom && value ? value : "#000000"}
            className={styles.nativeInput}
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => onChange?.(e.target.value)}
          />
        </>
      )}
    </div>
  );
}
