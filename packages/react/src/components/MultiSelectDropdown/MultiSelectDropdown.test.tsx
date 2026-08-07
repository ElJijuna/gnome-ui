import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { MultiSelectDropdown } from './MultiSelectDropdown';

const options = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python', description: 'A general-purpose language' },
  { value: 'cobol', label: 'COBOL', disabled: true },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('MultiSelectDropdown', () => {
  describe('rendering', () => {
    it('applies aria-label to the combobox trigger itself, not a wrapper element', () => {
      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('combobox', { name: 'Languages' })).toBeInTheDocument();
    });

    it('renders the placeholder when nothing is selected', () => {
      render(
        <MultiSelectDropdown
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
        <MultiSelectDropdown
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
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['js', 'ts']}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('2 selected');
    });

    it('sets aria-multiselectable on the listbox', () => {
      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  describe('toggling selection', () => {
    it('adds a value when an unselected option is clicked', () => {
      const onChange = vi.fn();

      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'TypeScript' }));

      expect(onChange).toHaveBeenCalledWith(['ts']);
    });

    it('removes a value when a selected option is clicked', () => {
      const onChange = vi.fn();

      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['js', 'ts']}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'TypeScript' }));

      expect(onChange).toHaveBeenCalledWith(['js']);
    });

    it('keeps the listbox open after toggling an option', () => {
      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'TypeScript' }));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('does not toggle disabled options', () => {
      const onChange = vi.fn();

      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'COBOL' }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('marks selected options with aria-selected', () => {
      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={['js']}
          onChange={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));

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
    it('opens with ArrowDown and toggles the active option with Enter', () => {
      const onChange = vi.fn();

      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={onChange}
        />,
      );

      const trigger = screen.getByRole('combobox');

      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(['js']);
    });

    it('toggles multiple options across successive keypresses without closing', () => {
      const onChange = vi.fn();
      let value: string[] = [];

      const { rerender } = render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={value}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
      expect(onChange).toHaveBeenLastCalledWith(['js']);

      value = ['js'];
      rerender(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={value}
          onChange={onChange}
        />,
      );

      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
      expect(onChange).toHaveBeenLastCalledWith(['js', 'ts']);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes on Escape', () => {
      render(
        <MultiSelectDropdown
          aria-label="Languages"
          options={options}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });

      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('disabled', () => {
    it('disables the trigger', () => {
      render(
        <MultiSelectDropdown
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
        <MultiSelectDropdown
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
