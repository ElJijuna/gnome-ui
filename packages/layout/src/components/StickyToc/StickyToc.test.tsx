import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StickyToc } from './StickyToc';

// ─── IntersectionObserver mock ─────────────────────────────────────────────────

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let instances: Array<{ callback: ObserverCallback; observed: Element[]; disconnect: () => void }>;

class IntersectionObserverMock {
  callback: ObserverCallback;
  observed: Element[] = [];
  disconnect = vi.fn();

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    instances.push(this);
  }

  observe(el: Element) {
    this.observed.push(el);
  }

  unobserve() {}
}

function fireIntersection(id: string, isIntersecting: boolean) {
  const instance = instances[instances.length - 1];

  act(() => {
    instance.callback([{ target: { id } as Element, isIntersecting }]);
  });
}

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'usage', label: 'Usage' },
  { id: 'props', label: 'Props' },
];

function mountHeadings() {
  for (const s of sections) {
    const el = document.createElement('div');

    el.id = s.id;
    document.body.appendChild(el);
  }
}

beforeEach(() => {
  instances = [];
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  Element.prototype.scrollIntoView = vi.fn();
  mountHeadings();
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('StickyToc', () => {
  describe('rendering', () => {
    it('renders a nav landmark labelled "On this page" by default', () => {
      render(<StickyToc sections={sections} />);
      expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();
    });

    it('accepts a custom label', () => {
      render(<StickyToc sections={sections} label="Contents" />);
      expect(screen.getByRole('navigation', { name: 'Contents' })).toBeInTheDocument();
      expect(screen.getByText('Contents')).toBeInTheDocument();
    });

    it('renders one link per section with the correct href', () => {
      render(<StickyToc sections={sections} />);

      expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute('href', '#intro');
      expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('href', '#usage');
      expect(screen.getByRole('link', { name: 'Props' })).toHaveAttribute('href', '#props');
    });

    it('marks the first section active by default', () => {
      render(<StickyToc sections={sections} />);
      expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
        'aria-current',
        'location',
      );
    });

    it('renders nothing extra when sections is empty', () => {
      render(<StickyToc sections={[]} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('scroll-spy', () => {
    it('observes every section element', () => {
      render(<StickyToc sections={sections} />);
      expect(instances[0].observed).toHaveLength(3);
    });

    it('marks a section active once it intersects', () => {
      render(<StickyToc sections={sections} />);

      fireIntersection('usage', true);

      expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      expect(screen.getByRole('link', { name: 'Introduction' })).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('calls onActiveChange when the active section changes', () => {
      const onActiveChange = vi.fn();

      render(<StickyToc sections={sections} onActiveChange={onActiveChange} />);
      fireIntersection('props', true);

      expect(onActiveChange).toHaveBeenCalledWith('props');
    });

    it('prefers the earliest section in document order among several visible at once', () => {
      render(<StickyToc sections={sections} />);

      fireIntersection('usage', true);
      fireIntersection('props', true);

      expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute(
        'aria-current',
        'location',
      );
    });

    it('keeps the last active section highlighted once nothing is intersecting', () => {
      render(<StickyToc sections={sections} />);

      fireIntersection('usage', true);
      fireIntersection('usage', false);

      // No section is currently visible (e.g. mid-scroll between two) — the
      // highlight should not flicker back to "none active".
      expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute(
        'aria-current',
        'location',
      );
    });

    it('disconnects the observer on unmount', () => {
      const { unmount } = render(<StickyToc sections={sections} />);
      const [instance] = instances;

      unmount();
      expect(instance.disconnect).toHaveBeenCalled();
    });
  });

  describe('click navigation', () => {
    it('scrolls the target section into view when its link is clicked', () => {
      render(<StickyToc sections={sections} />);
      fireEvent.click(screen.getByRole('link', { name: 'Usage' }));

      expect(document.getElementById('usage')?.scrollIntoView).toHaveBeenCalledWith({
        block: 'start',
      });
    });

    it('marks the clicked section active immediately', () => {
      render(<StickyToc sections={sections} />);
      fireEvent.click(screen.getByRole('link', { name: 'Props' }));

      expect(screen.getByRole('link', { name: 'Props' })).toHaveAttribute(
        'aria-current',
        'location',
      );
    });

    it('calls onActiveChange when a link is clicked', () => {
      const onActiveChange = vi.fn();

      render(<StickyToc sections={sections} onActiveChange={onActiveChange} />);
      fireEvent.click(screen.getByRole('link', { name: 'Usage' }));

      expect(onActiveChange).toHaveBeenCalledWith('usage');
    });

    it('does nothing when the target heading does not exist in the DOM', () => {
      document.getElementById('usage')?.remove();

      render(<StickyToc sections={sections} />);
      expect(() => fireEvent.click(screen.getByRole('link', { name: 'Usage' }))).not.toThrow();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the nav', () => {
      const { container } = render(<StickyToc sections={sections} className="custom" />);
      expect(container.querySelector('nav')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<StickyToc sections={sections} data-testid="page-toc" />);
      expect(screen.getByTestId('page-toc')).toBeInTheDocument();
    });
  });
});
