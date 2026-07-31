import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Highlight } from './Highlight';

describe('Highlight', () => {
  describe('rendering', () => {
    it('renders the full text', () => {
      render(<Highlight text="Hello world" query="world" />);
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });

    it('wraps the matched term in a <mark>', () => {
      const { container } = render(<Highlight text="Hello world" query="world" />);
      const mark = container.querySelector('mark');

      expect(mark).toBeInTheDocument();
      expect(mark).toHaveTextContent('world');
    });

    it('wraps every occurrence of the term', () => {
      const { container } = render(<Highlight text="cat bat cat mat" query="cat" />);

      expect(container.querySelectorAll('mark')).toHaveLength(2);
    });

    it('renders no <mark> when the term is not found', () => {
      const { container } = render(<Highlight text="Hello world" query="xyz" />);
      expect(container.querySelector('mark')).not.toBeInTheDocument();
    });

    it('renders no <mark> when query is an empty string', () => {
      const { container } = render(<Highlight text="Hello world" query="" />);
      expect(container.querySelector('mark')).not.toBeInTheDocument();
      expect(container.querySelector('span')).toHaveTextContent('Hello world');
    });

    it('ignores whitespace-only terms in a query array', () => {
      const { container } = render(<Highlight text="Hello world" query={['  ', 'world']} />);
      expect(container.querySelectorAll('mark')).toHaveLength(1);
    });
  });

  describe('multiple terms', () => {
    it('highlights every distinct term from an array', () => {
      const { container } = render(
        <Highlight text="The quick brown fox" query={['quick', 'fox']} />,
      );
      const marks = container.querySelectorAll('mark');

      expect(marks).toHaveLength(2);
      expect(marks[0]).toHaveTextContent('quick');
      expect(marks[1]).toHaveTextContent('fox');
    });
  });

  describe('case sensitivity', () => {
    it('matches case-insensitively by default', () => {
      const { container } = render(<Highlight text="Hello World" query="world" />);
      const mark = container.querySelector('mark');

      expect(mark).toHaveTextContent('World');
    });

    it('matches case-sensitively when caseSensitive is set', () => {
      const { container } = render(<Highlight text="Hello World" query="world" caseSensitive />);

      expect(container.querySelector('mark')).not.toBeInTheDocument();
    });

    it('finds a case-sensitive match when the case lines up', () => {
      const { container } = render(<Highlight text="Hello World" query="World" caseSensitive />);

      expect(container.querySelector('mark')).toHaveTextContent('World');
    });
  });

  describe('special characters', () => {
    it('treats regex special characters in the query literally', () => {
      const { container } = render(<Highlight text="a.b (c) [d]" query="(c)" />);
      const mark = container.querySelector('mark');

      expect(mark).toHaveTextContent('(c)');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapping span', () => {
      const { container } = render(
        <Highlight text="Hello world" query="world" className="custom" />,
      );

      expect(container.querySelector('span')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<Highlight text="Hello world" query="world" data-testid="result" />);
      expect(screen.getByTestId('result')).toBeInTheDocument();
    });
  });
});
