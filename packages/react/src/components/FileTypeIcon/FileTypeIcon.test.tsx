import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FileTypeIcon } from './FileTypeIcon';

describe('FileTypeIcon', () => {
  describe('rendering', () => {
    it('renders with role=img', () => {
      render(<FileTypeIcon name="report.pdf" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders an icon svg by default', () => {
      const { container } = render(<FileTypeIcon name="report.pdf" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
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
    ])('resolves %s to "%s"', (name, expectedLabel) => {
      render(<FileTypeIcon name={name} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', expectedLabel);
    });

    it('falls back to the generic file label for an unknown extension', () => {
      render(<FileTypeIcon name="data.xyz123" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'File');
    });

    it('falls back to the generic file label for a name with no extension', () => {
      render(<FileTypeIcon name="README" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'File');
    });

    it('is case-insensitive', () => {
      render(<FileTypeIcon name="PHOTO.PNG" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Image file');
    });

    it('does not treat a leading dot (dotfile) as an extension', () => {
      render(<FileTypeIcon name=".gitignore" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'File');
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
    ])('resolves %s to "%s"', (mimeType, expectedLabel) => {
      render(<FileTypeIcon mimeType={mimeType} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', expectedLabel);
    });

    it('falls back to the generic file label for an unrecognized MIME type', () => {
      render(<FileTypeIcon mimeType="application/octet-stream" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'File');
    });

    it('takes precedence over name when both are provided', () => {
      render(<FileTypeIcon name="photo.png" mimeType="application/pdf" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'PDF document');
    });
  });

  describe('isFolder', () => {
    it('renders the folder label regardless of name', () => {
      render(<FileTypeIcon name="photo.png" isFolder />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Folder');
    });
  });

  describe('thumbnail', () => {
    it('renders an image instead of the resolved icon when thumbnail is provided', () => {
      const { container } = render(<FileTypeIcon name="photo.png" thumbnail="/preview.jpg" />);

      const img = container.querySelector('img');

      expect(img).toHaveAttribute('src', '/preview.jpg');
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    it('the thumbnail image has an empty alt (label carried by the wrapper)', () => {
      const { container } = render(<FileTypeIcon name="photo.png" thumbnail="/preview.jpg" />);
      expect(container.querySelector('img')).toHaveAttribute('alt', '');
    });
  });

  describe('label override', () => {
    it('accepts a custom label', () => {
      render(<FileTypeIcon name="report.pdf" label="Q3 financial report" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Q3 financial report');
    });
  });

  describe('size', () => {
    it('defaults to md', () => {
      render(<FileTypeIcon name="report.pdf" />);
      expect(screen.getByRole('img').className).toMatch(/md/);
    });

    it.each(['sm', 'lg'] as const)('applies %s size', (size) => {
      render(<FileTypeIcon name="report.pdf" size={size} />);
      expect(screen.getByRole('img').className).toMatch(new RegExp(size));
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<FileTypeIcon name="report.pdf" className="custom" />);
      expect(screen.getByRole('img')).toHaveClass('custom');
    });

    it('forwards arbitrary HTML attributes', () => {
      render(<FileTypeIcon name="report.pdf" data-testid="file-icon" />);
      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });
  });
});
