import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchBar } from './SearchBar';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);

    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  Element.prototype.scrollIntoView = vi.fn();
});

const suggestions = [
  { id: '1', label: 'Alice' },
  { id: '2', label: 'Bob' },
];

describe('SearchBar', () => {
  describe('rendering', () => {
    it('exposes the suggestions panel as a real listbox of options', () => {
      render(<SearchBar open value="a" onChange={vi.fn()} suggestions={suggestions} />);

      expect(screen.getByRole('listbox', { name: 'Suggestions' })).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(suggestions.length);
    });

    it('renders a combobox input with a default placeholder', () => {
      render(<SearchBar open value="" onChange={vi.fn()} />);
      expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Search…');
    });

    it('accepts a custom placeholder', () => {
      render(<SearchBar open value="" onChange={vi.fn()} placeholder="Find…" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Find…');
    });

    it('marks the wrapper aria-hidden when closed', () => {
      const { container } = render(<SearchBar open={false} value="" onChange={vi.fn()} />);
      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks the wrapper visible when open', () => {
      const { container } = render(<SearchBar open value="" onChange={vi.fn()} />);
      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'false');
    });

    it('renders children as a filter row', () => {
      render(
        <SearchBar open value="" onChange={vi.fn()}>
          <span>Filter chip</span>
        </SearchBar>,
      );

      expect(screen.getByText('Filter chip')).toBeInTheDocument();
    });

    it('removes the input from the tab order when closed', () => {
      // The wrapper is aria-hidden while closed, which also removes the
      // input from the accessibility tree — query the raw DOM instead.
      const { container } = render(<SearchBar open={false} value="" onChange={vi.fn()} />);
      expect(container.querySelector('input')).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('focus management', () => {
    it('autofocuses the input when open', () => {
      render(<SearchBar open value="" onChange={vi.fn()} />);
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });

  describe('clear button', () => {
    it('is hidden when the value is empty', () => {
      render(<SearchBar open value="" onChange={vi.fn()} />);
      expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    });

    it('is shown when the value is non-empty', () => {
      render(<SearchBar open value="abc" onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    });

    it('calls onClear and refocuses the input when clicked', async () => {
      const onClear = vi.fn();

      render(<SearchBar open value="abc" onChange={vi.fn()} onClear={onClear} />);
      await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

      expect(onClear).toHaveBeenCalledOnce();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });

  describe('keyboard', () => {
    it('calls onClose on Escape', async () => {
      const onClose = vi.fn();

      render(<SearchBar open value="" onChange={vi.fn()} onClose={onClose} />);
      screen.getByRole('combobox').focus();
      await userEvent.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('suggestions', () => {
    it('does not render a listbox without suggestions', () => {
      render(<SearchBar open value="a" onChange={vi.fn()} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders suggestion items and expands the combobox', () => {
      render(<SearchBar open value="a" onChange={vi.fn()} suggestions={suggestions} />);

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('shows a loading spinner instead of items while loadingSuggestions is true', () => {
      render(
        <SearchBar
          open
          value="a"
          onChange={vi.fn()}
          suggestions={suggestions}
          loadingSuggestions
        />,
      );

      expect(screen.getByRole('status', { name: 'Loading suggestions…' })).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('uses a custom suggestionsLabel for the listbox', () => {
      render(
        <SearchBar
          open
          value="a"
          onChange={vi.fn()}
          suggestions={suggestions}
          suggestionsLabel="Matching contacts"
        />,
      );

      expect(screen.getByRole('listbox', { name: 'Matching contacts' })).toBeInTheDocument();
    });

    it('renders custom suggestion content via renderSuggestion', () => {
      render(
        <SearchBar
          open
          value="a"
          onChange={vi.fn()}
          suggestions={suggestions}
          renderSuggestion={(item) => <strong>{item.label.toUpperCase()}</strong>}
        />,
      );

      expect(screen.getByText('ALICE')).toBeInTheDocument();
    });

    it('calls onSuggestionSelect when a suggestion is clicked', async () => {
      const onSuggestionSelect = vi.fn();

      render(
        <SearchBar
          open
          value="a"
          onChange={vi.fn()}
          suggestions={suggestions}
          onSuggestionSelect={onSuggestionSelect}
        />,
      );

      await userEvent.click(screen.getByText('Bob'));
      expect(onSuggestionSelect).toHaveBeenCalledWith(suggestions[1]);
    });

    it('ArrowDown/ArrowUp move the active suggestion and Enter selects it', async () => {
      const onSuggestionSelect = vi.fn();

      render(
        <SearchBar
          open
          value="a"
          onChange={vi.fn()}
          suggestions={suggestions}
          onSuggestionSelect={onSuggestionSelect}
        />,
      );

      const input = screen.getByRole('combobox');
      input.focus();

      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByText('Alice').closest('li')).toHaveAttribute('aria-selected', 'true');

      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByText('Bob').closest('li')).toHaveAttribute('aria-selected', 'true');

      await userEvent.keyboard('{Enter}');
      expect(onSuggestionSelect).toHaveBeenCalledWith(suggestions[1]);
    });

    it('Escape still closes the bar when a suggestion is active', async () => {
      const onClose = vi.fn();

      render(
        <SearchBar open value="a" onChange={vi.fn()} onClose={onClose} suggestions={suggestions} />,
      );

      screen.getByRole('combobox').focus();
      await userEvent.keyboard('{ArrowDown}{Escape}');

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('disabled', () => {
    it('disables the input', () => {
      render(<SearchBar open value="" onChange={vi.fn()} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('disables the clear button', () => {
      render(<SearchBar open value="abc" onChange={vi.fn()} disabled />);
      expect(screen.getByRole('button', { name: 'Clear search' })).toBeDisabled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(
        <SearchBar open value="" onChange={vi.fn()} className="custom" />,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
