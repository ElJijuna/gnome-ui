import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SegmentedBar } from './SegmentedBar';

const defaultValues = [
  { label: 'TypeScript', value: 60 },
  { label: 'JavaScript', value: 30 },
  { label: 'CSS', value: 10 },
];

describe('SegmentedBar', () => {
  describe('rendering', () => {
    it('renders with role img', () => {
      render(<SegmentedBar values={defaultValues} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('auto-generates aria-label from values', () => {
      render(<SegmentedBar values={defaultValues} />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'TypeScript 60%, JavaScript 30%, CSS 10%',
      );
    });

    it('uses custom aria-label when provided', () => {
      render(<SegmentedBar values={defaultValues} aria-label="Language breakdown" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Language breakdown');
    });

    it('renders one segment per value', () => {
      const track = render(<SegmentedBar values={defaultValues} />).container
        .firstChild as HTMLElement;

      expect(track.children).toHaveLength(3);
    });

    it('forwards className to the track', () => {
      const { container } = render(<SegmentedBar values={defaultValues} className="my-bar" />);

      expect(container.firstChild).toHaveClass('my-bar');
    });
  });

  describe('proportional widths', () => {
    it('sets segment widths as percentage of total', () => {
      const track = render(
        <SegmentedBar
          values={[
            { label: 'A', value: 75 },
            { label: 'B', value: 25 },
          ]}
        />,
      ).container.firstChild as HTMLElement;

      expect((track.children[0] as HTMLElement).style.width).toBe('75%');
      expect((track.children[1] as HTMLElement).style.width).toBe('25%');
    });

    it('normalizes proportionally when values do not sum to 100', () => {
      const track = render(
        <SegmentedBar
          values={[
            { label: 'A', value: 1 },
            { label: 'B', value: 3 },
          ]}
        />,
      ).container.firstChild as HTMLElement;

      expect((track.children[0] as HTMLElement).style.width).toBe('25%'); // 1/4
      expect((track.children[1] as HTMLElement).style.width).toBe('75%'); // 3/4
    });
  });

  describe('custom color', () => {
    it('applies custom color as inline background-color', () => {
      const track = render(
        <SegmentedBar values={[{ label: 'Go', value: 100, color: '#00add8' }]} />,
      ).container.firstChild as HTMLElement;

      expect((track.children[0] as HTMLElement).style.backgroundColor).toBe('rgb(0, 173, 216)');
    });

    it('omits inline background-color when no color is provided', () => {
      const track = render(<SegmentedBar values={[{ label: 'Go', value: 100 }]} />).container
        .firstChild as HTMLElement;

      expect((track.children[0] as HTMLElement).style.backgroundColor).toBe('');
    });
  });

  describe('hover interaction', () => {
    it('marks the hovered segment as highlighted', () => {
      const track = render(<SegmentedBar values={defaultValues} />).container
        .firstChild as HTMLElement;
      const [first] = Array.from(track.children) as HTMLElement[];

      fireEvent.mouseEnter(first);
      expect(first.className).toMatch(/highlighted/);
    });

    it('dims all other segments when one is hovered', () => {
      const track = render(<SegmentedBar values={defaultValues} />).container
        .firstChild as HTMLElement;
      const [first, second, third] = Array.from(track.children) as HTMLElement[];

      fireEvent.mouseEnter(first);
      expect(second.className).toMatch(/dimmed/);
      expect(third.className).toMatch(/dimmed/);
      expect(first.className).not.toMatch(/dimmed/);
    });

    it('clears highlighted and dimmed on mouse leave', () => {
      const track = render(<SegmentedBar values={defaultValues} />).container
        .firstChild as HTMLElement;
      const segments = Array.from(track.children) as HTMLElement[];

      fireEvent.mouseEnter(segments[0]);
      fireEvent.mouseLeave(segments[0]);

      segments.forEach((s) => {
        expect(s.className).not.toMatch(/highlighted/);
        expect(s.className).not.toMatch(/dimmed/);
      });
    });
  });
});
