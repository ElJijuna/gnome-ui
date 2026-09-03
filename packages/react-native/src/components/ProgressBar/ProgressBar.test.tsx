import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders as a progressbar', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <ProgressBar value={0.5} accessibilityLabel="Downloading" />
      </GnomeProvider>,
    );

    expect(screen.getByRole('progressbar', { name: 'Downloading' })).toBeOnTheScreen();
  });

  it('reports rounded percentage via accessibilityValue when determinate', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <ProgressBar value={0.6} testID="bar" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('bar').props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 60,
    });
  });

  it('clamps out-of-range values to 0–1', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <ProgressBar value={1.5} testID="bar" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('bar').props.accessibilityValue).toMatchObject({ now: 100 });
  });

  it('omits accessibilityValue when indeterminate', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <ProgressBar testID="bar" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('bar').props.accessibilityValue).toBeUndefined();
  });
});
