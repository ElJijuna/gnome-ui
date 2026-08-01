import type { Meta, StoryObj } from '@storybook/react';

import { CodeBlock } from './CodeBlock';
import readme from './README.md?raw';

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    code: { control: 'text' },
    filename: { control: 'text' },
    language: { control: 'text' },
    lineNumbers: { control: 'boolean' },
    copyable: { control: 'boolean' },
    wrap: { control: 'boolean' },
  },
  args: {
    code: 'export const greet = (name: string) => {\n  return `Hello, ${name}!`;\n};',
    filename: 'greet.ts',
    language: 'TypeScript',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With line numbers ──────────────────────────────────────────────────────────

export const WithLineNumbers: Story = {
  args: { lineNumbers: true },
};

// ─── Config snippet ─────────────────────────────────────────────────────────────

export const ConfigSnippet: Story = {
  args: {
    filename: 'config.yaml',
    language: 'YAML',
    lineNumbers: true,
    code: 'server:\n  port: 8080\n  host: 0.0.0.0\n\nlogging:\n  level: info',
  },
};

// ─── Shell command ──────────────────────────────────────────────────────────────

export const ShellCommand: Story = {
  args: {
    filename: undefined,
    language: 'bash',
    lineNumbers: false,
    code: 'npm install @gnome-ui/react @gnome-ui/icons',
  },
};

// ─── No header ──────────────────────────────────────────────────────────────────

export const NoHeader: Story = {
  args: {
    filename: undefined,
    language: undefined,
    copyable: false,
    code: 'const x = 42;',
  },
};

// ─── Wrapped long line ───────────────────────────────────────────────────────────

export const WrappedLongLine: Story = {
  args: {
    filename: undefined,
    language: undefined,
    wrap: true,
    code: 'This is a very long single line of prose-like text that would normally require horizontal scrolling, but wraps instead because the `wrap` prop is enabled on this CodeBlock.',
  },
};
