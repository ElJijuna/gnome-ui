import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders nothing when closed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SearchBar open={false} value="" placeholder="Search…" testID="search" />
      </GnomeProvider>,
    );

    expect(screen.queryByPlaceholderText('Search…')).not.toBeOnTheScreen();
  });

  it('renders an input with the placeholder when open', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SearchBar open value="" placeholder="Search apps…" />
      </GnomeProvider>,
    );

    expect(screen.getByPlaceholderText('Search apps…')).toBeOnTheScreen();
  });

  it('calls onChangeText as the user types', async () => {
    const onChangeText = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <SearchBar open value="" onChangeText={onChangeText} placeholder="Search…" />
      </GnomeProvider>,
    );

    await fireEvent.changeText(screen.getByPlaceholderText('Search…'), 'gnome');
    expect(onChangeText).toHaveBeenCalledWith('gnome');
  });

  it('shows a clear button only when there is a value, and calls onClear', async () => {
    const onClear = jest.fn();

    const { rerender } = await render(
      <GnomeProvider colorScheme="light">
        <SearchBar open value="" onClear={onClear} placeholder="Search…" />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeOnTheScreen();

    await rerender(
      <GnomeProvider colorScheme="light">
        <SearchBar open value="gnome" onClear={onClear} placeholder="Search…" />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders a close button and calls onClose when provided', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <SearchBar open value="" onClose={onClose} placeholder="Search…" />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('omits the close button when onClose is not provided', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SearchBar open value="" placeholder="Search…" />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeOnTheScreen();
  });

  it('renders children (e.g. filter chips) only while open', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SearchBar open value="" placeholder="Search…">
          <Text>All apps</Text>
        </SearchBar>
      </GnomeProvider>,
    );

    expect(screen.getByText('All apps')).toBeOnTheScreen();
  });
});
