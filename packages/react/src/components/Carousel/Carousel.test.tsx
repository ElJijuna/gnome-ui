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

      // Drag events live on slide wrappers (role="group"), not the scroll container
      fireEvent.pointerDown(carousel.getAllByRole('group')[0], { clientX: 0, pointerId: 1 });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onPageChanged).not.toHaveBeenCalled();
    });
  });

  // ── visibleSlides group paging ────────────────────────────────────────────

  describe('visibleSlides group paging', () => {
    const renderWith5Slides = (props: ComponentProps<typeof Carousel> = {}) =>
      render(
        <Carousel {...props}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
          <div>Slide 4</div>
          <div>Slide 5</div>
        </Carousel>,
      );

    it('shows ceil(slides/visibleSlides) indicator dots', () => {
      renderWith5Slides({ visibleSlides: 2, indicator: 'dots' });
      expect(screen.getAllByRole('tab')).toHaveLength(3); // ceil(5/2) = 3
    });

    it('shows 2 indicator dots for 5 slides with visibleSlides=3', () => {
      renderWith5Slides({ visibleSlides: 3, indicator: 'dots' });
      expect(screen.getAllByRole('tab')).toHaveLength(2); // ceil(5/3) = 2
    });

    it('clamps at last group on ArrowRight without loop', () => {
      const onPageChanged = vi.fn();
      // 5 slides, visibleSlides=2 → 3 pages (0, 1, 2)
      renderWith5Slides({ page: 2, visibleSlides: 2, onPageChanged });
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
      expect(onPageChanged).toHaveBeenCalledWith(2);
    });

    it('wraps from last group to first with loop', () => {
      const onPageChanged = vi.fn();
      renderWith5Slides({ page: 2, visibleSlides: 2, onPageChanged, loop: true });
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
      expect(onPageChanged).toHaveBeenCalledWith(0);
    });

    it('autoPlay stops at last group without loop', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      renderWith5Slides({ autoPlay: true, interval: 1000, visibleSlides: 2, onPageChanged });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      const calls = onPageChanged.mock.calls.map(([p]) => p);
      expect(calls).toEqual([1, 2]); // stops at 2 (last group), never reaches 3
    });
  });

  // ── Arrows ────────────────────────────────────────────────────────────────

  describe('arrows', () => {
    const arrowButtons = () => ({
      prev: screen.getByRole('button', { name: 'Previous slide' }),
      next: screen.getByRole('button', { name: 'Next slide' }),
    });

    it('renders no arrows by default', () => {
      renderCarousel({ indicator: 'none' });
      expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
    });

    it('renders previous/next arrows when arrows is set', () => {
      renderCarousel({ arrows: true });
      const { prev, next } = arrowButtons();
      expect(prev).toBeInTheDocument();
      expect(next).toBeInTheDocument();
    });

    it('does not render arrows when there is only one page', () => {
      render(
        <Carousel arrows>
          <div>Only slide</div>
        </Carousel>,
      );
      expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
    });

    it('advances to the next page on next click', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ arrows: true, onPageChanged });

      fireEvent.click(arrowButtons().next);

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('goes back one page on previous click', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ arrows: true, page: 2, onPageChanged });

      fireEvent.click(arrowButtons().prev);

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('disables the previous arrow on the first page without loop', () => {
      renderCarousel({ arrows: true });
      const { prev, next } = arrowButtons();
      expect(prev).toBeDisabled();
      expect(next).toBeEnabled();
    });

    it('disables the next arrow on the last page without loop', () => {
      renderCarousel({ arrows: true, page: 2 });
      const { prev, next } = arrowButtons();
      expect(prev).toBeEnabled();
      expect(next).toBeDisabled();
    });

    it('keeps both arrows enabled and wraps when loop is set', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ arrows: true, loop: true, page: 0, onPageChanged });
      const { prev, next } = arrowButtons();
      expect(prev).toBeEnabled();
      expect(next).toBeEnabled();

      fireEvent.click(prev);

      expect(onPageChanged).toHaveBeenCalledWith(2);
    });

    it('advances a full group when visibleSlides > 1', () => {
      const onPageChanged = vi.fn();
      render(
        <Carousel arrows visibleSlides={2} onPageChanged={onPageChanged}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
          <div>Slide 4</div>
          <div>Slide 5</div>
        </Carousel>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('uses custom arrow labels', () => {
      renderCarousel({ arrows: true, previousLabel: 'Anterior', nextLabel: 'Siguiente' });
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
    });

    it('applies className and rest props to the arrow viewport when no indicator is shown', () => {
      renderCarousel({
        arrows: true,
        indicator: 'none',
        className: 'custom',
        'data-testid': 'car',
      });
      const viewport = screen.getByTestId('car');
      expect(viewport).toHaveClass('custom');
      expect(viewport).toContainElement(screen.getByRole('region'));
    });
  });
});
