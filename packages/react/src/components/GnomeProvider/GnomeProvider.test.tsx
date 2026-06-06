import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  useAccentColor,
  useColorScheme,
  useDateTimeFormatter,
  useNumberFormatter,
  useResolvedColorScheme,
} from './GnomeContext';
import { GnomeProvider } from './GnomeProvider';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

const FormattedNumber = ({ value }: { value: number }) => {
  const formatter = useNumberFormatter();

  return <span>{formatter.format(value)}</span>;
};

const FormattedMonth = ({ value }: { value: Date }) => {
  const formatter = useDateTimeFormatter({ month: 'short' });

  return <span>{formatter.format(value)}</span>;
};

describe('GnomeProvider colorScheme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('does not set data-theme when colorScheme is system (default)', () => {
    mockMatchMedia(false);
    render(
      <GnomeProvider>
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('sets data-theme=light when colorScheme is light', () => {
    mockMatchMedia(false);
    render(
      <GnomeProvider colorScheme="light">
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('sets data-theme=dark when colorScheme is dark', () => {
    mockMatchMedia(false);
    render(
      <GnomeProvider colorScheme="dark">
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('exposes colorScheme via useColorScheme', () => {
    mockMatchMedia(false);
    const Reader = () => {
      return <span>{useColorScheme()}</span>;
    };

    render(
      <GnomeProvider colorScheme="dark">
        <Reader />
      </GnomeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
  });

  it('resolves system to light when OS is light', () => {
    mockMatchMedia(false);
    const Reader = () => {
      return <span>{useResolvedColorScheme()}</span>;
    };

    render(
      <GnomeProvider colorScheme="system">
        <Reader />
      </GnomeProvider>,
    );
    expect(screen.getByText('light')).toBeInTheDocument();
  });

  it('resolves system to dark when OS is dark', () => {
    mockMatchMedia(true);
    const Reader = () => {
      return <span>{useResolvedColorScheme()}</span>;
    };

    render(
      <GnomeProvider colorScheme="system">
        <Reader />
      </GnomeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
  });
});

describe('GnomeProvider accentColor', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--gnome-accent-color');
    document.documentElement.style.removeProperty('--gnome-accent-bg-color');
  });

  it('does not set inline CSS vars when accentColor is blue (default)', () => {
    mockMatchMedia(false);
    render(
      <GnomeProvider>
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-color')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-bg-color')).toBe('');
  });

  it('sets correct CSS vars for a named color in light mode', () => {
    mockMatchMedia(false);
    render(
      <GnomeProvider colorScheme="light" accentColor="green">
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-color')).toBe(
      'var(--gnome-green-3)',
    );
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-bg-color')).toBe(
      'var(--gnome-green-3)',
    );
  });

  it('sets correct CSS vars for a named color in dark mode (shade-2)', () => {
    mockMatchMedia(false);
    render(
      <GnomeProvider colorScheme="dark" accentColor="purple">
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-color')).toBe(
      'var(--gnome-purple-2)',
    );
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-bg-color')).toBe(
      'var(--gnome-purple-3)',
    );
  });

  it('applies hex color directly for custom (non-named) accent', () => {
    mockMatchMedia(false);
    render(
      <GnomeProvider accentColor="#a020f0">
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-color')).toBe('#a020f0');
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-bg-color')).toBe(
      '#a020f0',
    );
  });

  it('exposes accentColor via useAccentColor', () => {
    mockMatchMedia(false);
    const Reader = () => {
      return <span>{useAccentColor()}</span>;
    };

    render(
      <GnomeProvider accentColor="red">
        <Reader />
      </GnomeProvider>,
    );
    expect(screen.getByText('red')).toBeInTheDocument();
  });

  it('clears inline CSS vars when switching back to blue', () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <GnomeProvider accentColor="green">
        <span />
      </GnomeProvider>,
    );

    expect(document.documentElement.style.getPropertyValue('--gnome-accent-color')).not.toBe('');
    rerender(
      <GnomeProvider accentColor="blue">
        <span />
      </GnomeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue('--gnome-accent-color')).toBe('');
  });
});

describe('GnomeProvider intl formatting', () => {
  it('provides number format defaults to descendants', () => {
    render(
      <GnomeProvider locale="en-US" numberFormat={{ notation: 'compact', compactDisplay: 'short' }}>
        <FormattedNumber value={1000} />
      </GnomeProvider>,
    );

    expect(screen.getByText('1K')).toBeInTheDocument();
  });

  it('uses standard number formatting by default', () => {
    render(
      <GnomeProvider locale="en-US">
        <FormattedNumber value={1000} />
      </GnomeProvider>,
    );

    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('provides date time format defaults to descendants', () => {
    render(
      <GnomeProvider locale="es-ES">
        <FormattedMonth value={new Date(2000, 0, 1)} />
      </GnomeProvider>,
    );

    expect(screen.getByText('ene')).toBeInTheDocument();
  });
});
