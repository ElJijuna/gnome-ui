import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PreferencesGroup } from '../PreferencesGroup';
import { PreferencesPage } from '../PreferencesPage';

import { PreferencesDialog } from './PreferencesDialog';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);

    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

describe('PreferencesDialog', () => {
  describe('rendering', () => {
    it('renders nothing when closed', () => {
      render(
        <PreferencesDialog open={false} onClose={vi.fn()}>
          <PreferencesPage title="General">
            <PreferencesGroup>Content</PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders a dialog labelled "Preferences" when open', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General">
            <PreferencesGroup>Content</PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      expect(screen.getByRole('dialog')).toHaveAccessibleName('Preferences');
    });

    it('renders the active page content', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General">
            <PreferencesGroup>General content</PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      expect(screen.getByText('General content')).toBeInTheDocument();
    });

    it('renders a search input by default', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      expect(screen.getByRole('searchbox', { name: 'Search preferences' })).toBeInTheDocument();
    });

    it('omits the search input when searchable is false', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()} searchable={false}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      expect(screen.queryByRole('searchbox')).toBeNull();
    });
  });

  describe('single vs multi page', () => {
    it('hides the sidebar navigation with a single page', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      expect(screen.queryByRole('navigation')).toBeNull();
    });

    it('shows sidebar navigation with tabs for each page when there are multiple pages', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General">
            <PreferencesGroup>General content</PreferencesGroup>
          </PreferencesPage>
          <PreferencesPage title="Privacy">
            <PreferencesGroup>Privacy content</PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      expect(screen.getByRole('navigation', { name: 'Preferences pages' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Privacy' })).toBeInTheDocument();
    });

    it('starts with the first page active', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General">
            <PreferencesGroup>General content</PreferencesGroup>
          </PreferencesPage>
          <PreferencesPage title="Privacy">
            <PreferencesGroup>Privacy content</PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('General content')).toBeInTheDocument();
      expect(screen.queryByText('Privacy content')).not.toBeInTheDocument();
    });

    it('switches the active page when a nav tab is clicked', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General">
            <PreferencesGroup>General content</PreferencesGroup>
          </PreferencesPage>
          <PreferencesPage title="Privacy">
            <PreferencesGroup>Privacy content</PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      fireEvent.click(screen.getByRole('tab', { name: 'Privacy' }));

      expect(screen.getByRole('tab', { name: 'Privacy' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Privacy content')).toBeInTheDocument();
      expect(screen.queryByText('General content')).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('forwards the trimmed lowercase query to the active page as data-search-query', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General">
            <PreferencesGroup>Content</PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      fireEvent.change(screen.getByRole('searchbox', { name: 'Search preferences' }), {
        target: { value: '  Wi-Fi  ' },
      });

      expect(screen.getByRole('tabpanel')).toHaveAttribute('data-search-query', 'wi-fi');
    });

    it('omits data-search-query when the search box is empty', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      expect(screen.getByRole('tabpanel')).not.toHaveAttribute('data-search-query');
    });
  });

  describe('closing', () => {
    it('close button fires onClose', () => {
      const onClose = vi.fn();

      render(
        <PreferencesDialog open onClose={onClose}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Close preferences' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Escape fires onClose', () => {
      const onClose = vi.fn();

      render(
        <PreferencesDialog open onClose={onClose}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('backdrop click fires onClose', () => {
      const onClose = vi.fn();

      render(
        <PreferencesDialog open onClose={onClose}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClose when clicking inside the dialog', () => {
      const onClose = vi.fn();

      render(
        <PreferencesDialog open onClose={onClose}>
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('focus trap', () => {
    it('Tab wraps focus from the last focusable element back to the first', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()} searchable={false}>
          <PreferencesPage title="General">
            <button type="button">Last</button>
          </PreferencesPage>
        </PreferencesDialog>,
      );

      const dialog = screen.getByRole('dialog');
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled])'));
      const last = focusable[focusable.length - 1];

      last.focus();
      fireEvent.keyDown(dialog, { key: 'Tab' });

      expect(document.activeElement).toBe(focusable[0]);
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the dialog', () => {
      render(
        <PreferencesDialog open onClose={vi.fn()} className="custom">
          <PreferencesPage title="General" />
        </PreferencesDialog>,
      );

      expect(screen.getByRole('dialog')).toHaveClass('custom');
    });
  });
});
