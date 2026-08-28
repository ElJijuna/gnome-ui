import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('marks only the current page dot as selected', () => {
    render(<CarouselIndicatorDots pages={3} currentPage={1} />);
    const dots = screen.getAllByRole('button');
    expect(dots[0]).not.toHaveAttribute('aria-current');
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
    expect(dots[2]).not.toHaveAttribute('aria-current');
  });

  it('calls onPageSelected with the dot index when clicked', () => {
    const onPageSelected = vi.fn();
    render(<CarouselIndicatorDots pages={3} currentPage={0} onPageSelected={onPageSelected} />);

    fireEvent.click(screen.getAllByRole('button')[2]);

    expect(onPageSelected).toHaveBeenCalledOnce();
    expect(onPageSelected).toHaveBeenCalledWith(2);
  });
});

// ── CarouselIndicatorLines ─────────────────────────────────────────────────────

describe('CarouselIndicatorLines', () => {
  it('renders one line per page', () => {
    render(<CarouselIndicatorLines pages={5} currentPage={0} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('marks only the current page line as selected', () => {
    render(<CarouselIndicatorLines pages={3} currentPage={2} />);
    const dots = screen.getAllByRole('button');
    expect(dots[0]).not.toHaveAttribute('aria-current');
    expect(dots[2]).toHaveAttribute('aria-current', 'true');
  });

  it('calls onPageSelected with the line index when clicked', () => {
    const onPageSelected = vi.fn();
    render(<CarouselIndicatorLines pages={3} currentPage={0} onPageSelected={onPageSelected} />);

    fireEvent.click(screen.getAllByRole('button')[1]);

    expect(onPageSelected).toHaveBeenCalledWith(1);
  });
});

// ── Carousel ──────────────────────────────────────────────────────────────────

describe('Carousel', () => {
  /** The page picker — scoped, because arrows and pause are buttons too. */
  const pageIndicator = () => screen.getByRole('group', { name: 'Carousel pages' });

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

      // Clamped back onto the page we were already on, so nothing changed.
      expect(onPageChanged).not.toHaveBeenCalled();
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
    // jsdom never really scrolls, so the track has to be told where a swipe
    // would have left it.
    const scrollTrackTo = (region: HTMLElement, scrollLeft: number) =>
      Object.defineProperty(region, 'scrollLeft', { value: scrollLeft, configurable: true });

    it('calls onPageChanged when a scroll event lands on another page', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ onPageChanged });
      const region = screen.getByRole('region');
      scrollTrackTo(region, 1);

      fireEvent.scroll(region);

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    // A single swipe emits a scroll event per frame; each one used to be an
    // onPageChanged call carrying the page the consumer already knew about.
    it('does not repeat onPageChanged while scroll events keep landing on the same page', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ onPageChanged });
      const region = screen.getByRole('region');
      scrollTrackTo(region, 1);

      fireEvent.scroll(region);
      fireEvent.scroll(region);
      fireEvent.scroll(region);

      expect(onPageChanged).toHaveBeenCalledOnce();
    });

    it('does not call onPageChanged when a scroll settles on the page we are on', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ onPageChanged });

      fireEvent.scroll(screen.getByRole('region'));

      expect(onPageChanged).not.toHaveBeenCalled();
    });
  });

  // ── defaultPage ───────────────────────────────────────────────────────────

  describe('defaultPage', () => {
    it('starts on the given page', () => {
      renderCarousel({ defaultPage: 2, indicator: 'dots' });

      expect(within(pageIndicator()).getByRole('button', { name: 'Page 3' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });

    it('scrolls the track to that page on mount', () => {
      renderCarousel({ defaultPage: 2 });

      expect(Element.prototype.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'auto' }),
      );
    });

    it('clamps a page that is out of range', () => {
      renderCarousel({ defaultPage: 99, indicator: 'dots' });

      expect(within(pageIndicator()).getByRole('button', { name: 'Page 3' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });

    it('navigates on from the starting page', () => {
      const onPageChanged = vi.fn();
      renderCarousel({ defaultPage: 1, onPageChanged });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });

      expect(onPageChanged).toHaveBeenCalledWith(2);
    });

    it('is ignored once the page prop takes over', () => {
      renderCarousel({ defaultPage: 2, page: 0, indicator: 'dots' });

      expect(within(pageIndicator()).getByRole('button', { name: 'Page 1' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });

  // ── Empty carousel ────────────────────────────────────────────────────────

  describe('without children', () => {
    it('renders and navigates without producing NaN scroll offsets', () => {
      render(<Carousel indicator="dots" />);
      const region = screen.getByRole('region');

      fireEvent.keyDown(region, { key: 'ArrowRight' });

      const [[options]] = vi.mocked(Element.prototype.scrollTo).mock.calls as unknown as [
        [ScrollToOptions],
      ];
      expect(options.left).not.toBeNaN();
      // One floored page, but no slide behind it — so no dot either.
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  // ── Reduced motion ────────────────────────────────────────────────────────

  describe('prefers-reduced-motion', () => {
    const realMatchMedia = window.matchMedia;

    afterEach(() => {
      // The mock lives on `window`, so it would otherwise outlive this block.
      Object.defineProperty(window, 'matchMedia', { writable: true, value: realMatchMedia });
    });

    // `behavior: 'smooth'` on scrollTo overrides the stylesheet, so the
    // component has to drop it itself.
    const mockReducedMotion = (matches: boolean) =>
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

    it('scrolls instantly instead of smoothly when reduced motion is requested', () => {
      mockReducedMotion(true);
      renderCarousel();

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });

      expect(Element.prototype.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'auto' }),
      );
    });

    it('keeps smooth scrolling when reduced motion is not requested', () => {
      mockReducedMotion(false);
      renderCarousel();

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });

      expect(Element.prototype.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth' }),
      );
    });
  });

  // ── autoPlay ──────────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('gives the region an accessible name so it stays a landmark', () => {
      renderCarousel();
      expect(screen.getByRole('region')).toHaveAccessibleName('Carousel');
    });

    it('accepts a custom region name', () => {
      renderCarousel({ label: 'Featured products' });
      expect(screen.getByRole('region')).toHaveAccessibleName('Featured products');
    });

    it('lets the slide and page labels be translated', () => {
      renderCarousel({
        indicator: 'dots',
        indicatorLabel: 'Páginas',
        pageLabel: (i, total) => `Página ${i + 1} de ${total}`,
        slideLabel: (i, total) => `Diapositiva ${i + 1} de ${total}`,
      });

      const indicator = screen.getByRole('group', { name: 'Páginas' });
      expect(within(indicator).getByRole('button', { name: 'Página 1 de 3' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Diapositiva 2 de 3' })).toBeInTheDocument();
    });

    describe('Home and End', () => {
      it('jumps to the first page on Home', () => {
        const onPageChanged = vi.fn();
        renderCarousel({ page: 2, onPageChanged });

        fireEvent.keyDown(screen.getByRole('region'), { key: 'Home' });

        expect(onPageChanged).toHaveBeenCalledWith(0);
      });

      it('jumps to the last page on End', () => {
        const onPageChanged = vi.fn();
        renderCarousel({ page: 0, onPageChanged });

        fireEvent.keyDown(screen.getByRole('region'), { key: 'End' });

        expect(onPageChanged).toHaveBeenCalledWith(2);
      });
    });
  });

  describe('autoPlay', () => {
    // WCAG 2.2.2 — moving content needs a control that stops it.
    const pauseButton = () =>
      screen.getByRole('button', { name: 'Pause automatic slide rotation' });

    it('renders a pause control', () => {
      renderCarousel({ autoPlay: true });
      expect(pauseButton()).toBeInTheDocument();
    });

    it('stops advancing once the rotation is paused', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      renderCarousel({ autoPlay: true, interval: 1000, onPageChanged });

      act(() => {
        fireEvent.click(pauseButton());
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onPageChanged).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: 'Resume automatic slide rotation' }),
      ).toBeInTheDocument();
    });

    it('resumes advancing when the control is pressed again', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      renderCarousel({ autoPlay: true, interval: 1000, onPageChanged });

      act(() => {
        fireEvent.click(pauseButton());
      });
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Resume automatic slide rotation' }));
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

    it('omits the control when autoPlayControl is off', () => {
      renderCarousel({ autoPlay: true, autoPlayControl: false });
      expect(
        screen.queryByRole('button', { name: 'Pause automatic slide rotation' }),
      ).not.toBeInTheDocument();
    });

    // Keyboard users cannot hover, so focus is their equivalent of the
    // hover pause that pointer users already had.
    it('pauses while the keyboard is inside the carousel', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      renderCarousel({ autoPlay: true, interval: 1000, onPageChanged });

      act(() => {
        fireEvent.focus(screen.getByRole('region'));
      });
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(onPageChanged).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(screen.getByRole('region'));
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(onPageChanged).toHaveBeenCalledWith(1);
    });

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
      expect(within(pageIndicator()).getAllByRole('button')).toHaveLength(3); // ceil(5/2) = 3
    });

    it('shows 2 indicator dots for 5 slides with visibleSlides=3', () => {
      renderWith5Slides({ visibleSlides: 3, indicator: 'dots' });
      expect(within(pageIndicator()).getAllByRole('button')).toHaveLength(2); // ceil(5/3) = 2
    });

    it('clamps at last group on ArrowRight without loop', () => {
      const onPageChanged = vi.fn();
      // 5 slides, visibleSlides=2 → 3 pages (0, 1, 2)
      renderWith5Slides({ page: 2, visibleSlides: 2, onPageChanged });
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
      // Clamped onto the group we were already on, so nothing changed.
      expect(onPageChanged).not.toHaveBeenCalled();
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

  // ── infinite (seamless loop) ──────────────────────────────────────────────

  describe('infinite', () => {
    const renderInfinite = (props: ComponentProps<typeof Carousel> = {}) =>
      render(
        <Carousel infinite {...props}>
          <div>Slide A</div>
          <div>Slide B</div>
          <div>Slide C</div>
        </Carousel>,
      );

    it('renders a leading and a trailing clone around the real slides', () => {
      renderInfinite();
      // 1 lead + 3 real + 1 trailing
      expect(screen.getByRole('region').children).toHaveLength(5);
    });

    it('keeps clones out of the accessibility tree', () => {
      renderInfinite();
      const slides = screen.getAllByRole('group');
      expect(slides).toHaveLength(3);
      expect(slides[0]).toHaveAttribute('aria-label', '1 of 3');
      expect(slides[2]).toHaveAttribute('aria-label', '3 of 3');
    });

    it('marks clones as aria-hidden and inert', () => {
      renderInfinite();
      const clones = screen.getByRole('region').querySelectorAll('[aria-hidden="true"]');
      expect(clones).toHaveLength(2);
      for (const clone of clones) {
        expect(clone).toHaveAttribute('inert');
      }
    });

    it('clones the last page in front and the first page behind', () => {
      renderInfinite();
      const physical = [...screen.getByRole('region').children].map((el) => el.textContent);
      expect(physical).toEqual(['Slide C', 'Slide A', 'Slide B', 'Slide C', 'Slide A']);
    });

    it('clones a whole group when visibleSlides > 1', () => {
      render(
        <Carousel infinite visibleSlides={2}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </Carousel>,
      );
      const physical = [...screen.getByRole('region').children].map((el) => el.textContent);
      // Lead clone = last page [3, 4]; trailing clone = first page [1, 2]
      expect(physical).toEqual(['3', '4', '1', '2', '3', '4', '1', '2']);
    });

    it('pads the trailing clones so a ragged last page stays full', () => {
      render(
        <Carousel infinite visibleSlides={2}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
        </Carousel>,
      );
      // 5 slides in groups of 2 → 3 pages; the last page needs 1 filler plus a
      // full group to wrap onto.
      expect(screen.getByRole('region').children).toHaveLength(2 + 5 + 3);
    });

    it('renders no clones when everything fits on one page', () => {
      render(
        <Carousel infinite>
          <div>Only slide</div>
        </Carousel>,
      );
      expect(screen.getByRole('region').children).toHaveLength(1);
      expect(screen.getByRole('region').querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('wraps forward past the last page without loop being set', () => {
      const onPageChanged = vi.fn();
      renderInfinite({ page: 2, onPageChanged });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });

      expect(onPageChanged).toHaveBeenCalledWith(0);
    });

    it('wraps backward past the first page', () => {
      const onPageChanged = vi.fn();
      renderInfinite({ page: 0, onPageChanged });

      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });

      expect(onPageChanged).toHaveBeenCalledWith(2);
    });

    it('never disables the arrows', () => {
      renderInfinite({ arrows: true, page: 2 });
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled();
    });

    it('keeps auto-play running past the last page', () => {
      vi.useFakeTimers();
      const onPageChanged = vi.fn();
      renderInfinite({ autoPlay: true, interval: 1000, onPageChanged });

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(onPageChanged.mock.calls.map(([p]) => p)).toEqual([1, 2, 0, 1]);
    });
  });

  // ── peek ──────────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('adds no padding by default', () => {
      renderCarousel();
      expect(screen.getByRole('region').style.paddingInline).toBe('');
    });

    it('insets the track by a px peek', () => {
      renderCarousel({ peek: 40 });
      const track = screen.getByRole('region');
      expect(track.style.paddingInline).toBe('40px');
      expect(track.style.scrollPaddingInline).toBe('40px');
    });

    it('adds spacing on top so the peek is what actually shows', () => {
      renderCarousel({ peek: 40, spacing: 12 });
      expect(screen.getByRole('region').style.paddingInline).toBe('52px');
    });

    it('accepts a CSS length and folds spacing into a calc()', () => {
      renderCarousel({ peek: '10%', spacing: 12 });
      expect(screen.getByRole('region').style.paddingInline).toBe('calc(10% + 12px)');
    });

    it('accepts a CSS length as-is without spacing', () => {
      renderCarousel({ peek: '10%' });
      expect(screen.getByRole('region').style.paddingInline).toBe('10%');
    });

    it('insets the block axis when vertical', () => {
      renderCarousel({ peek: 24, orientation: 'vertical' });
      const track = screen.getByRole('region');
      expect(track.style.paddingBlock).toBe('24px');
      expect(track.style.scrollPaddingBlock).toBe('24px');
      expect(track.style.paddingInline).toBe('');
    });
  });

  // ── focusActiveSlides ─────────────────────────────────────────────────────

  describe('focusActiveSlides', () => {
    /** Transform of each slide's scaling wrapper, or 'none' when unscaled. */
    const scales = () =>
      [...screen.getByRole('region').children].map((slide) => {
        const inner = slide.firstElementChild as HTMLElement;
        return inner.style.transform || 'none';
      });

    it('renders the children directly when off', () => {
      renderCarousel();
      const inner = screen.getByRole('region').children[0].firstElementChild as HTMLElement;
      expect(inner.className).not.toMatch(/slideScale/);
      expect(inner).toHaveTextContent('Slide A');
    });

    it('wraps each slide in a scaling element when on', () => {
      renderCarousel({ focusActiveSlides: true });
      for (const slide of screen.getByRole('region').children) {
        expect((slide.firstElementChild as HTMLElement).className).toMatch(/slideScale/);
      }
    });

    it('shrinks every slide outside the current page to 80%', () => {
      renderCarousel({ focusActiveSlides: true });
      expect(scales()).toEqual(['none', 'scale(0.8)', 'scale(0.8)']);
    });

    it('follows the current page', () => {
      renderCarousel({ focusActiveSlides: true, page: 1 });
      expect(scales()).toEqual(['scale(0.8)', 'none', 'scale(0.8)']);
    });

    it('accepts an explicit scale', () => {
      renderCarousel({ focusActiveSlides: 0.5 });
      expect(scales()).toEqual(['none', 'scale(0.5)', 'scale(0.5)']);
    });

    it('treats a scale of 1 as off', () => {
      renderCarousel({ focusActiveSlides: 1 });
      const inner = screen.getByRole('region').children[0].firstElementChild as HTMLElement;
      expect(inner.className).not.toMatch(/slideScale/);
    });

    it('keeps the whole active group at full size', () => {
      render(
        <Carousel focusActiveSlides visibleSlides={2} page={1}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </Carousel>,
      );
      expect(scales()).toEqual(['scale(0.8)', 'scale(0.8)', 'none', 'none']);
    });

    it('scales the clone of an active slide with it, so it cannot pop mid-wrap', () => {
      render(
        <Carousel focusActiveSlides infinite page={0}>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </Carousel>,
      );
      // [clone C] [A] [B] [C] [clone A] — page 0 is A, and so is the trailing clone.
      expect(scales()).toEqual(['scale(0.8)', 'none', 'scale(0.8)', 'scale(0.8)', 'none']);
    });
  });
});
