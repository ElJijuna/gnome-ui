import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmojiPicker } from './EmojiPicker';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);

    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

function openPicker(onSelect = vi.fn()) {
  render(
    <EmojiPicker onSelect={onSelect}>
      <button type="button">Insert emoji</button>
    </EmojiPicker>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Insert emoji' }));

  return onSelect;
}

describe('EmojiPicker', () => {
  describe('opening', () => {
    it('opens the picker when the trigger is clicked', async () => {
      openPicker();

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('renders a search input focused on open', async () => {
      openPicker();

      const dialog = await screen.findByRole('dialog');

      expect(within(dialog).getByPlaceholderText('Search emoji…')).toBeInTheDocument();
    });

    it('groups emoji by category with section headings', async () => {
      openPicker();
      await screen.findByRole('dialog');

      expect(screen.getByRole('heading', { name: 'Smileys & People' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Nature' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Food & Drink' })).toBeInTheDocument();
    });

    it('does not show a "Recently used" section before anything is selected', async () => {
      openPicker();
      await screen.findByRole('dialog');

      expect(screen.queryByText('Recently used')).not.toBeInTheDocument();
    });
  });

  describe('selecting an emoji', () => {
    it('calls onSelect with the emoji character', async () => {
      const onSelect = openPicker();

      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'grinning face' }));

      expect(onSelect).toHaveBeenCalledWith('😀');
    });

    it('closes the picker after selecting an emoji', async () => {
      openPicker();

      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'grinning face' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });

    it('adds the selected emoji to "Recently used" on the next open', async () => {
      openPicker();

      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'grinning face' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      fireEvent.click(screen.getByRole('button', { name: 'Insert emoji' }));
      const dialog = await screen.findByRole('dialog');

      expect(within(dialog).getByText('Recently used')).toBeInTheDocument();
    });

    it('caps the recently used list at maxRecent', async () => {
      const onSelect = vi.fn();

      render(
        <EmojiPicker onSelect={onSelect} maxRecent={2}>
          <button type="button">Insert emoji</button>
        </EmojiPicker>,
      );

      const open = () => fireEvent.click(screen.getByRole('button', { name: 'Insert emoji' }));

      open();
      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'grinning face' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      open();
      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'face with tears of joy' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      open();
      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'thumbs up' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      open();
      const dialog = await screen.findByRole('dialog');
      const recentSection = within(dialog).getByText('Recently used').closest('section')!;

      expect(within(recentSection).getAllByRole('button')).toHaveLength(2);
    });
  });

  describe('search', () => {
    it('filters emoji by name', async () => {
      openPicker();
      const dialog = await screen.findByRole('dialog');

      await userEvent.type(within(dialog).getByPlaceholderText('Search emoji…'), 'pizza');

      expect(screen.getByRole('button', { name: 'pizza' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'grinning face' })).not.toBeInTheDocument();
    });

    it('hides category headings while searching', async () => {
      openPicker();
      const dialog = await screen.findByRole('dialog');

      await userEvent.type(within(dialog).getByPlaceholderText('Search emoji…'), 'pizza');

      expect(screen.queryByText('Smileys & People')).not.toBeInTheDocument();
    });

    it('shows a "No results" message when nothing matches', async () => {
      openPicker();
      const dialog = await screen.findByRole('dialog');

      await userEvent.type(within(dialog).getByPlaceholderText('Search emoji…'), 'zzzznotfound');

      expect(screen.getByText('No results')).toBeInTheDocument();
    });

    it('hides the category tab bar while searching', async () => {
      openPicker();
      const dialog = await screen.findByRole('dialog');

      await userEvent.type(within(dialog).getByPlaceholderText('Search emoji…'), 'pizza');

      expect(screen.queryByLabelText('Emoji categories')).not.toBeInTheDocument();
    });

    it('clears the search query after the picker closes and reopens', async () => {
      openPicker();
      let dialog = await screen.findByRole('dialog');

      await userEvent.type(within(dialog).getByPlaceholderText('Search emoji…'), 'pizza');
      fireEvent.click(screen.getByRole('button', { name: 'Insert emoji' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      fireEvent.click(screen.getByRole('button', { name: 'Insert emoji' }));
      dialog = await screen.findByRole('dialog');

      expect(within(dialog).getByPlaceholderText('Search emoji…')).toHaveValue('');
    });
  });

  describe('category tabs', () => {
    it('renders a tab button for each category', async () => {
      openPicker();
      await screen.findByRole('dialog');

      expect(screen.getByRole('button', { name: 'Nature' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Flags' })).toBeInTheDocument();
    });

    it('scrolls to the category section when its tab is clicked', async () => {
      openPicker();
      await screen.findByRole('dialog');

      fireEvent.click(screen.getByRole('button', { name: 'Nature' }));

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });
});
