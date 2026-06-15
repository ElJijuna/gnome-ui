import { act, fireEvent, render, screen } from '@testing-library/react';
import { type ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel, CarouselIndicatorDots, CarouselIndicatorLines } from './Carousel';

beforeEach(() => {
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── CarouselIndicatorDots ──────────────────────────────────────────────────────

describe('CarouselIndicatorDots', () => {
  it('renders one dot per page', () => {
    render(<CarouselIndicatorDots pages={4} currentPage={0} />);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('marks only the current page dot as selected', () => {
    render(<CarouselIndicatorDots pages={3} currentPage={1} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onPageSelected with the dot index when clicked', () => {
    const onPageSelected = vi.fn();
    render(<CarouselIndicatorDots pages={3} currentPage={0} onPageSelected={onPageSelected} />);

    fireEvent.click(screen.getAllByRole('tab')[2]);

    expect(onPageSelected).toHaveBeenCalledOnce();
    expect(onPageSelected).toHaveBeenCalledWith(2);
  });
});

// ── CarouselIndicatorLines ─────────────────────────────────────────────────────

describe('CarouselIndicatorLines', () => {
  it('renders one line per page', () => {
    render(<CarouselIndicatorLines pages={5} currentPage={0} />);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('marks only the current page line as selected', () => {
    render(<CarouselIndicatorLines pages={3} currentPage={2} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onPageSelected with the line index when clicked', () => {
    const onPageSelected = vi.fn();
    render(<CarouselIndicatorLines pages={3} currentPage={0} onPageSelected={onPageSelected} />);

    fireEvent.click(screen.getAllByRole('tab')[1]);

    expect(onPageSelected).toHaveBeenCalledWith(1);
  });
});

// ── Carousel ──────────────────────────────────────────────────────────────────

describe('Carousel', () => {
  const renderCarousel = (props: ComponentProps<typeof Carousel> = {}) =>
    render(
      <Carousel {...props}>
        <div>Slide A</div>
        <div>Slide B</div>
        <div>Slide C</div>
      </Carousel>,
    );

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders a carousel region', () => {
    renderCarousel();
    expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('renders each slide with slide role and position label', () => {
    renderCarousel();
    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute('aria-label', '1 of 3');
    expect(slides[2]).toHaveAttribute('aria-label', '3 of 3');
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('calls onPageChanged with the next page on ArrowRight', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ onPageChanged });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('calls onPageChanged with the previous page on ArrowLeft', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ page: 2, onPageChanged });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('clamps at the last page without loop', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ page: 2, onPageChanged });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });

      expect(onPageChanged).toHaveBeenCalledWith(2);
    });

    it('wraps to the first page on ArrowRight when loop is enabled', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ page: 2, onPageChanged, loop: true });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });

      expect(onPageChanged).toHaveBeenCalledWith(0);
    });

    it('wraps to the last page on ArrowLeft when loop is enabled', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ page: 0, onPageChanged, loop: true });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });

      expect(onPageChanged).toHaveBeenCalledWith(2);
    });
  });

  // ── Controlled mode ───────────────────────────────────────────────────────

  describe('controlled mode', () => {
    it('calls scrollTo when the page prop changes', () => {
      const { rerender } = renderCarousel({ page: 0 });

      vi.mocked(Element.prototype.scrollTo).mockClear();

      rerender(
        <Carousel page={2}>
          <div>Slide A</div>
          <div>Slide B</div>
          <div>Slide C</div>
        </Carousel>,
      );

      expect(Element.prototype.scrollTo).toHaveBeenCalledOnce();
    });

    // Regression: clicking a dot sets page → page prop changes → scrollToPage fires
    // → handleScroll triggers mid-animation with scrollLeft=0 → onPageChanged(0)
    // → page resets back to 0. The isProgrammaticScrollRef guard prevents this loop.
    it('does not call onPageChanged from scroll events during programmatic scroll', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      const { rerender } = renderCarousel({ page: 0, onPageChanged });
      onPageChanged.mockClear();

      // Simulate dot click: parent calls setPage(2) → page prop changes
      rerender(
        <Carousel page={2} onPageChanged={onPageChanged}>
          <div>Slide A</div>
          <div>Slide B</div>
          <div>Slide C</div>
        </Carousel>,
      );

      // Scroll event fires mid-animation (scrollLeft is still 0 in jsdom)
      fireEvent.scroll(screen.getByRole('region'));

      expect(onPageChanged).not.toHaveBeenCalled();
    });

    it('resumes responding to scroll events after the programmatic scroll settles', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      const { rerender } = renderCarousel({ page: 0, onPageChanged });

      rerender(
        <Carousel page={2} onPageChanged={onPageChanged}>
          <div>Slide A</div>
          <div>Slide B</div>
          <div>Slide C</div>
        </Carousel>,
      );

      // Advance past the 400 ms guard window
      act(() => {
        vi.advanceTimersByTime(450);
      });

      onPageChanged.mockClear();

      // A real user scroll should now call onPageChanged
      fireEvent.scroll(screen.getByRole('region'));

      expect(onPageChanged).toHaveBeenCalledTimes(1);
    });
  });

  // ── Uncontrolled mode ─────────────────────────────────────────────────────

  describe('uncontrolled mode', () => {
    it('calls onPageChanged when a scroll event fires', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ onPageChanged });

      fireEvent.scroll(screen.getByRole('region'));

      expect(onPageChanged).toHaveBeenCalledWith(0);
    });
  });

  // ── autoPlay ──────────────────────────────────────────────────────────────

  describe('autoPlay', () => {
    it('advances to the next slide after the interval', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      renderCarousel({ autoPlay: true, interval: 3000, onPageChanged });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('respects a custom interval', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      renderCarousel({ autoPlay: true, interval: 1500, onPageChanged });

      act(() => {
        vi.advanceTimersByTime(1499);
      });
      expect(onPageChanged).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('does not advance when autoPlay is false', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      renderCarousel({ autoPlay: false, interval: 3000, onPageChanged });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(onPageChanged).not.toHaveBeenCalled();
    });

    it('keeps advancing across multiple slides', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      renderCarousel({ autoPlay: true, interval: 1000, onPageChanged });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onPageChanged).toHaveBeenNthCalledWith(1, 1);
      expect(onPageChanged).toHaveBeenNthCalledWith(2, 2);
    });

    it('stops at the last slide without loop', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      renderCarousel({ autoPlay: true, interval: 1000, loop: false, onPageChanged });

      // Advance past all slides
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const calls = onPageChanged.mock.calls.map(([p]) => p);
      expect(calls).toEqual([1, 2]); // stops at 2, never goes to 3
    });

    it('wraps to the first slide with loop enabled', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();

      renderCarousel({ autoPlay: true, interval: 1000, loop: true, onPageChanged });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onPageChanged).toHaveBeenNthCalledWith(1, 1);
      expect(onPageChanged).toHaveBeenNthCalledWith(2, 2);
      expect(onPageChanged).toHaveBeenNthCalledWith(3, 0); // wraps
    });

    it('pauses while the pointer hovers over the carousel', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      const carousel = renderCarousel({ autoPlay: true, interval: 1000, onPageChanged });

      fireEvent.mouseEnter(carousel.getByRole('region'));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onPageChanged).not.toHaveBeenCalled();
    });

    it('resumes after the pointer leaves the carousel', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      const carousel = renderCarousel({ autoPlay: true, interval: 1000, onPageChanged });

      fireEvent.mouseEnter(carousel.getByRole('region'));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      fireEvent.mouseLeave(carousel.getByRole('region'));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('pauses during drag', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      const carousel = renderCarousel({ autoPlay: true, interval: 1000, onPageChanged });

      fireEvent.pointerDown(carousel.getByRole('region'), { clientX: 0, pointerId: 1 });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onPageChanged).not.toHaveBeenCalled();
    });
  });
});
