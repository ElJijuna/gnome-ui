import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ComboRow } from './ComboRow';

const options = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Follow system' },
  { value: 'locked', label: 'Locked', disabled: true },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ComboRow', () => {
  describe('rendering', () => {
    it('renders title and subtitle', () => {
      render(<ComboRow title="Theme" subtitle="Appearance" options={options} />);

      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    it('renders leading content', () => {
      render(<ComboRow title="Theme" leading={<span data-testid="leading">T</span>} options={options} />);
      expect(screen.getByTestId('leading')).toBeInTheDocument();
    });

    it('shows a placeholder dash when nothing is selected', () => {
      render(<ComboRow title="Theme" options={options} />);
      expect(screen.getByRole('combobox')).toHaveTextContent('—');
    });

    it('shows the selected option label', () => {
      render(<ComboRow title="Theme" options={options} value="dark" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('Dark');
    });

    it('is closed by default', () => {
      render(<ComboRow title="Theme" options={options} />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('opening and selecting', () => {
    it('opens the option list on trigger click', () => {
      render(<ComboRow title="Theme" options={options} />);

      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Follow system')).toBeInTheDocument();
    });

    it('selects an option on click and closes the list', () => {
      const onValueChange = vi.fn();

      render(<ComboRow title="Theme" options={options} onValueChange={onValueChange} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Dark'));

      expect(onValueChange).toHaveBeenCalledWith('dark');
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('combobox')).toHaveTextContent('Dark');
    });

    it('does not select a disabled option', () => {
      const onValueChange = vi.fn();

      render(<ComboRow title="Theme" options={options} onValueChange={onValueChange} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Locked'));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('toggles closed when the trigger is clicked again while open', () => {
      render(<ComboRow title="Theme" options={options} />);
      const trigger = screen.getByRole('combobox');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not change the displayed value when controlled', () => {
      render(<ComboRow title="Theme" options={options} value="light" onValueChange={() => {}} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Dark'));

      expect(screen.getByRole('combobox')).toHaveTextContent('Light');
    });

    it('closes when clicking outside', () => {
      render(<ComboRow title="Theme" options={options} />);

      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');

      fireEvent.mouseDown(document.body);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('keyboard interactions', () => {
    it('opens with ArrowDown on the trigger', () => {
      render(<ComboRow title="Theme" options={options} />);

      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    });

    it('selects the active option with Enter', () => {
      const onValueChange = vi.fn();

      render(<ComboRow title="Theme" options={options} onValueChange={onValueChange} />);

      const trigger = screen.getByRole('combobox');
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });

      const list = trigger.parentElement?.querySelector('ul') as HTMLElement;
      fireEvent.keyDown(list, { key: 'ArrowDown' });
      fireEvent.keyDown(list, { key: 'Enter' });

      expect(onValueChange).toHaveBeenCalledWith('dark');
    });

    it('closes on Escape without selecting', () => {
      const onValueChange = vi.fn();

      render(<ComboRow title="Theme" options={options} onValueChange={onValueChange} />);

      fireEvent.click(screen.getByRole('combobox'));
      const list = document.querySelector('ul') as HTMLElement;
      fireEvent.keyDown(list, { key: 'Escape' });

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('disables the trigger', () => {
      render(<ComboRow title="Theme" options={options} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('does not open on click when disabled', () => {
      render(<ComboRow title="Theme" options={options} disabled />);

      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(
        <ComboRow title="Theme" options={options} className="custom" />,
      );
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
