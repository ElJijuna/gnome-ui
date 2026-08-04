import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './file-drop-zone';
import './file-type-icon';
import type { GnomeFileDropZoneElement } from './file-drop-zone';

interface FileDropZoneArgs {
  label: string;
  helperText: string;
  accept: string;
  multiple: boolean;
  disabled: boolean;
}

function renderZone(args: FileDropZoneArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '360px';

  const zone = document.createElement('gnome-file-drop-zone') as GnomeFileDropZoneElement;
  zone.label = args.label;
  zone.helperText = args.helperText;
  zone.accept = args.accept;
  zone.multiple = args.multiple;
  zone.disabled = args.disabled;

  demo.append(zone);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/File Drop Zone',
  component: 'gnome-file-drop-zone',
  tags: ['autodocs'],
  render: renderZone,
  args: {
    label: 'Drag files here or click to browse',
    helperText: '',
    accept: '',
    multiple: false,
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    accept: { control: 'text' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Drag-and-drop file upload target with hover/active states, falling back to a click-to-browse trigger. Fully host-generated — `File` objects can't round-trip through attributes, so selection is entirely event-driven: `gnome-files-selected` fires with the accepted files, `gnome-error` fires once per rejected file.",
      },
    },
  },
} satisfies Meta<FileDropZoneArgs>;

export default meta;
type Story = StoryObj<FileDropZoneArgs>;

export const Default: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.width = '360px';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'column';
    demo.style.gap = '12px';

    const zone = document.createElement('gnome-file-drop-zone') as GnomeFileDropZoneElement;
    zone.multiple = true;

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '6px';

    zone.addEventListener('gnome-files-selected', (event) => {
      for (const file of event.detail.files) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';

        const icon = document.createElement('gnome-file-type-icon');
        icon.setAttribute('name', file.name);
        icon.setAttribute('size', 'sm');

        const name = document.createElement('span');
        name.textContent = file.name;
        name.style.fontSize = 'var(--gnome-font-size-caption, 0.8125rem)';

        row.append(icon, name);
        list.append(row);
      }
    });

    demo.append(zone, list);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const ImageUploadWithLimits: Story = {
  name: 'Image upload with limits',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.width = '360px';
    demo.style.display = 'flex';
    demo.style.flexDirection = 'column';
    demo.style.gap = '8px';

    const zone = document.createElement('gnome-file-drop-zone') as GnomeFileDropZoneElement;
    zone.label = 'Drag an image here or click to browse';
    zone.helperText = 'PNG or JPG, up to 2 MB';
    zone.accept = 'image/png,image/jpeg';
    zone.maxSize = 2 * 1024 * 1024;

    const output = document.createElement('p');
    output.className = 'wc-story__event';
    output.setAttribute('aria-live', 'polite');

    zone.addEventListener('gnome-files-selected', (event) => {
      output.textContent = `Selected: ${event.detail.files[0]?.name ?? ''}`;
      output.style.color = '';
    });
    zone.addEventListener('gnome-error', (event) => {
      output.textContent = event.detail.message;
      output.style.color = 'var(--gnome-error-color, #c01c28)';
    });

    demo.append(zone, output);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Disabled: Story = {
  args: { disabled: true },
};
