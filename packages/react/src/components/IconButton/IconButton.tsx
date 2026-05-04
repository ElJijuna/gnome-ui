import { forwardRef } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "../Button";
import { Icon, type IconSize } from "../Icon";
import { Tooltip, type TooltipPlacement } from "../Tooltip";

export type IconButtonVariant = ButtonVariant | "osd";
export type IconButtonSize = ButtonSize;

export interface IconButtonProps
  extends Omit<
    ButtonProps,
    "aria-label" | "children" | "leadingIcon" | "osd" | "shape" | "trailingIcon" | "variant"
  > {
  /** Icon definition imported from `@gnome-ui/icons`. */
  icon: IconDefinition;
  /** Accessible name for the icon-only button. */
  label: string;
  /** Visual style of the button. Use `"osd"` for media overlay controls. */
  variant?: IconButtonVariant;
  /** Size of the button. */
  size?: IconButtonSize;
  /** Override the rendered icon size. Defaults to a size matched to `size`. */
  iconSize?: IconSize;
  /** Optional tooltip text shown on hover/focus. */
  tooltip?: string;
  /** Preferred tooltip placement. */
  tooltipPlacement?: TooltipPlacement;
  /** Tooltip delay in milliseconds. */
  tooltipDelay?: number;
}

const ICON_SIZE_BY_BUTTON_SIZE: Record<IconButtonSize, IconSize> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

/**
 * Icon-only action button composed from `Button`, `Icon`, and optionally `Tooltip`.
 *
 * `label` is required because the button has no visible text.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({
  icon,
  label,
  variant = "default",
  size = "md",
  iconSize,
  tooltip,
  tooltipPlacement,
  tooltipDelay,
  ...props
}, ref) {
  const buttonVariant = variant === "osd" ? "flat" : variant;

  const button = (
    <Button
      ref={ref}
      aria-label={label}
      shape="circular"
      size={size}
      variant={buttonVariant}
      osd={variant === "osd"}
      {...props}
    >
      <Icon icon={icon} size={iconSize ?? ICON_SIZE_BY_BUTTON_SIZE[size]} />
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip
      label={tooltip}
      placement={tooltipPlacement}
      delay={tooltipDelay}
    >
      {button}
    </Tooltip>
  );
});
