import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '@/components/Text';

import { FileTypeIcon } from './FileTypeIcon';
import readme from './README.md?raw';

const meta: Meta<typeof FileTypeIcon> = {
  title: 'Components/FileTypeIcon',
  component: FileTypeIcon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    name: 'report.pdf',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof FileTypeIcon>;

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {};

// ─── All categories ───────────────────────────────────────────────────────────

export const AllCategories: Story = {
  render: () => {
    const files = [
      'photo.png',
      'song.mp3',
      'clip.mp4',
      'report.pdf',
      'archive.zip',
      'letter.docx',
      'budget.xlsx',
      'slides.pptx',
      'font.woff2',
      'install.sh',
      'notes.txt',
      'unknown.xyz',
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {files.map((name) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <FileTypeIcon name={name} size="lg" />
            <Text variant="caption">{name}</Text>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTypeIcon isFolder size="lg" />
          <Text variant="caption">Documents</Text>
        </div>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── From MIME type ───────────────────────────────────────────────────────────

export const FromMimeType: Story = {
  args: { name: undefined, mimeType: 'image/png' },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FileTypeIcon name="report.pdf" size="sm" />
      <FileTypeIcon name="report.pdf" size="md" />
      <FileTypeIcon name="report.pdf" size="lg" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Thumbnail ────────────────────────────────────────────────────────────────

export const Thumbnail: Story = {
  args: {
    name: 'sunset.jpg',
    size: 'lg',
    thumbnail:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%233584e4"/%3E%3C/svg%3E',
  },
};

// ─── File listing use case ────────────────────────────────────────────────────

export const FileListing: Story = {
  render: () => {
    const items = [
      { name: 'Documents', isFolder: true },
      { name: 'vacation-photo.jpg' },
      { name: 'invoice-2026.pdf' },
      { name: 'project-notes.txt' },
      { name: 'backup.tar.gz' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 260 }}>
        {items.map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTypeIcon name={item.name} isFolder={item.isFolder} />
            <Text variant="body">{item.name}</Text>
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
