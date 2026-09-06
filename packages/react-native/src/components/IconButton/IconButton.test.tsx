import { Search, Settings } from '@gnome-ui/icons';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders an icon-only button with an accessible label', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <IconButton icon={Search} label="Search" />
      </GnomeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Search' })).toBeOnTheScreen();
  });

  it('defaults to a circular md button', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <IconButton icon={Search} label="Search" />
      </GnomeProvider>,
    );

    expect(screen.getByRole('button')).toHaveStyle({ borderRadius: 9999 });
  });

  it.each([
    'default',
    'suggested',
    'destructive',
    'flat',
    'raised',
    'osd',
  ] as const)('applies %s variant without crashing', async (variant) => {
    await render(
      <GnomeProvider colorScheme="light">
        <IconButton icon={Settings} label="Settings" variant={variant} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Settings' })).toBeOnTheScreen();
  });

  it.each(['sm', 'lg'] as const)('applies %s size', async (size) => {
    await render(
      <GnomeProvider colorScheme="light">
        <IconButton icon={Search} label="Search" size={size} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('button')).toBeOnTheScreen();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <IconButton icon={Search} label="Search" onPress={onPress} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Search' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <IconButton disabled icon={Search} label="Search" onPress={onPress} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  });

  it('forwards refs', async () => {
    const ref = createRef<View>();

    await render(
      <GnomeProvider colorScheme="light">
        <IconButton ref={ref} icon={Settings} label="Settings" testID="settings-action" />
      </GnomeProvider>,
    );

    expect(ref.current).toBeTruthy();
  });

  it('renders an optional tooltip', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <IconButton icon={Search} label="Search" tooltip="Search files" />
      </GnomeProvider>,
    );

    await fireEvent(screen.getByRole('button', { name: 'Search' }), 'longPress');

    expect(screen.getByText('Search files')).toBeOnTheScreen();
  });

  it('forwards refs when wrapped with a tooltip', async () => {
    const ref = createRef<View>();

    await render(
      <GnomeProvider colorScheme="light">
        <IconButton ref={ref} icon={Search} label="Search" tooltip="Search files" />
      </GnomeProvider>,
    );

    expect(ref.current).toBeTruthy();
  });
});
