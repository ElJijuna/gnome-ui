import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CheckRow } from './CheckRow';

describe('CheckRow', () => {
  describe('rendering', () => {
    it('renders title and subtitle', () => {
      render(<CheckRow title="Wi-Fi" subtitle="Home Network" />);

      expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Home Network')).toBeInTheDocument();
    });

    it('renders as a button with role=checkbox', () => {
      render(<CheckRow title="Wi-Fi" />);
      const row = screen.getByRole('checkbox');

      expect(row.tagName).toBe('BUTTON');
    });

    it('renders leading content', () => {
      render(<CheckRow title="Bluetooth" leading={<span data-testid="leading">B</span>} />);
      expect(screen.getByTestId('leading')).toBeInTheDocument();
    });

    it('labels the checkbox via aria-labelledby pointing at the title/subtitle content', () => {
      render(<CheckRow title="Wi-Fi" />);
      const row = screen.getByRole('checkbox');
      const labelId = row.getAttribute('aria-labelledby');

      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId as string)).toHaveTextContent('Wi-Fi');
    });
  });

  describe('checked state', () => {
    it('is unchecked by default', () => {
      render(<CheckRow title="Wi-Fi" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });

    it('is checked when defaultChecked is true', () => {
      render(<CheckRow title="Wi-Fi" defaultChecked />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('reflects a controlled checked prop', () => {
      render(<CheckRow title="Wi-Fi" checked onCheckedChange={() => {}} />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('does not change on click when controlled', async () => {
      const onCheckedChange = vi.fn();

      render(<CheckRow title="Wi-Fi" checked={false} onCheckedChange={onCheckedChange} />);
      await userEvent.click(screen.getByRole('checkbox'));

      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('interactions', () => {
    it('toggles checked state on click when uncontrolled', async () => {
      render(<CheckRow title="Wi-Fi" />);
      const row = screen.getByRole('checkbox');

      await userEvent.click(row);
      expect(row).toHaveAttribute('aria-checked', 'true');

      await userEvent.click(row);
      expect(row).toHaveAttribute('aria-checked', 'false');
    });

    it('calls onCheckedChange with the next value on click', async () => {
      const onCheckedChange = vi.fn();

      render(<CheckRow title="Wi-Fi" onCheckedChange={onCheckedChange} />);
      await userEvent.click(screen.getByRole('checkbox'));

      expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('calls the forwarded onClick handler too', async () => {
      const onClick = vi.fn();

      render(<CheckRow title="Wi-Fi" onClick={onClick} />);
      await userEvent.click(screen.getByRole('checkbox'));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not toggle when disabled', async () => {
      const onCheckedChange = vi.fn();

      render(<CheckRow title="Wi-Fi" disabled onCheckedChange={onCheckedChange} />);
      await userEvent.click(screen.getByRole('checkbox'), { pointerEventsCheck: 0 });

      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<CheckRow title="Wi-Fi" className="custom" />);
      expect(screen.getByRole('checkbox')).toHaveClass('custom');
    });

    it('is disabled when disabled prop is set', () => {
      render(<CheckRow title="Wi-Fi" disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });
});
