import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { HeaderBar } from '@/components/HeaderBar';
import { Toolbar } from '@/components/Toolbar';

import { Dropdown } from './Dropdown';

const options = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Follow system', description: 'Use OS setting' },
  { value: 'locked', label: 'Locked', disabled: true },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('Dropdown', () => {
  it('applies aria-label to the combobox trigger itself, not a wrapper element', () => {
    render(<Dropdown aria-label="Colour scheme" options={options} />);

    expect(screen.getByRole('combobox', { name: 'Colour scheme' })).toBeInTheDocument();
  });

  it('renders placeholder when no value is selected', () => {
    render(<Dropdown aria-label="Colour scheme" placeholder="Choose scheme" options={options} />);

    expect(screen.getByRole('combobox')).toHaveTextContent('Choose scheme');
  });

  it('renders selected option label', () => {
    render(<Dropdown aria-label="Colour scheme" value="dark" options={options} />);

    expect(screen.getByRole('combobox')).toHaveTextContent('Dark');
  });

  it('opens and selects an option by click', () => {
    const onChange = vi.fn();

    render(<Dropdown aria-label="Colour scheme" options={options} onChange={onChange} />);

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Dark' }));

    expect(onChange).toHaveBeenCalledWith('dark');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('does not select disabled options', () => {
    const onChange = vi.fn();

    render(<Dropdown aria-label="Colour scheme" options={options} onChange={onChange} />);

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Locked' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens with keyboard and selects the active option', () => {
    const onChange = vi.fn();

    render(<Dropdown aria-label="Colour scheme" options={options} onChange={onChange} />);

    const trigger = screen.getByRole('combobox');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('closes on Escape', () => {
    render(<Dropdown aria-label="Colour scheme" options={options} />);

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('disables the trigger when disabled', () => {
    render(<Dropdown aria-label="Colour scheme" options={options} disabled />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  describe('flat / raised', () => {
    it('uses the regular trigger by default', () => {
      render(<Dropdown aria-label="Scheme" options={options} />);
      expect(screen.getByRole('combobox').className).not.toMatch(/triggerFlat|triggerRaised/);
    });

    it('marks the trigger flat with the flat prop', () => {
      render(<Dropdown aria-label="Scheme" options={options} flat />);
      expect(screen.getByRole('combobox').className).toMatch(/triggerFlat/);
    });

    it('marks the trigger raised with the raised prop', () => {
      render(<Dropdown aria-label="Scheme" options={options} raised />);
      expect(screen.getByRole('combobox').className).toMatch(/triggerRaised/);
    });

    it('renders flat automatically inside a toolbar', () => {
      render(
        <Toolbar>
          <Dropdown aria-label="Scheme" options={options} />
        </Toolbar>,
      );

      expect(getComputedStyle(screen.getByRole('combobox')).backgroundColor).toBe(
        'rgba(0, 0, 0, 0)',
      );
    });

    it('renders flat automatically inside a header bar', () => {
      render(<HeaderBar end={<Dropdown aria-label="Scheme" options={options} />} />);

      expect(getComputedStyle(screen.getByRole('combobox')).backgroundColor).toBe(
        'rgba(0, 0, 0, 0)',
      );
    });

    it('keeps the raised look inside a toolbar with raised', () => {
      render(
        <Toolbar>
          <Dropdown aria-label="Scheme" options={options} raised />
        </Toolbar>,
      );

      expect(getComputedStyle(screen.getByRole('combobox')).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)',
      );
    });

    it('keeps the regular look outside toolbars', () => {
      render(<Dropdown aria-label="Scheme" options={options} />);

      expect(getComputedStyle(screen.getByRole('combobox')).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)',
      );
    });
  });
});
