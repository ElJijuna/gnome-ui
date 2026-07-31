import type { Meta, StoryObj } from '@storybook/react';

import readme from './README.md?raw';
import { VisuallyHidden } from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div>
      <p>This paragraph has hidden text right after it:</p>
      <VisuallyHidden>This text is only announced to screen readers.</VisuallyHidden>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The hidden text is present in the DOM and announced by screen readers, but takes up no visual space.',
      },
    },
  },
};

// ─── Icon-only button context ───────────────────────────────────────────────────

export const IconOnlyButtonContext: Story = {
  render: () => (
    <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      ✕<VisuallyHidden>Close dialog</VisuallyHidden>
    </button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Adds an accessible name to an icon-only control without rendering visible text.',
      },
    },
    controls: { disable: true },
  },
};

// ─── Live-region announcement ───────────────────────────────────────────────────

export const LiveRegionAnnouncement: Story = {
  render: () => (
    <VisuallyHidden role="status" aria-live="polite">
      Copied to clipboard
    </VisuallyHidden>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The exact pattern `CopyButton` uses internally for its "Copied!" announcement.',
      },
    },
    controls: { disable: true },
  },
};

// ─── Focusable skip-link ────────────────────────────────────────────────────────

export const FocusableSkipLink: Story = {
  render: () => (
    <div>
      <VisuallyHidden
        as="div"
        focusable
        style={{ padding: 8, background: 'var(--gnome-accent-bg-color, #3584e4)' }}
      >
        <a href="#main-content" style={{ color: '#fff' }}>
          Skip to content
        </a>
      </VisuallyHidden>
      <p style={{ marginTop: 40 }}>Tab into this story to reveal the skip-link above.</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'With `focusable`, the content becomes visible when it (or a nested link) receives keyboard focus — the classic skip-link pattern. Tab into the preview to see it appear.',
      },
    },
    controls: { disable: true },
  },
};
