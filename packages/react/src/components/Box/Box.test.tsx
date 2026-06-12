import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Box } from './Box';

describe('Box', () => {
  it('renders children', () => {
    render(
      <Box>
        <span>item</span>
      </Box>,
    );
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('renders as a div', () => {
    const { container } = render(<Box />);

    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('defaults to vertical flex layout', () => {
    const { container } = render(<Box />);

    expect((container.firstChild as HTMLElement).style.flexDirection).toBe('column');
  });

  it('renders horizontal when orientation=horizontal', () => {
    const { container } = render(<Box orientation="horizontal" />);

    expect((container.firstChild as HTMLElement).style.flexDirection).toBe('row');
  });

  it('applies spacing as gap', () => {
    const { container } = render(<Box spacing={12} />);

    expect((container.firstChild as HTMLElement).style.gap).toBe('12px');
  });

  it.each([3, 6, 12, 18, 24, 32, 48] as const)(
    'supports the GNOME HIG spacing token %ipx',
    (spacing) => {
      const { container } = render(<Box spacing={spacing} padding={spacing} />);
      const element = container.firstChild as HTMLElement;

      expect(element.style.gap).toBe(`${spacing}px`);
      expect(element.style.padding).toBe(`${spacing}px`);
    },
  );

  it('applies padding when provided', () => {
    const { container } = render(<Box padding={6} />);

    expect((container.firstChild as HTMLElement).style.padding).toBe('6px');
  });

  it('applies justify-content', () => {
    const { container } = render(<Box justify="center" />);

    expect((container.firstChild as HTMLElement).style.justifyContent).toBe('center');
  });

  it('applies align-items', () => {
    const { container } = render(<Box align="end" />);

    expect((container.firstChild as HTMLElement).style.alignItems).toBe('end');
  });

  it('forwards className', () => {
    const { container } = render(<Box className="my-box" />);

    expect(container.firstChild).toHaveClass('my-box');
  });

  it('forwards data-testid', () => {
    render(<Box data-testid="box" />);
    expect(screen.getByTestId('box')).toBeInTheDocument();
  });
});
