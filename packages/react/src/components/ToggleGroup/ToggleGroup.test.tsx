import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ToggleGroup } from './ToggleGroup';
import { ToggleGroupItem } from './ToggleGroupItem';

const Fixture = ({
  initial = 'list',
  onChange,
}: {
  initial?: string;
  onChange?: (v: string) => void;
}) => {
  const [value, setValue] = useState(initial);

  return (
    <ToggleGroup
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      aria-label="View mode"
    >
      <ToggleGroupItem name="list" label="List" />
      <ToggleGroupItem name="grid" label="Grid" />
      <ToggleGroupItem name="cards" label="Cards" />
    </ToggleGroup>
  );
};

describe('ToggleGroup', () => {
  describe('rendering', () => {
    it('renders a radiogroup with the given aria-label', () => {
      render(<Fixture />);
      expect(screen.getByRole('radiogroup', { name: 'View mode' })).toBeInTheDocument();
    });

    it('renders all items', () => {
      render(<Fixture />);
      expect(screen.getByRole('radio', { name: 'List' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Grid' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Cards' })).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('sets aria-checked=true on the active item', () => {
      render(<Fixture initial="grid" />);
      expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
    });

    it('sets aria-checked=false on inactive items', () => {
      render(<Fixture initial="grid" />);
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('radio', { name: 'Cards' })).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('click selection', () => {
    it("calls onValueChange with the clicked item's name", () => {
      const onChange = vi.fn();

      render(<Fixture onChange={onChange} />);
      fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
      expect(onChange).toHaveBeenCalledWith('grid');
    });

    it('updates active item after click', () => {
      render(<Fixture />);
      fireEvent.click(screen.getByRole('radio', { name: 'Cards' }));
      expect(screen.getByRole('radio', { name: 'Cards' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowRight moves focus to the next item and selects it', () => {
      render(<Fixture initial="list" />);
      const listItem = screen.getByRole('radio', { name: 'List' });

      listItem.focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
      expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
    });

    it('ArrowLeft moves focus to the previous item and selects it', () => {
      render(<Fixture initial="grid" />);
      const gridItem = screen.getByRole('radio', { name: 'Grid' });

      gridItem.focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' });
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    });

    it('Home jumps to the first item', () => {
      render(<Fixture initial="cards" />);
      screen.getByRole('radio', { name: 'Cards' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Home' });
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    });

    it('End jumps to the last item', () => {
      render(<Fixture initial="list" />);
      screen.getByRole('radio', { name: 'List' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'End' });
      expect(screen.getByRole('radio', { name: 'Cards' })).toHaveAttribute('aria-checked', 'true');
    });

    it('ArrowRight wraps from the last item to the first', () => {
      render(<Fixture initial="cards" />);
      screen.getByRole('radio', { name: 'Cards' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('disabled item', () => {
    it('does not call onValueChange when a disabled item is clicked', () => {
      const onChange = vi.fn();

      render(
        <ToggleGroup value="list" onValueChange={onChange} aria-label="Mode">
          <ToggleGroupItem name="list" label="List" />
          <ToggleGroupItem name="grid" label="Grid" disabled />
        </ToggleGroup>,
      );
      fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('ToggleGroupItem throws outside ToggleGroup', () => {
    it('throws when rendered without a ToggleGroup parent', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<ToggleGroupItem name="x" label="X" />)).toThrow(
        'ToggleGroupItem must be used inside ToggleGroup',
      );
      consoleError.mockRestore();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the group root', () => {
      const { container } = render(
        <ToggleGroup value="a" onValueChange={() => {}} className="custom" aria-label="G">
          <ToggleGroupItem name="a" label="A" />
        </ToggleGroup>,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards data attributes to the group root', () => {
      render(
        <ToggleGroup value="a" onValueChange={() => {}} data-testid="tg" aria-label="G">
          <ToggleGroupItem name="a" label="A" />
        </ToggleGroup>,
      );
      expect(screen.getByTestId('tg')).toBeInTheDocument();
    });
  });
});
