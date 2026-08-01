import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { FontPicker } from './FontPicker';

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

const defaultValue = { family: 'Cantarell', size: 11, weight: 400 };

describe('FontPicker', () => {
  describe('trigger', () => {
    it('shows the current family, weight label, and size', () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveTextContent('Cantarell Regular 11');
    });

    it('previews the selection using the actual font family and weight', () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} />);
      const trigger = screen.getByRole('button');

      expect(trigger).toHaveStyle({ fontFamily: 'Cantarell', fontWeight: '400' });
    });

    it('sets a descriptive aria-label on the trigger', () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: 'Font: Cantarell Regular 11' }),
      ).toBeInTheDocument();
    });

    it('uses a custom label prefix', () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} label="Heading font" />);
      expect(
        screen.getByRole('button', { name: 'Heading font: Cantarell Regular 11' }),
      ).toBeInTheDocument();
    });
  });

  describe('opening', () => {
    it('opens the picker when the trigger is clicked', async () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} />);
      fireEvent.click(screen.getByRole('button'));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('renders the default family options', async () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} />);
      fireEvent.click(screen.getByRole('button'));
      const dialog = await screen.findByRole('dialog');

      const [familyCombo] = within(dialog).getAllByRole('combobox');

      fireEvent.click(familyCombo);
      expect(screen.getByRole('option', { name: 'Monospace' })).toBeInTheDocument();
    });

    it('renders a custom family list', async () => {
      render(
        <FontPicker
          value={{ family: 'Inter', size: 11, weight: 400 }}
          onChange={vi.fn()}
          families={['Inter', 'Roboto']}
        />,
      );
      fireEvent.click(screen.getByRole('button'));
      const dialog = await screen.findByRole('dialog');

      const [familyCombo] = within(dialog).getAllByRole('combobox');

      fireEvent.click(familyCombo);
      expect(screen.getByRole('option', { name: 'Roboto' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Cantarell' })).not.toBeInTheDocument();
    });
  });

  describe('changing values', () => {
    it('calls onChange with an updated family, preserving size and weight', async () => {
      const onChange = vi.fn();

      render(<FontPicker value={defaultValue} onChange={onChange} />);
      fireEvent.click(screen.getByRole('button'));
      const dialog = await screen.findByRole('dialog');
      const [familyCombo] = within(dialog).getAllByRole('combobox');

      fireEvent.click(familyCombo);
      fireEvent.click(screen.getByRole('option', { name: 'Monospace' }));

      expect(onChange).toHaveBeenCalledWith({ family: 'Monospace', size: 11, weight: 400 });
    });

    it('calls onChange with an updated numeric weight', async () => {
      const onChange = vi.fn();

      render(<FontPicker value={defaultValue} onChange={onChange} />);
      fireEvent.click(screen.getByRole('button'));
      const dialog = await screen.findByRole('dialog');
      const [, weightCombo] = within(dialog).getAllByRole('combobox');

      fireEvent.click(weightCombo);
      fireEvent.click(screen.getByRole('option', { name: 'Bold' }));

      expect(onChange).toHaveBeenCalledWith({ family: 'Cantarell', size: 11, weight: 700 });
    });

    it('calls onChange with an updated size', async () => {
      const onChange = vi.fn();

      render(<FontPicker value={defaultValue} onChange={onChange} />);
      fireEvent.click(screen.getByRole('button'));
      await screen.findByRole('dialog');

      const spin = screen.getByRole('spinbutton', { name: 'Font size' });

      fireEvent.keyDown(spin, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith({ family: 'Cantarell', size: 12, weight: 400 });
    });

    it('respects minSize/maxSize on the size control', async () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} minSize={8} maxSize={72} />);
      fireEvent.click(screen.getByRole('button'));
      await screen.findByRole('dialog');

      const spin = screen.getByRole('spinbutton', { name: 'Font size' });

      expect(spin).toHaveAttribute('aria-valuemin', '8');
      expect(spin).toHaveAttribute('aria-valuemax', '72');
    });
  });

  describe('disabled', () => {
    it('disables the trigger button', () => {
      render(<FontPicker value={defaultValue} onChange={vi.fn()} disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
