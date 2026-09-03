import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a rect with the default 100% width and 16 height', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Skeleton testID="skeleton" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '100%', height: 16 });
  });

  it('renders a rect with a custom width/height', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Skeleton width={120} height={24} testID="skeleton" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('skeleton')).toHaveStyle({ width: 120, height: 24 });
  });

  it('renders a circle sized by the size prop, fully rounded', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Skeleton variant="circle" size={48} testID="skeleton" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('skeleton')).toHaveStyle({ width: 48, height: 48, borderRadius: 24 });
  });

  it('renders the given number of text lines, with the last one narrower', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Skeleton variant="text" lines={3} testID="skeleton" />
      </GnomeProvider>,
    );

    const container = screen.getByTestId('skeleton');
    const lineNodes = container.children;

    expect(lineNodes).toHaveLength(3);
    expect(lineNodes[0]).toHaveStyle({ width: '100%' });
    expect(lineNodes[2]).toHaveStyle({ width: '60%' });
  });

  it('defaults to 3 lines when lines is omitted', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Skeleton variant="text" testID="skeleton" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('skeleton').children).toHaveLength(3);
  });

  it('floors a fractional lines value', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Skeleton variant="text" lines={2.9} testID="skeleton" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('skeleton').children).toHaveLength(2);
  });

  it('is hidden from the accessibility tree', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Skeleton testID="skeleton" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('skeleton').props.accessible).toBe(false);
  });
});
