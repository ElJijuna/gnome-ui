import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { FileTypeIcon } from './FileTypeIcon';

describe('FileTypeIcon', () => {
  describe('rendering', () => {
    it('renders with role=img', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="report.pdf" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img')).toBeOnTheScreen();
    });
  });

  describe('resolving from a file name extension', () => {
    it.each([
      ['photo.png', 'Image file'],
      ['photo.JPG', 'Image file'],
      ['song.mp3', 'Audio file'],
      ['clip.mp4', 'Video file'],
      ['report.pdf', 'PDF document'],
      ['archive.zip', 'Archive'],
      ['letter.docx', 'Document'],
      ['budget.xlsx', 'Spreadsheet'],
      ['slides.pptx', 'Presentation'],
      ['font.woff2', 'Font file'],
      ['install.sh', 'Executable'],
      ['notes.txt', 'Text file'],
      ['script.ts', 'Text file'],
    ])('resolves %s to "%s"', async (name, expectedLabel) => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name={name} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe(expectedLabel);
    });

    it('falls back to the generic file label for an unknown extension', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="data.xyz123" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('File');
    });

    it('falls back to the generic file label for a name with no extension', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="README" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('File');
    });

    it('is case-insensitive', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="PHOTO.PNG" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('Image file');
    });

    it('does not treat a leading dot (dotfile) as an extension', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name=".gitignore" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('File');
    });
  });

  describe('resolving from a MIME type', () => {
    it.each([
      ['image/png', 'Image file'],
      ['audio/mpeg', 'Audio file'],
      ['video/mp4', 'Video file'],
      ['application/pdf', 'PDF document'],
      ['application/zip', 'Archive'],
      ['application/msword', 'Document'],
      ['application/vnd.ms-excel', 'Spreadsheet'],
      ['application/vnd.ms-powerpoint', 'Presentation'],
      ['font/woff2', 'Font file'],
      ['text/plain', 'Text file'],
      ['inode/directory', 'Folder'],
    ])('resolves %s to "%s"', async (mimeType, expectedLabel) => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon mimeType={mimeType} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe(expectedLabel);
    });

    it('falls back to the generic file label for an unrecognized MIME type', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon mimeType="application/octet-stream" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('File');
    });

    it('takes precedence over name when both are provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="photo.png" mimeType="application/pdf" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('PDF document');
    });
  });

  describe('isFolder', () => {
    it('renders the folder label regardless of name', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="photo.png" isFolder />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('Folder');
    });
  });

  describe('thumbnail', () => {
    it('renders an image instead of the resolved icon when thumbnail is provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="photo.png" thumbnail="https://example.com/preview.jpg" testID="fi" />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('fi-thumbnail').props.source).toEqual({
        uri: 'https://example.com/preview.jpg',
      });
    });

    it('does not render a thumbnail when none is provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="photo.png" testID="fi" />
        </GnomeProvider>,
      );

      expect(screen.queryByTestId('fi-thumbnail')).not.toBeOnTheScreen();
    });
  });

  describe('label override', () => {
    it('accepts a custom label', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="report.pdf" label="Q3 financial report" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('Q3 financial report');
    });
  });

  describe('size', () => {
    it('defaults to md (16px)', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="report.pdf" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img')).toHaveStyle({ width: 16, height: 16 });
    });

    it.each([
      ['sm', 12],
      ['lg', 20],
    ] as const)('applies %s size', async (size, px) => {
      await render(
        <GnomeProvider colorScheme="light">
          <FileTypeIcon name="report.pdf" size={size} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img')).toHaveStyle({ width: px, height: px });
    });
  });
});
