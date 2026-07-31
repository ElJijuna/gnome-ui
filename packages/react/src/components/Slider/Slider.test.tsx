import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { Slider } from './Slider';

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

describe('Slider', () => {
  describe('rendering', () => {
    it('renders a role=slider with the current value', () => {
      render(<Slider value={50} onChange={vi.fn()} aria-label="Volume" />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-valuenow', '50');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    it('respects custom min/max', () => {
      render(<Slider value={5} min={-10} max={10} onChange={vi.fn()} aria-label="Balance" />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-valuemin', '-10');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });

    it('renders tick marks and labels', () => {
      render(
        <Slider
          value={50}
          onChange={vi.fn()}
          aria-label="Volume"
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
        <Slider value={50} onChange={vi.fn()} aria-label="Volume" marks={[{ value: 50 }]} />,
      );

      expect(container.querySelector('[class*="labels"]')).toBeNull();
    });
  });

  describe('pointer interaction', () => {
    it('sets the value from a pointerdown position on the track', () => {
      const onChange = vi.fn();

      render(<Slider value={0} min={0} max={100} onChange={onChange} aria-label="Volume" />);
      const slider = screen.getByRole('slider');
      mockTrackRect(slider);

      fireEvent.pointerDown(slider, { clientX: 100, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith(50);
    });

    it('updates the value while dragging (pointermove) once capture is active', () => {
      const onChange = vi.fn();

      render(<Slider value={0} min={0} max={100} onChange={onChange} aria-label="Volume" />);
      const slider = screen.getByRole('slider');
      mockTrackRect(slider);

      fireEvent.pointerDown(slider, { clientX: 0, pointerId: 1 });
      fireEvent.pointerMove(slider, { clientX: 150, pointerId: 1 });

      expect(onChange).toHaveBeenLastCalledWith(75);
    });

    it('clamps values to min/max', () => {
      const onChange = vi.fn();

      render(<Slider value={0} min={0} max={100} onChange={onChange} aria-label="Volume" />);
      const slider = screen.getByRole('slider');
      mockTrackRect(slider);

      fireEvent.pointerDown(slider, { clientX: 1000, pointerId: 1 });
      expect(onChange).toHaveBeenCalledWith(100);
    });

    it('snaps to the configured step', () => {
      const onChange = vi.fn();

      render(<Slider value={0} min={0} max={100} step={10} onChange={onChange} aria-label="Volume" />);
      const slider = screen.getByRole('slider');
      mockTrackRect(slider);

      // 53% of the track -> raw 53, snapped to the nearest multiple of 10 -> 50
      fireEvent.pointerDown(slider, { clientX: 106, pointerId: 1 });
      expect(onChange).toHaveBeenCalledWith(50);
    });

    it('ignores pointerdown when disabled', () => {
      const onChange = vi.fn();

      render(
        <Slider value={0} min={0} max={100} disabled onChange={onChange} aria-label="Volume" />,
      );
      const slider = screen.getByRole('slider');
      mockTrackRect(slider);

      fireEvent.pointerDown(slider, { clientX: 100, pointerId: 1 });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard interaction', () => {
    it('ArrowRight/ArrowLeft move by one step', async () => {
      const onChange = vi.fn();

      render(<Slider value={50} onChange={onChange} aria-label="Volume" />);
      screen.getByRole('slider').focus();

      await userEvent.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenLastCalledWith(51);

      await userEvent.keyboard('{ArrowLeft}');
      expect(onChange).toHaveBeenLastCalledWith(49);
    });

    it('PageUp/PageDown move by 10 steps', async () => {
      const onChange = vi.fn();

      render(<Slider value={50} onChange={onChange} aria-label="Volume" />);
      screen.getByRole('slider').focus();

      await userEvent.keyboard('{PageUp}');
      expect(onChange).toHaveBeenLastCalledWith(60);

      await userEvent.keyboard('{PageDown}');
      expect(onChange).toHaveBeenLastCalledWith(40);
    });

    it('Home/End jump to min/max', async () => {
      const onChange = vi.fn();

      render(<Slider value={50} min={0} max={100} onChange={onChange} aria-label="Volume" />);
      screen.getByRole('slider').focus();

      await userEvent.keyboard('{End}');
      expect(onChange).toHaveBeenLastCalledWith(100);

      await userEvent.keyboard('{Home}');
      expect(onChange).toHaveBeenLastCalledWith(0);
    });

    it('does not respond to keyboard input when disabled', async () => {
      const onChange = vi.fn();

      render(<Slider value={50} disabled onChange={onChange} aria-label="Volume" />);
      const slider = screen.getByRole('slider');

      slider.focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('sets aria-disabled and removes it from the tab order', () => {
      render(<Slider value={50} disabled onChange={vi.fn()} aria-label="Volume" />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-disabled', 'true');
      expect(slider).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper', () => {
      const { container } = render(
        <Slider value={50} onChange={vi.fn()} aria-label="Volume" className="custom" />,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards aria-labelledby and aria-describedby', () => {
      render(
        <Slider
          value={50}
          onChange={vi.fn()}
          aria-labelledby="label-id"
          aria-describedby="desc-id"
        />,
      );
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-labelledby', 'label-id');
      expect(slider).toHaveAttribute('aria-describedby', 'desc-id');
    });
  });
});
