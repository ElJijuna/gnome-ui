import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { FileTypeIcon } from '../FileTypeIcon';
import { Text } from '../Text';

import { FileDropZone } from './FileDropZone';
import readme from './README.md?raw';

const meta: Meta<typeof FileDropZone> = {
  title: 'Components/FileDropZone',
  component: FileDropZone,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    accept: { control: 'text' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FileDropZone>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [files, setFiles] = useState<File[]>([]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FileDropZone onFilesSelected={(f) => setFiles(f)} multiple />
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {files.map((f) => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTypeIcon name={f.name} size="sm" />
                <Text variant="caption">{f.name}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With helper text and restrictions ──────────────────────────────────────────

export const ImageUploadWithLimits: Story = {
  render: function ImageStory() {
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FileDropZone
          label="Drag an image here or click to browse"
          helperText="PNG or JPG, up to 2 MB"
          accept="image/png,image/jpeg"
          maxSize={2 * 1024 * 1024}
          onFilesSelected={(files) => {
            setError(null);
            setFileName(files[0]?.name ?? null);
          }}
          onError={setError}
        />
        {fileName && (
          <Text variant="caption" color="success">
            Selected: {fileName}
          </Text>
        )}
        {error && (
          <Text variant="caption" color="error">
            {error}
          </Text>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    disabled: true,
    onFilesSelected: () => {},
  },
};
