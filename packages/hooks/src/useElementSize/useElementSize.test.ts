import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useElementSize } from './index';

// ─── ResizeObserver mock ──────────────────────────────────────────────────────
// jsdom does not implement ResizeObserver, so we define a stub and drive it manually.

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  trigger(width: number, height: number) {
    this.callback(
      [
        {
          contentRect: { width, height } as DOMRectReadOnly,
          contentBoxSize: [{ inlineSize: width, blockSize: height }],
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }

  triggerContentRectOnly(width: number, height: number) {
    this.callback(
      [
        {
          contentRect: { width, height } as DOMRectReadOnly,
          contentBoxSize: undefined,
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }
}

beforeEach(() => {
  ResizeObserverMock.instances = [];
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

describe('useElementSize', () => {
  it('returns width=0, height=0 before the ref is attached', () => {
    const ref = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useElementSize(ref));

    expect(result.current).toEqual({ width: 0, height: 0 });
  });

  it('measures the element once the ref is attached', () => {
    const el = document.createElement('div');

    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      width: 120,
      height: 40,
    } as DOMRect);

    const ref = { current: el };
    const { result } = renderHook(() => useElementSize(ref));

    expect(result.current).toEqual({ width: 120, height: 40 });
  });

  it('observes the element via ResizeObserver', () => {
    const el = document.createElement('div');
    const ref = { current: el };

    renderHook(() => useElementSize(ref));

    expect(ResizeObserverMock.instances[0].observe).toHaveBeenCalledWith(el);
  });

  it('updates reactively when the observer fires', () => {
    const el = document.createElement('div');
    const ref = { current: el };
    const { result } = renderHook(() => useElementSize(ref));

    act(() => {
      ResizeObserverMock.instances[0].trigger(300, 150);
    });

    expect(result.current).toEqual({ width: 300, height: 150 });
  });

  it('falls back to contentRect when contentBoxSize is unavailable', () => {
    const el = document.createElement('div');
    const ref = { current: el };
    const { result } = renderHook(() => useElementSize(ref));

    act(() => {
      ResizeObserverMock.instances[0].triggerContentRectOnly(250, 90);
    });

    expect(result.current).toEqual({ width: 250, height: 90 });
  });

  it('disconnects the observer on unmount', () => {
    const el = document.createElement('div');
    const ref = { current: el };
    const { unmount } = renderHook(() => useElementSize(ref));

    unmount();

    expect(ResizeObserverMock.instances[0].disconnect).toHaveBeenCalledOnce();
  });

  it('does not observe when the ref is null', () => {
    const ref = createRef<HTMLDivElement>();

    renderHook(() => useElementSize(ref));

    expect(ResizeObserverMock.instances).toHaveLength(0);
  });
});
