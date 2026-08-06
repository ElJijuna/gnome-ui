import { Syncing } from '@gnome-ui/icons';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AnimatedIcon } from './AnimatedIcon';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('AnimatedIcon', () => {
  it('renders the icon as an SVG', () => {
    mockMatchMedia(false);
    const { container } = render(<AnimatedIcon icon={Syncing} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('sets the play state to running when playing (default) and motion is allowed', () => {
    mockMatchMedia(false);
    const { container } = render(<AnimatedIcon icon={Syncing} />);

    expect(container.querySelector('svg')).toHaveStyle({ '--gnome-icon-play-state': 'running' });
  });

  it('sets the play state to paused when playing={false}', () => {
    mockMatchMedia(false);
    const { container } = render(<AnimatedIcon icon={Syncing} playing={false} />);

    expect(container.querySelector('svg')).toHaveStyle({ '--gnome-icon-play-state': 'paused' });
  });

  it('forces the play state to paused when prefers-reduced-motion is on, even if playing={true}', () => {
    mockMatchMedia(true);
    const { container } = render(<AnimatedIcon icon={Syncing} playing />);

    expect(container.querySelector('svg')).toHaveStyle({ '--gnome-icon-play-state': 'paused' });
  });

  it('forwards label to the underlying Icon', () => {
    mockMatchMedia(false);
    render(<AnimatedIcon icon={Syncing} label="Syncing" />);

    expect(screen.getByRole('img', { name: 'Syncing' })).toBeInTheDocument();
  });

  it('forwards size to the underlying Icon', () => {
    mockMatchMedia(false);
    const { container } = render(<AnimatedIcon icon={Syncing} size="lg" />);

    expect(container.querySelector('svg')).toHaveAttribute('width', '20');
  });

  it('preserves caller-provided style alongside the play-state variable', () => {
    mockMatchMedia(false);
    const { container } = render(<AnimatedIcon icon={Syncing} style={{ opacity: 0.5 }} />);

    expect(container.querySelector('svg')).toHaveStyle({
      opacity: '0.5',
      '--gnome-icon-play-state': 'running',
    });
  });
});
