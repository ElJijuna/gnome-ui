import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressCard } from './ProgressCard';

describe('ProgressCard', () => {
  // ── Tracer bullet ──────────────────────────────────────────────────────────
  it('renders label and accessible progressbar', () => {
    render(<ProgressCard label="Storage" used={42.5} total={128} unit="GB" />);

    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Storage' })).toBeInTheDocument();
  });

  // ── Fill calculation ───────────────────────────────────────────────────────
  it('sets aria-valuenow to the rounded percentage of used/total', () => {
    render(<ProgressCard label="Memory" used={64} total={128} unit="GB" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('clamps aria-valuenow to 100 when used exceeds total', () => {
    render(<ProgressCard label="Memory" used={200} total={128} unit="GB" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  // ── Usage text ─────────────────────────────────────────────────────────────
  it('renders used / total unit text', () => {
    render(<ProgressCard label="Storage" used={42.5} total={128} unit="GB" />);

    expect(screen.getByText('42.5 / 128 GB')).toBeInTheDocument();
  });

  // ── Optional icon ──────────────────────────────────────────────────────────
  it('renders icon as decorative when provided', () => {
    render(
      <ProgressCard
        label="Storage"
        used={42.5}
        total={128}
        unit="GB"
        icon={<span data-testid="drive-icon" />}
      />,
    );

    const icon = screen.getByTestId('drive-icon');

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders without icon when omitted', () => {
    const { container } = render(
      <ProgressCard label="Storage" used={42.5} total={128} unit="GB" />,
    );

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  // ── Color thresholds ───────────────────────────────────────────────────────
  it('uses accent variant below 75%', () => {
    render(<ProgressCard label="CPU" used={50} total={100} unit="%" />);

    const bar = screen.getByRole('progressbar');

    expect(bar.querySelector('[class*="accent"]')).toBeInTheDocument();
    expect(bar.querySelector('[class*="warning"]')).toBeNull();
    expect(bar.querySelector('[class*="error"]')).toBeNull();
  });

  it('uses warning variant at exactly 75%', () => {
    render(<ProgressCard label="CPU" used={75} total={100} unit="%" />);

    const bar = screen.getByRole('progressbar');

    expect(bar.querySelector('[class*="warning"]')).toBeInTheDocument();
  });

  it('uses warning variant between 75% and 90%', () => {
    render(<ProgressCard label="CPU" used={80} total={100} unit="%" />);

    const bar = screen.getByRole('progressbar');

    expect(bar.querySelector('[class*="warning"]')).toBeInTheDocument();
  });

  it('uses error variant at exactly 90%', () => {
    render(<ProgressCard label="CPU" used={90} total={100} unit="%" />);

    const bar = screen.getByRole('progressbar');

    expect(bar.querySelector('[class*="error"]')).toBeInTheDocument();
  });

  it('uses error variant above 90%', () => {
    render(<ProgressCard label="Disk" used={95} total={100} unit="%" />);

    const bar = screen.getByRole('progressbar');

    expect(bar.querySelector('[class*="error"]')).toBeInTheDocument();
  });

  // ── Loading skeleton ───────────────────────────────────────────────────────
  it('renders skeleton and aria-busy when loading=true', () => {
    render(
      <ProgressCard label="Storage" used={42} total={128} unit="GB" loading data-testid="card" />,
    );

    expect(screen.getByTestId('card')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Storage')).toBeNull();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders spinner when loading and loadingType=spinner', () => {
    render(
      <ProgressCard
        label="Storage"
        used={42}
        total={128}
        unit="GB"
        loading
        loadingType="spinner"
        data-testid="card"
      />,
    );

    expect(screen.getByTestId('card')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // ── Forwarded attrs ────────────────────────────────────────────────────────
  it('forwards className, style, and data attributes to the root', () => {
    render(
      <ProgressCard
        label="Storage"
        used={42.5}
        total={128}
        unit="GB"
        className="custom"
        style={{ width: 300 }}
        data-testid="card"
      />,
    );

    const root = screen.getByTestId('card');

    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({ width: '300px' });
  });
});
