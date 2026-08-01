import {
  Children,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';

import styles from './ResizablePanel.module.css';

export type ResizablePanelDirection = 'horizontal' | 'vertical';

export interface ResizablePanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onResize'> {
  /** Layout direction. Defaults to `'horizontal'`. */
  direction?: ResizablePanelDirection;
  /** Two or more panels, each rendered as one resizable region. */
  children: ReactNode;
  /**
   * Initial size of each panel as a percentage. Must sum to roughly 100 and
   * match the number of panels — falls back to an equal split otherwise.
   */
  defaultSizes?: number[];
  /** Minimum size any panel can be resized to, as a percentage. Defaults to `10`. */
  minSize?: number;
  /** Called with the updated sizes (percentages, one per panel) while dragging. */
  onResize?: (sizes: number[]) => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Two or more panels separated by a draggable divider, based on the
 * `GtkPaned` pattern. Foundational for user-resizable master-detail layouts
 * (code editors, file explorers, analytics dashboards).
 *
 * Implements the WAI-ARIA "window splitter" pattern: each divider is a
 * `role="separator"` with `aria-orientation` and `aria-valuenow`, focusable
 * and resizable with the arrow keys in addition to pointer drag.
 */
export const ResizablePanel = ({
  direction = 'horizontal',
  children,
  defaultSizes,
  minSize = 10,
  onResize,
  className,
  ...props
}: ResizablePanelProps) => {
  const panels = Children.toArray(children);
  const count = panels.length;

  const [sizes, setSizes] = useState<number[]>(() =>
    defaultSizes && defaultSizes.length === count
      ? defaultSizes
      : Array.from({ length: count }, () => 100 / count),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ index: number; startPos: number; startSizes: [number, number] } | null>(
    null,
  );
  const isHorizontal = direction === 'horizontal';

  const resizePair = useCallback(
    (index: number, deltaPercent: number, base: [number, number]) => {
      let a = base[0] + deltaPercent;
      let b = base[1] - deltaPercent;

      if (a < minSize) {
        b -= minSize - a;
        a = minSize;
      }
      if (b < minSize) {
        a -= minSize - b;
        b = minSize;
      }
      a = clamp(a, minSize, 100);
      b = clamp(b, minSize, 100);

      setSizes((prev) => {
        const next = [...prev];

        next[index] = a;
        next[index + 1] = b;
        onResize?.(next);

        return next;
      });
    },
    [minSize, onResize],
  );

  const handlePointerDown = (index: number) => (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      index,
      startPos: isHorizontal ? e.clientX : e.clientY,
      startSizes: [sizes[index], sizes[index + 1]],
    };
  };

  const handlePointerMove = (index: number) => (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const container = containerRef.current;

    if (
      !drag ||
      drag.index !== index ||
      !container ||
      !e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const containerSize = isHorizontal ? rect.width : rect.height;

    if (containerSize <= 0) {
      return;
    }

    const pos = isHorizontal ? e.clientX : e.clientY;
    const deltaPercent = ((pos - drag.startPos) / containerSize) * 100;

    resizePair(index, deltaPercent, drag.startSizes);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 2;
    const forwardKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const backKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    if (e.key === forwardKey) {
      e.preventDefault();
      resizePair(index, step, [sizes[index], sizes[index + 1]]);
    } else if (e.key === backKey) {
      e.preventDefault();
      resizePair(index, -step, [sizes[index], sizes[index + 1]]);
    }
  };

  const items: ReactNode[] = [];

  panels.forEach((panel, i) => {
    items.push(
      <div key={`panel-${i}`} className={styles.panel} style={{ flexBasis: `${sizes[i]}%` }}>
        {panel}
      </div>,
    );

    if (i < count - 1) {
      items.push(
        <div
          key={`divider-${i}`}
          role="separator"
          aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
          aria-valuenow={Math.round(sizes[i])}
          aria-valuemin={Math.round(minSize)}
          aria-valuemax={Math.round(100 - minSize)}
          tabIndex={0}
          className={styles.divider}
          onPointerDown={handlePointerDown(i)}
          onPointerMove={handlePointerMove(i)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown(i)}
        />,
      );
    }
  });

  return (
    <div
      ref={containerRef}
      className={[styles.container, isHorizontal ? styles.horizontal : styles.vertical, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {items}
    </div>
  );
};
