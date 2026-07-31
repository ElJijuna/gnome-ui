import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ColorPicker, ColorSwatch, GNOME_PALETTE } from './ColorPicker';

describe('ColorSwatch', () => {
  it('renders as role=radio with the color as the default label', () => {
    render(<ColorSwatch color="#3584e4" />);
    expect(screen.getByRole('radio', { name: '#3584e4' })).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(<ColorSwatch color="#3584e4" aria-label="Blue" />);
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeInTheDocument();
  });

  it('reflects the selected state via aria-checked', () => {
    render(<ColorSwatch color="#3584e4" selected />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onSelect with its color when clicked', async () => {
    const onSelect = vi.fn();

    render(<ColorSwatch color="#3584e4" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('radio'));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('#3584e4');
  });

  it('can be disabled', () => {
    render(<ColorSwatch color="#3584e4" disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });
});

describe('ColorPicker', () => {
  describe('rendering', () => {
    it('renders as a radiogroup', () => {
      render(<ColorPicker />);
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName('Color');
    });

    it('accepts a custom aria-label', () => {
      render(<ColorPicker aria-label="Accent color" />);
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName('Accent color');
    });

    it('renders a swatch for every color in the default palette', () => {
      render(<ColorPicker />);
      expect(screen.getAllByRole('radio')).toHaveLength(GNOME_PALETTE.length);
    });

    it('renders a swatch for every color in a custom palette', () => {
      render(
        <ColorPicker
          colors={[
            { value: '#ff0000', label: 'Red' },
            { value: '#00ff00', label: 'Green' },
          ]}
        />,
      );

      expect(screen.getAllByRole('radio')).toHaveLength(2);
      expect(screen.getByRole('radio', { name: 'Red' })).toBeInTheDocument();
    });

    it('marks the swatch matching value as checked', () => {
      render(<ColorPicker value="#2ec27e" />);
      expect(screen.getByRole('radio', { name: 'Green' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });

  describe('roving tabindex', () => {
    it('gives the first swatch tabIndex 0 when no value is selected', () => {
      render(<ColorPicker />);
      const radios = screen.getAllByRole('radio');

      expect(radios[0]).toHaveAttribute('tabIndex', '0');
      expect(radios[1]).toHaveAttribute('tabIndex', '-1');
    });

    it('gives the selected swatch tabIndex 0', () => {
      render(<ColorPicker value="#2ec27e" />);
      expect(screen.getByRole('radio', { name: 'Green' })).toHaveAttribute('tabIndex', '0');
      expect(screen.getByRole('radio', { name: 'Blue' })).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('selection', () => {
    it('calls onChange with the swatch color when clicked', async () => {
      const onChange = vi.fn();

      render(<ColorPicker onChange={onChange} />);
      await userEvent.click(screen.getByRole('radio', { name: 'Green' }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith('#2ec27e');
    });

    it('ArrowRight moves focus and selects the next swatch', async () => {
      const onChange = vi.fn();

      render(<ColorPicker value="#3584e4" onChange={onChange} />);
      screen.getByRole('radio', { name: 'Blue' }).focus();

      await userEvent.keyboard('{ArrowRight}');

      expect(screen.getByRole('radio', { name: 'Green' })).toHaveFocus();
      expect(onChange).toHaveBeenCalledWith('#2ec27e');
    });

    it('ArrowLeft wraps from the first to the last swatch', async () => {
      const onChange = vi.fn();

      render(<ColorPicker value="#3584e4" onChange={onChange} />);
      screen.getByRole('radio', { name: 'Blue' }).focus();

      await userEvent.keyboard('{ArrowLeft}');

      const last = GNOME_PALETTE[GNOME_PALETTE.length - 1];
      expect(onChange).toHaveBeenCalledWith(last.value);
    });
  });

  describe('allowCustom', () => {
    it('renders a "Choose custom color" button', () => {
      render(<ColorPicker allowCustom />);
      expect(screen.getByRole('button', { name: 'Choose custom color' })).toBeInTheDocument();
    });

    it('omits the custom button by default', () => {
      render(<ColorPicker />);
      expect(screen.queryByRole('button', { name: 'Choose custom color' })).not.toBeInTheDocument();
    });

    it('clicking the custom button opens the hidden native color input', async () => {
      render(<ColorPicker allowCustom />);

      const nativeInput = document.querySelector('input[type="color"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(nativeInput, 'click');

      await userEvent.click(screen.getByRole('button', { name: 'Choose custom color' }));

      expect(clickSpy).toHaveBeenCalledOnce();
    });

    it('calls onChange when the native color input changes', () => {
      const onChange = vi.fn();

      render(<ColorPicker allowCustom onChange={onChange} />);
      const nativeInput = document.querySelector('input[type="color"]') as HTMLInputElement;

      fireEvent.change(nativeInput, { target: { value: '#abcdef' } });

      expect(onChange).toHaveBeenCalledWith('#abcdef');
    });

    it('shows a selected custom swatch when value is not in the palette', () => {
      render(<ColorPicker allowCustom value="#abcdef" />);
      expect(screen.getByRole('radio', { name: 'Custom color' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('does not show a custom swatch when value matches a palette color', () => {
      render(<ColorPicker allowCustom value="#3584e4" />);
      expect(screen.queryByRole('radio', { name: 'Custom color' })).not.toBeInTheDocument();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<ColorPicker className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
