import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with a default "Loading…" accessible label', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Spinner />
      </GnomeProvider>,
    );

    expect(screen.getByRole('progressbar', { name: 'Loading…' })).toBeOnTheScreen();
  });

  it('accepts a custom label', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Spinner label="Fetching updates…" />
      </GnomeProvider>,
    );

    expect(screen.getByRole('progressbar', { name: 'Fetching updates…' })).toBeOnTheScreen();
  });

  it('hides from accessibility when label is set to ""', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Spinner label="" testID="spinner" />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();
    expect(screen.getByTestId('spinner', { includeHiddenElements: true })).toBeTruthy();
  });

  it('sizes the ring per the size prop', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Spinner size="lg" testID="spinner" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('spinner')).toHaveStyle({ width: 36, height: 36 });
  });

  it('defaults to the md size', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Spinner testID="spinner" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('spinner')).toHaveStyle({ width: 24, height: 24 });
  });
});
