import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './highlight';

interface HighlightArgs {
  caseSensitive: boolean;
  query: string;
  text: string;
}

function renderHighlight(args: HighlightArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const highlight = document.createElement('gnome-highlight');
  highlight.text = args.text;
  highlight.query = args.query;
  highlight.caseSensitive = args.caseSensitive;

  demo.append(highlight);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Highlight',
  component: 'gnome-highlight',
  tags: ['autodocs'],
  render: renderHighlight,
  args: {
    caseSensitive: false,
    query: 'quick fox',
    text: 'The quick brown fox jumps over the lazy dog.',
  },
  argTypes: {
    caseSensitive: { control: 'boolean' },
    query: {
      control: 'text',
      description: 'Splits on whitespace into individual terms to highlight.',
    },
    text: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Wraps every occurrence of `query` within `text` in a `<mark>` element. Purely presentational — the whole structure is fully rebuilt from `text`/`query`/`case-sensitive`; `query` splits on whitespace into individual terms.',
      },
    },
  },
} satisfies Meta<HighlightArgs>;

export default meta;
type Story = StoryObj<HighlightArgs>;

export const Interactive: Story = {};

export const SingleTerm: Story = {
  args: {
    query: 'lazy',
  },
};

export const CaseSensitive: Story = {
  args: {
    caseSensitive: true,
    query: 'Fox',
    text: 'Fox fox FOX — only the capitalized one should match.',
  },
};

export const NoMatch: Story = {
  args: {
    query: '',
  },
};
