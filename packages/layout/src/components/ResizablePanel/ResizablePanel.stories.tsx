import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import readme from './README.md?raw';
import { ResizablePanel } from './ResizablePanel';

const meta: Meta<typeof ResizablePanel> = {
  title: 'Layout/ResizablePanel',
  component: ResizablePanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResizablePanel>;

const paneStyle = (bg: string): CSSProperties => ({
  height: '100%',
  padding: 16,
  boxSizing: 'border-box',
  background: bg,
  color: 'var(--gnome-window-fg-color)',
});

// ─── File explorer + editor ─────────────────────────────────────────────────────

export const FileExplorerAndEditor: Story = {
  render: () => (
    <div style={{ height: '60vh' }}>
      <ResizablePanel direction="horizontal" defaultSizes={[25, 75]} minSize={15}>
        <div style={paneStyle('var(--gnome-card-bg-color)')}>
          <strong>Files</strong>
          <ul>
            <li>src/</li>
            <li>package.json</li>
            <li>README.md</li>
          </ul>
        </div>
        <div style={paneStyle('var(--gnome-view-bg-color)')}>
          <strong>Editor</strong>
          <p>Drag the divider on the left to resize the file tree.</p>
        </div>
      </ResizablePanel>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Three panels ───────────────────────────────────────────────────────────────

export const ThreePanels: Story = {
  render: () => (
    <div style={{ height: '60vh' }}>
      <ResizablePanel direction="horizontal" defaultSizes={[20, 50, 30]} minSize={10}>
        <div style={paneStyle('var(--gnome-card-bg-color)')}>Sidebar</div>
        <div style={paneStyle('var(--gnome-view-bg-color)')}>Content</div>
        <div style={paneStyle('var(--gnome-card-bg-color)')}>Inspector</div>
      </ResizablePanel>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Each divider only resizes the two panels immediately adjacent to it.',
      },
    },
  },
};

// ─── Vertical ───────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => (
    <div style={{ height: '60vh' }}>
      <ResizablePanel direction="vertical" defaultSizes={[60, 40]} minSize={15}>
        <div style={paneStyle('var(--gnome-view-bg-color)')}>Preview</div>
        <div style={paneStyle('var(--gnome-card-bg-color)')}>Console</div>
      </ResizablePanel>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Minimum size ───────────────────────────────────────────────────────────────

export const MinimumSize: Story = {
  render: () => (
    <div style={{ height: '60vh' }}>
      <ResizablePanel direction="horizontal" defaultSizes={[50, 50]} minSize={30}>
        <div style={paneStyle('var(--gnome-card-bg-color)')}>Min 30%</div>
        <div style={paneStyle('var(--gnome-view-bg-color)')}>Min 30%</div>
      </ResizablePanel>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Neither panel can be dragged below 30% of the container.' },
    },
  },
};
