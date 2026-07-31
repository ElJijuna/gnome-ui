import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { RangeSlider } from './RangeSlider';

beforeAll(() => {
  // jsdom does not implement the Pointer Events capture API.
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => true);
  Element.prototype.releasePointerCapture = vi.fn();
});

function mockTrackRect(track: HTMLElement, { left = 0, width = 200 } = {}) {
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
    left,
    width,
    top: 0,
    height: 20,
    right: left + width,
    bottom: 20,
    x: left,
    y: 0,
    toJSON: () => {},
  });
}

function getTrack(container: HTMLElement) {
  return container.querySelector('[class*="track"]') as HTMLElement;
}

describe('RangeSlider', () => {
  describe('rendering', () => {
    it('renders two role=slider thumbs with the current values', () => {
      render(<RangeSlider value={[20, 80]} onChange={vi.fn()} />);
      const [lower, upper] = screen.getAllByRole('slider');

      expect(lower).toHaveAttribute('aria-valuenow', '20');
      expect(upper).toHaveAttribute('aria-valuenow', '80');
      expect(lower).toHaveAttribute('aria-valuemin', '0');
      expect(upper).toHaveAttribute('aria-valuemax', '100');
    });

    it('labels each thumb accessibly by default', () => {
      render(<RangeSlider value={[20, 80]} onChange={vi.fn()} />);

      expect(screen.getByRole('slider', { name: 'Minimum value' })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Maximum value' })).toBeInTheDocument();
    });

    it('accepts custom thumb labels', () => {
      render(
        <RangeSlider
          value={[20, 80]}
          onChange={vi.fn()}
          minLabel="Minimum price"
          maxLabel="Maximum price"
        />,
      );

      expect(screen.getByRole('slider', { name: 'Minimum price' })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Maximum price' })).toBeInTheDocument();
    });

    it('respects custom min/max', () => {
      render(<RangeSlider value={[-5, 5]} min={-10} max={10} onChange={vi.fn()} />);
      const [lower, upper] = screen.getAllByRole('slider');

      expect(lower).toHaveAttribute('aria-valuemin', '-10');
      expect(upper).toHaveAttribute('aria-valuemax', '10');
    });

    it('renders tick marks and labels', () => {
      render(
        <RangeSlider
          value={[20, 80]}
          onChange={vi.fn()}
          marks={[
            { value: 0, label: 'Min' },
            { value: 100, label: 'Max' },
          ]}
        />,
      );

      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
    });

    it('omits the labels row when marks have no labels', () => {
      const { container } = render(
        <RangeSlider value={[20, 80]} onChange={vi.fn()} marks={[{ value: 50 }]} />,
      );

      expect(container.querySelector('[class*="labels"]')).toBeNull();
    });
  });

  describe('pointer interaction on a thumb', () => {
    it('drags the lower thumb without moving the upper thumb', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      const [lower] = screen.getAllByRole('slider');
      fireEvent.pointerDown(lower, { clientX: 60, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([30, 80]);
    });

    it('drags the upper thumb without moving the lower thumb', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      const [, upper] = screen.getAllByRole('slider');
      fireEvent.pointerDown(upper, { clientX: 140, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([20, 70]);
    });

    it('updates while dragging (pointermove) once capture is active', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      const [lower] = screen.getAllByRole('slider');
      fireEvent.pointerDown(lower, { clientX: 40, pointerId: 1 });
      fireEvent.pointerMove(lower, { clientX: 10, pointerId: 1 });

      expect(onChange).toHaveBeenLastCalledWith([5, 80]);
    });

    it('does not let the lower thumb cross the upper thumb', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      const [lower] = screen.getAllByRole('slider');
      fireEvent.pointerDown(lower, { clientX: 1000, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([80, 80]);
    });

    it('does not let the upper thumb cross the lower thumb', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      const [, upper] = screen.getAllByRole('slider');
      fireEvent.pointerDown(upper, { clientX: -1000, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([20, 20]);
    });

    it('enforces minDistance between thumbs', () => {
      const onChange = vi.fn();

      render(
        <RangeSlider value={[20, 80]} min={0} max={100} minDistance={10} onChange={onChange} />,
      );
      const track = getTrack(document.body);
      mockTrackRect(track);

      const [, upper] = screen.getAllByRole('slider');
      // Try to drag the upper thumb down to 25 (closer to lo=20 than minDistance allows)
      fireEvent.pointerDown(upper, { clientX: 50, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([20, 30]);
    });

    it('ignores pointerdown when disabled', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} disabled onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      const [lower] = screen.getAllByRole('slider');
      fireEvent.pointerDown(lower, { clientX: 60, pointerId: 1 });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('pointer interaction on the track', () => {
    it('jumps the nearest thumb (lower) to the click position', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      fireEvent.pointerDown(track, { clientX: 20, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([10, 80]);
    });

    it('jumps the nearest thumb (upper) to the click position', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      fireEvent.pointerDown(track, { clientX: 180, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([20, 90]);
    });

    it('breaks an equidistant tie in favor of the lower thumb', () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const track = getTrack(document.body);
      mockTrackRect(track);

      // Click at value 50 — 30 away from both 20 and 80
      fireEvent.pointerDown(track, { clientX: 100, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith([50, 80]);
    });
  });

  describe('keyboard interaction', () => {
    it('ArrowRight/ArrowLeft move the focused thumb by one step', async () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} onChange={onChange} />);
      const [lower] = screen.getAllByRole('slider');
      lower.focus();

      await userEvent.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenLastCalledWith([21, 80]);

      await userEvent.keyboard('{ArrowLeft}');
      expect(onChange).toHaveBeenLastCalledWith([19, 80]);
    });

    it('PageUp/PageDown move by 10 steps', async () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} onChange={onChange} />);
      const [, upper] = screen.getAllByRole('slider');
      upper.focus();

      await userEvent.keyboard('{PageUp}');
      expect(onChange).toHaveBeenLastCalledWith([20, 90]);

      await userEvent.keyboard('{PageDown}');
      expect(onChange).toHaveBeenLastCalledWith([20, 70]);
    });

    it('Home/End jump to the opposite bound, clamped by the other thumb', async () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} min={0} max={100} onChange={onChange} />);
      const [lower, upper] = screen.getAllByRole('slider');

      lower.focus();
      await userEvent.keyboard('{End}');
      expect(onChange).toHaveBeenLastCalledWith([80, 80]);

      upper.focus();
      await userEvent.keyboard('{Home}');
      expect(onChange).toHaveBeenLastCalledWith([20, 20]);
    });

    it('does not respond to keyboard input when disabled', async () => {
      const onChange = vi.fn();

      render(<RangeSlider value={[20, 80]} disabled onChange={onChange} />);
      const [lower] = screen.getAllByRole('slider');

      lower.focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('sets aria-disabled and removes both thumbs from the tab order', () => {
      render(<RangeSlider value={[20, 80]} disabled onChange={vi.fn()} />);
      const [lower, upper] = screen.getAllByRole('slider');

      expect(lower).toHaveAttribute('aria-disabled', 'true');
      expect(upper).toHaveAttribute('aria-disabled', 'true');
      expect(lower).toHaveAttribute('tabIndex', '-1');
      expect(upper).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper', () => {
      const { container } = render(
        <RangeSlider value={[20, 80]} onChange={vi.fn()} className="custom" />,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards data attributes to the wrapper', () => {
      render(<RangeSlider value={[20, 80]} onChange={vi.fn()} data-testid="price-range" />);
      expect(screen.getByTestId('price-range')).toBeInTheDocument();
    });
  });
});
