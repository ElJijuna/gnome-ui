import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './file-type-icon';

interface FileTypeIconArgs {
  name: string;
  size: 'sm' | 'md' | 'lg';
}

function renderFileTypeIcon(args: FileTypeIconArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const icon = document.createElement('gnome-file-type-icon');
  icon.setAttribute('name', args.name);
  icon.setAttribute('size', args.size);

  demo.append(icon);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/File Type Icon',
  component: 'gnome-file-type-icon',
  tags: ['autodocs'],
  render: renderFileTypeIcon,
  args: {
    name: 'report.pdf',
    size: 'md',
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'File name (e.g. "report.pdf") — resolves the icon from its extension.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Icon size. Defaults to "md".',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Small icon — optionally a thumbnail — resolved from a file's MIME type or name extension. Useful for file-manager-style listings. Falls back to the generic file icon when the type can't be resolved.",
      },
    },
  },
} satisfies Meta<FileTypeIconArgs>;

export default meta;
type Story = StoryObj<FileTypeIconArgs>;

export const Basic: Story = {};

export const AllCategories: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    grid.style.gap = '16px';

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

    for (const name of files) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';
      row.style.minWidth = '0';

      const icon = document.createElement('gnome-file-type-icon');
      icon.setAttribute('name', name);
      icon.setAttribute('size', 'lg');

      const label = document.createElement('span');
      label.textContent = name;
      label.style.fontSize = 'var(--gnome-font-size-caption, 0.75rem)';
      label.style.overflow = 'hidden';
      label.style.textOverflow = 'ellipsis';
      label.style.whiteSpace = 'nowrap';

      row.append(icon, label);
      grid.append(row);
    }

    const folderRow = document.createElement('div');
    folderRow.style.display = 'flex';
    folderRow.style.alignItems = 'center';
    folderRow.style.gap = '8px';

    const folderIcon = document.createElement('gnome-file-type-icon');
    folderIcon.toggleAttribute('is-folder', true);
    folderIcon.setAttribute('size', 'lg');

    const folderLabel = document.createElement('span');
    folderLabel.textContent = 'Documents';
    folderLabel.style.fontSize = 'var(--gnome-font-size-caption, 0.75rem)';

    folderRow.append(folderIcon, folderLabel);
    grid.append(folderRow);

    demo.append(grid);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const FromMimeType: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const icon = document.createElement('gnome-file-type-icon');
    icon.setAttribute('mime-type', 'image/png');
    icon.setAttribute('size', 'md');

    demo.append(icon);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Sizes: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '12px';

    for (const size of ['sm', 'md', 'lg'] as const) {
      const icon = document.createElement('gnome-file-type-icon');
      icon.setAttribute('name', 'report.pdf');
      icon.setAttribute('size', size);
      row.append(icon);
    }

    demo.append(row);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Thumbnail: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const icon = document.createElement('gnome-file-type-icon');
    icon.setAttribute('name', 'sunset.jpg');
    icon.setAttribute('size', 'lg');
    icon.setAttribute(
      'thumbnail',
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%233584e4"/%3E%3C/svg%3E',
    );

    demo.append(icon);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const FileListing: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '8px';
    list.style.maxWidth = '260px';

    const items: { name: string; isFolder?: boolean }[] = [
      { name: 'Documents', isFolder: true },
      { name: 'vacation-photo.jpg' },
      { name: 'invoice-2026.pdf' },
      { name: 'project-notes.txt' },
      { name: 'backup.tar.gz' },
    ];

    for (const item of items) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';

      const icon = document.createElement('gnome-file-type-icon');
      icon.setAttribute('name', item.name);
      icon.toggleAttribute('is-folder', Boolean(item.isFolder));

      const label = document.createElement('span');
      label.textContent = item.name;

      row.append(icon, label);
      list.append(row);
    }

    demo.append(list);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};
