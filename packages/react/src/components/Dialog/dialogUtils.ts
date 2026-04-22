import { useState, useEffect, type CSSProperties, type KeyboardEvent, RefObject } from "react";

export const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Returns inline styles that anchor a `position:fixed` backdrop to the visual
 * viewport so the dialog stays centered when the virtual keyboard is open on
 * mobile (iOS Safari / Android Chrome shrink `visualViewport` but not the
 * layout viewport that `position:fixed` is relative to).
 */
export function useVisualViewport(): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const { visualViewport } = window;

    if (!visualViewport) {
      return;
    }

    const update = (): void => {
      const { offsetLeft: left, offsetTop: top, width, height } = visualViewport;
      setStyle({
        top,
        left,
        width,
        height,
      });
    };

    update();
    visualViewport.addEventListener("resize", update);
    visualViewport.addEventListener("scroll", update);

    return () => {
      visualViewport.removeEventListener("resize", update);
      visualViewport.removeEventListener("scroll", update);
    };
  }, []);

  return style;
}

export function trapFocus(e: KeyboardEvent<HTMLDivElement>, ref: RefObject<HTMLDivElement | null>) {
  if (e.key !== "Tab") {
    return;
  }

  const focusable = Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
