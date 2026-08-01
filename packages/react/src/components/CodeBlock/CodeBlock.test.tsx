import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CodeBlock } from './CodeBlock';

let user: ReturnType<typeof userEvent.setup>;
let writeTextSpy: MockInstance<Clipboard['writeText']>;

beforeEach(() => {
  user = userEvent.setup();
  writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const SAMPLE = 'const a = 1;\nconst b = 2;';

describe('CodeBlock', () => {
  describe('rendering', () => {
    it('renders each line of code', () => {
      render(<CodeBlock code={SAMPLE} />);

      expect(screen.getByText('const a = 1;')).toBeInTheDocument();
      expect(screen.getByText('const b = 2;')).toBeInTheDocument();
    });

    it('preserves blank lines', () => {
      const { container } = render(<CodeBlock code={'a\n\nb'} />);
      expect(container.querySelectorAll('code > span')).toHaveLength(3);
    });

    it('renders the filename in the header', () => {
      render(<CodeBlock code={SAMPLE} filename="index.ts" />);
      expect(screen.getByText('index.ts')).toBeInTheDocument();
    });

    it('renders the language in the header', () => {
      render(<CodeBlock code={SAMPLE} language="TypeScript" />);
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('omits the header when there is no filename, language, or copy button', () => {
      const { container } = render(<CodeBlock code={SAMPLE} copyable={false} />);
      expect(container.querySelector('[class*="header"]')).not.toBeInTheDocument();
    });

    it('renders the header when only copyable is true', () => {
      const { container } = render(<CodeBlock code={SAMPLE} />);
      expect(container.querySelector('[class*="header"]')).toBeInTheDocument();
    });
  });

  describe('line numbers', () => {
    it('does not show line numbers by default', () => {
      render(<CodeBlock code={SAMPLE} />);
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('shows line numbers when lineNumbers is true', () => {
      render(<CodeBlock code={SAMPLE} lineNumbers />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('copying', () => {
    it('renders a copy button by default', () => {
      render(<CodeBlock code={SAMPLE} />);
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    });

    it('omits the copy button when copyable is false', () => {
      render(<CodeBlock code={SAMPLE} filename="index.ts" copyable={false} />);
      expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
    });

    it('copies the full code string when clicked', async () => {
      render(<CodeBlock code={SAMPLE} />);
      await user.click(screen.getByRole('button', { name: 'Copy' }));

      expect(writeTextSpy).toHaveBeenCalledExactlyOnceWith(SAMPLE);
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the block', () => {
      const { container } = render(<CodeBlock code={SAMPLE} className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<CodeBlock code={SAMPLE} data-testid="snippet" />);
      expect(screen.getByTestId('snippet')).toBeInTheDocument();
    });
  });
});
