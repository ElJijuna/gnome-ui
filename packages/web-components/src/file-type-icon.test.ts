import { describe, expect, it } from 'vitest';

import { GnomeFileTypeIconElement } from './file-type-icon';

function renderFileTypeIcon(setup?: (el: GnomeFileTypeIconElement) => void) {
  const icon = document.createElement('gnome-file-type-icon') as GnomeFileTypeIconElement;
  setup?.(icon);
  document.body.append(icon);

  return icon;
}

describe('GnomeFileTypeIconElement', () => {
  it('registers the custom element', () => {
    renderFileTypeIcon((el) => {
      el.name = 'report.pdf';
    });
    expect(customElements.get('gnome-file-type-icon')).toBe(GnomeFileTypeIconElement);
  });

  it('renders with role=img', () => {
    const icon = renderFileTypeIcon((el) => {
      el.name = 'report.pdf';
    });
    expect(icon.getAttribute('role')).toBe('img');
  });

  it('renders an svg icon by default', () => {
    const icon = renderFileTypeIcon((el) => {
      el.name = 'report.pdf';
    });
    expect(icon.querySelector('svg')).not.toBeNull();
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
      const icon = renderFileTypeIcon((el) => {
        el.name = name;
      });
      expect(icon.getAttribute('aria-label')).toBe(expectedLabel);
    });

    it('falls back to the generic file label for an unknown extension', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'data.xyz123';
      });
      expect(icon.getAttribute('aria-label')).toBe('File');
    });

    it('falls back to the generic file label for a name with no extension', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'README';
      });
      expect(icon.getAttribute('aria-label')).toBe('File');
    });

    it('is case-insensitive', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'PHOTO.PNG';
      });
      expect(icon.getAttribute('aria-label')).toBe('Image file');
    });

    it('does not treat a leading dot (dotfile) as an extension', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = '.gitignore';
      });
      expect(icon.getAttribute('aria-label')).toBe('File');
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
      const icon = renderFileTypeIcon((el) => {
        el.mimeType = mimeType;
      });
      expect(icon.getAttribute('aria-label')).toBe(expectedLabel);
    });

    it('falls back to the generic file label for an unrecognized MIME type', () => {
      const icon = renderFileTypeIcon((el) => {
        el.mimeType = 'application/octet-stream';
      });
      expect(icon.getAttribute('aria-label')).toBe('File');
    });

    it('takes precedence over name when both are provided', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'photo.png';
        el.mimeType = 'application/pdf';
      });
      expect(icon.getAttribute('aria-label')).toBe('PDF document');
    });
  });

  describe('isFolder', () => {
    it('renders the folder label regardless of name', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'photo.png';
        el.isFolder = true;
      });
      expect(icon.getAttribute('aria-label')).toBe('Folder');
    });
  });

  describe('thumbnail', () => {
    it('renders an image instead of the resolved icon when thumbnail is provided', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'photo.png';
        el.thumbnail = '/preview.jpg';
      });

      const img = icon.querySelector('img');
      expect(img?.getAttribute('src')).toBe('/preview.jpg');
      expect(icon.querySelector('svg')).toBeNull();
    });

    it('the thumbnail image has an empty alt (label carried by the wrapper)', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'photo.png';
        el.thumbnail = '/preview.jpg';
      });
      expect(icon.querySelector('img')?.getAttribute('alt')).toBe('');
    });
  });

  describe('label override', () => {
    it('accepts a custom label', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'report.pdf';
        el.label = 'Q3 financial report';
      });
      expect(icon.getAttribute('aria-label')).toBe('Q3 financial report');
    });
  });

  describe('size', () => {
    it('defaults to md', () => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'report.pdf';
      });
      expect(icon.dataset.size).toBe('md');
    });

    it.each(['sm', 'lg'] as const)('applies %s size', (size) => {
      const icon = renderFileTypeIcon((el) => {
        el.name = 'report.pdf';
        el.size = size;
      });
      expect(icon.dataset.size).toBe(size);
    });
  });

  it('does not rebuild the icon element when an unrelated attribute changes', () => {
    const icon = renderFileTypeIcon((el) => {
      el.name = 'report.pdf';
    });

    const first = icon.querySelector('svg');
    icon.label = 'Custom label';
    expect(icon.querySelector('svg')).toBe(first);
  });

  it('rebuilds the content when switching from icon to thumbnail', () => {
    const icon = renderFileTypeIcon((el) => {
      el.name = 'report.pdf';
    });

    expect(icon.querySelector('svg')).not.toBeNull();
    icon.thumbnail = '/preview.jpg';
    expect(icon.querySelector('svg')).toBeNull();
    expect(icon.querySelector('img')).not.toBeNull();
  });
});
