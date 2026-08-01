import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { StickyToc } from './StickyToc';

const meta: Meta<typeof StickyToc> = {
  title: 'Layout/StickyToc',
  component: StickyToc,
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
type Story = StoryObj<typeof StickyToc>;

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'props', label: 'Props' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'examples', label: 'Examples' },
];

const Section = ({ id, title }: { id: string; title: string }) => (
  <section id={id} style={{ minHeight: '70vh', padding: '24px 0' }}>
    <h2 style={{ margin: '0 0 12px' }}>{title}</h2>
    <p style={{ maxWidth: 560, lineHeight: 1.6, color: 'var(--gnome-window-fg-color)' }}>
      Scroll this page — the highlighted link on the right tracks whichever section is currently
      nearest the top of the viewport.
    </p>
  </section>
);

// ─── Default (scrollable doc page) ─────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: '32px 24px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {sections.map((s) => (
          <Section key={s.id} id={s.id} title={s.label} />
        ))}
      </div>
      <div style={{ width: 200, flexShrink: 0 }}>
        <StickyToc sections={sections} />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Custom label ───────────────────────────────────────────────────────────────

export const CustomLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: '32px 24px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {sections.slice(0, 3).map((s) => (
          <Section key={s.id} id={s.id} title={s.label} />
        ))}
      </div>
      <div style={{ width: 200, flexShrink: 0 }}>
        <StickyToc sections={sections.slice(0, 3)} label="Contents" />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
