import { useState } from 'react';

import { Button } from '../Button';
import { Dropdown } from '../Dropdown';
import { Popover, type PopoverPlacement } from '../Popover';
import { SpinButton } from '../SpinButton';
import styles from './FontPicker.module.css';
import { DEFAULT_FONT_FAMILIES, FONT_WEIGHTS, type FontValue, weightLabel } from './fontData';

export interface FontPickerProps {
  /** Current font selection. */
  value: FontValue;
  /** Called whenever the family, size, or weight changes. */
  onChange: (value: FontValue) => void;
  /** Families offered in the family dropdown. Defaults to a small representative set. */
  families?: string[];
  /** Minimum selectable point size. Defaults to `6`. */
  minSize?: number;
  /** Maximum selectable point size. Defaults to `96`. */
  maxSize?: number;
  /** Preferred popover placement relative to the trigger. Defaults to `'bottom'`. */
  placement?: PopoverPlacement;
  /** Disables the trigger and popover contents. */
  disabled?: boolean;
  /** Accessible label for the trigger button. Defaults to `'Font'`. */
  label?: string;
}

/**
 * Button that opens a family/size/weight chooser. Mirrors `GtkFontDialogButton`:
 * the trigger itself previews the current selection rendered in that font.
 */
export const FontPicker = ({
  value,
  onChange,
  families = DEFAULT_FONT_FAMILIES,
  minSize = 6,
  maxSize = 96,
  placement = 'bottom',
  disabled = false,
  label = 'Font',
}: FontPickerProps) => {
  const [open, setOpen] = useState(false);

  const familyOptions = families.map((f) => ({ value: f, label: f }));
  const weightOptions = FONT_WEIGHTS.map((w) => ({ value: String(w.value), label: w.label }));

  return (
    <Popover
      placement={placement}
      open={open}
      onOpenChange={setOpen}
      content={
        <div className={styles.picker}>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Family</span>
            <Dropdown
              aria-label="Font family"
              options={familyOptions}
              value={value.family}
              onChange={(family) => onChange({ ...value, family })}
              disabled={disabled}
            />
          </div>

          <div className={styles.row}>
            <span className={styles.fieldLabel}>Weight</span>
            <Dropdown
              aria-label="Font weight"
              options={weightOptions}
              value={String(value.weight)}
              onChange={(weight) => onChange({ ...value, weight: Number(weight) })}
              disabled={disabled}
            />
          </div>

          <div className={styles.row}>
            <span className={styles.fieldLabel}>Size</span>
            <SpinButton
              aria-label="Font size"
              value={value.size}
              onChange={(size) => onChange({ ...value, size })}
              min={minSize}
              max={maxSize}
              disabled={disabled}
            />
          </div>
        </div>
      }
    >
      <Button
        variant="default"
        disabled={disabled}
        aria-label={`${label}: ${value.family} ${weightLabel(value.weight)} ${value.size}`}
        className={styles.trigger}
        style={{ fontFamily: value.family, fontWeight: value.weight }}
      >
        {value.family} {weightLabel(value.weight)} {value.size}
      </Button>
    </Popover>
  );
};
