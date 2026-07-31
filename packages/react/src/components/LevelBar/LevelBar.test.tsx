import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LevelBar } from './LevelBar';

describe('LevelBar', () => {
  describe('rendering', () => {
    it('renders with role=meter', () => {
      render(<LevelBar value={0.5} aria-label="Disk usage" />);
      expect(screen.getByRole('meter')).toBeInTheDocument();
    });
  });

  describe('value / range', () => {
    it('sets aria-valuenow / valuemin / valuemax for the default 0–1 range', () => {
      render(<LevelBar value={0.6} aria-label="Level" />);
      const meter = screen.getByRole('meter');

      expect(meter).toHaveAttribute('aria-valuenow', '0.6');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '1');
    });

    it('supports a custom min/max range', () => {
      render(<LevelBar value={50} min={0} max={200} aria-label="Level" />);
      const meter = screen.getByRole('meter');

      expect(meter).toHaveAttribute('aria-valuenow', '50');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '200');
    });

    it('clamps value above max', () => {
      render(<LevelBar value={1.5} aria-label="Level" />);
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '1');
    });

    it('clamps value below min', () => {
      render(<LevelBar value={-0.5} aria-label="Level" />);
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
    });

    it('renders the continuous fill at the correct width', () => {
      const { container } = render(<LevelBar value={0.3} aria-label="Level" />);
      const fill = container.querySelector("[class*='fill']") as HTMLElement;

      expect(fill.style.width).toBe('30%');
    });
  });

  describe('low/high offset zones', () => {
    it('defaults to the accent variant between low and high', () => {
      const { container } = render(
        <LevelBar value={0.5} low={0.25} high={0.75} aria-label="Level" />,
      );
      const fill = container.querySelector("[class*='fill']");

      expect(fill?.className).toMatch(/accent/);
    });

    it('applies the warning (low) variant at or below the low threshold', () => {
      const { container } = render(<LevelBar value={0.2} low={0.25} aria-label="Level" />);
      const fill = container.querySelector("[class*='fill']");

      expect(fill?.className).toMatch(/warning/);
    });

    it('applies the error (high) variant at or above the high threshold', () => {
      const { container } = render(<LevelBar value={0.8} high={0.75} aria-label="Level" />);
      const fill = container.querySelector("[class*='fill']");

      expect(fill?.className).toMatch(/error/);
    });

    it('accepts custom lowVariant/highVariant colours', () => {
      const { container } = render(
        <LevelBar value={0.9} high={0.75} highVariant="success" aria-label="Level" />,
      );
      const fill = container.querySelector("[class*='fill']");

      expect(fill?.className).toMatch(/success/);
    });

    it('does not apply low/high zones when the thresholds are omitted', () => {
      const { container } = render(<LevelBar value={0.01} aria-label="Level" />);
      const fill = container.querySelector("[class*='fill']");

      expect(fill?.className).toMatch(/accent/);
    });
  });

  describe('discrete mode', () => {
    it('renders numBlocks blocks instead of a continuous fill', () => {
      const { container } = render(
        <LevelBar value={0.5} discrete numBlocks={5} aria-label="Signal" />,
      );

      expect(container.querySelectorAll("[class*='block']")).toHaveLength(5);
      expect(container.querySelector("[class*='fill']")).not.toBeInTheDocument();
    });

    it('fills the correct number of blocks for the current value', () => {
      const { container } = render(
        <LevelBar value={0.5} discrete numBlocks={10} aria-label="Signal" />,
      );
      const blocks = Array.from(container.querySelectorAll("[class*='block']"));
      const filled = blocks.filter((b) => b.className.match(/accent/));

      expect(filled).toHaveLength(5);
    });

    it('hides discrete blocks from the accessibility tree', () => {
      const { container } = render(<LevelBar value={0.5} discrete aria-label="Signal" />);
      const blocks = container.querySelectorAll("[class*='block']");

      blocks.forEach((block) => expect(block).toHaveAttribute('aria-hidden', 'true'));
    });

    it('defaults numBlocks to 10', () => {
      const { container } = render(<LevelBar value={0.5} discrete aria-label="Signal" />);
      expect(container.querySelectorAll("[class*='block']")).toHaveLength(10);
    });
  });

  describe('accessibility', () => {
    it('sets aria-label', () => {
      render(<LevelBar value={0.5} aria-label="Battery level" />);
      expect(screen.getByRole('meter')).toHaveAttribute('aria-label', 'Battery level');
    });

    it('sets aria-labelledby', () => {
      render(<LevelBar value={0.5} aria-labelledby="label-id" />);
      expect(screen.getByRole('meter')).toHaveAttribute('aria-labelledby', 'label-id');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<LevelBar value={0.5} aria-label="Level" className="custom" />);
      expect(screen.getByRole('meter')).toHaveClass('custom');
    });

    it('forwards arbitrary HTML attributes', () => {
      render(<LevelBar value={0.5} aria-label="Level" data-testid="disk-level" />);
      expect(screen.getByTestId('disk-level')).toBeInTheDocument();
    });
  });
});
