import { Connecting, Downloading, Recording, Search, Syncing } from '@gnome-ui/icons';
import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { AnimatedIcon } from './AnimatedIcon';

describe('AnimatedIcon', () => {
  it.each([
    ['Syncing', Syncing],
    ['Recording', Recording],
    ['Downloading', Downloading],
    ['Connecting', Connecting],
  ])('mounts the %s animation recipe without throwing, with an accessible label', async (name, icon) => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={icon} label={name} />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText(name)).toBeOnTheScreen();

    // Stops each recipe's Animated.loop deterministically before the test
    // ends — otherwise its real-timer tick can fire after the test (and
    // its render tree) is gone, logging a spurious "not wrapped in act()"
    // warning. Real timers are required in this stack (see the package's
    // Jest setup notes), so this is the alternative to fake timers.
    unmount();
  });

  it('falls back to the static Icon frame when playing={false}', async () => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={Syncing} playing={false} label="Syncing" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Syncing')).toBeOnTheScreen();

    unmount();
  });

  it('falls back to the static Icon frame for an icon RECIPES does not recognize', async () => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={Search} label="Search" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Search')).toBeOnTheScreen();

    unmount();
  });

  it('hides decorative icons without a label from the accessibility tree', async () => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={Syncing} />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('image')).not.toBeOnTheScreen();

    unmount();
  });

  it('applies color per-shape inside the recipe, not on the outer Svg, while playing', async () => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={Syncing} label="Syncing" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Syncing').props.fill).toBeUndefined();

    unmount();
  });

  it('sets fill on the outer Svg when it falls back to the static Icon', async () => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={Syncing} playing={false} label="Syncing" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Syncing').props.fill).toBe('rgba(0, 0, 0, 0.8)');

    unmount();
  });

  it('forwards size to the underlying Icon when falling back to static', async () => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={Syncing} playing={false} label="Syncing" size="lg" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Syncing').props.width).toBe(20);

    unmount();
  });

  it('forwards size to the animated Svg while playing', async () => {
    const { unmount } = await render(
      <GnomeProvider colorScheme="light">
        <AnimatedIcon icon={Syncing} label="Syncing" size="lg" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Syncing').props.width).toBe(20);

    unmount();
  });
});
