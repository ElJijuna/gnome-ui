import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { FilterableMultiSelectDropdown } from './FilterableMultiSelectDropdown';

const options = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python', description: 'A general-purpose language' },
  { value: 'cobol', label: 'COBOL', disabled: true },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function openDropdown() {
  fireEvent.click(screen.getByRole('combobox'));

  return screen.getByRole('textbox');
}

describe('FilterableMultiSelectDropdown', () => {
  describe('rendering', () => {
    it('renders the placeholder when nothing is selected', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          placeholder="Choose languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Choose languages');
    });

    it('shows the single label when exactly one value is selected', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['ts']}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('TypeScript');
    });

    it('shows a count summary when more than one value is selected', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['js', 'ts']}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('2 selected');
    });

    it('does not render the filter field or listbox until opened', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      expect(screen.queryByRole('textbox')).toBeNull();
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('renders and focuses the filter field, and all options, on open', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      const filter = openDropdown();

      expect(filter).toHaveFocus();
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });
  });

  describe('filtering', () => {
    it('narrows options to those matching the query by label', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      const filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'script' } });

      expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
        expect.stringContaining('JavaScript'),
        expect.stringContaining('TypeScript'),
      ]);
    });

    it('matches against the option description too', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      const filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'general-purpose' } });

      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByRole('option', { name: /Python/ })).toBeInTheDocument();
    });

    it('is case-insensitive', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      const filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'JAVASCRIPT' } });

      expect(screen.getAllByRole('option')).toHaveLength(1);
    });

    it('shows a "No results" message when nothing matches', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      const filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'nonexistent' } });

      expect(screen.queryAllByRole('option')).toHaveLength(0);
      expect(screen.getByText('No results')).toBeInTheDocument();
    });

    it('keeps a value selected even once its option is filtered out', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['js']}
          onChange={onChange}
        />,
      );

      const filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'python' } });

      expect(screen.getByRole('combobox')).toHaveTextContent('JavaScript');
    });

    it('resets the query when reopened', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      let filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'python' } });
      fireEvent.keyDown(filter, { key: 'Escape' });

      filter = openDropdown();
      expect(filter).toHaveValue('');
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });
  });

  describe('toggling selection', () => {
    it('adds a value when an unselected option is clicked', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      openDropdown();
      fireEvent.click(screen.getByRole('option', { name: 'TypeScript' }));

      expect(onChange).toHaveBeenCalledWith(['ts']);
    });

    it('removes a value when a selected option is clicked', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['js', 'ts']}
          onChange={onChange}
        />,
      );

      openDropdown();
      fireEvent.click(screen.getByRole('option', { name: 'TypeScript' }));

      expect(onChange).toHaveBeenCalledWith(['js']);
    });

    it('keeps the listbox open after toggling an option', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      openDropdown();
      fireEvent.click(screen.getByRole('option', { name: 'TypeScript' }));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('does not toggle disabled options', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      openDropdown();
      fireEvent.click(screen.getByRole('option', { name: 'COBOL' }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('marks selected options with aria-selected', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['js']}
          onChange={vi.fn()}
        />,
      );

      openDropdown();

      expect(screen.getByRole('option', { name: 'JavaScript' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('option', { name: 'TypeScript' })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });
  });

  describe('keyboard interaction', () => {
    it('toggles the active (first) option with Enter from the filter field', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      const filter = openDropdown();
      fireEvent.keyDown(filter, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(['js']);
    });

    it('ArrowDown moves the active option before Enter toggles it', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      const filter = openDropdown();
      fireEvent.keyDown(filter, { key: 'ArrowDown' });
      fireEvent.keyDown(filter, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(['ts']);
    });

    it('toggles the active option among filtered results, not the full list', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      const filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'python' } });
      fireEvent.keyDown(filter, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(['py']);
    });

    it('a space in the filter field is treated as text, not a toggle shortcut', () => {
      const onChange = vi.fn();

      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      const filter = openDropdown();
      fireEvent.change(filter, { target: { value: 'general purpose' } });

      expect(onChange).not.toHaveBeenCalled();
      expect(filter).toHaveValue('general purpose');
    });

    it('closes on Escape and returns focus to the trigger', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      const filter = openDropdown();
      fireEvent.keyDown(filter, { key: 'Escape' });

      expect(screen.queryByRole('listbox')).toBeNull();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });

  describe('disabled', () => {
    it('disables the trigger', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
          disabled
        />,
      );

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('does not open when disabled', () => {
      render(
        <FilterableMultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
          disabled
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });
});
