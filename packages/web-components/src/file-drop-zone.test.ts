import { afterEach, describe, expect, it, vi } from 'vitest';

import { GnomeFileDropZoneElement } from './file-drop-zone';

function makeFile(name: string, size: number, type = 'text/plain') {
  return new File(['x'.repeat(size)], name, { type });
}

function renderZone(setup?: (el: GnomeFileDropZoneElement) => void) {
  const el = document.createElement('gnome-file-drop-zone') as GnomeFileDropZoneElement;
  setup?.(el);
  document.body.append(el);

  return el;
}

function input(el: GnomeFileDropZoneElement) {
  return el.querySelector<HTMLInputElement>('[data-slot="file-drop-zone-input"]');
}

// jsdom's real DragEvent doesn't accept a writable `dataTransfer`, so a
// plain Event with the property defined directly is enough — the component
// only ever reads `.preventDefault()` and `.dataTransfer.files`.
function dragEvent(type: string, files: File[] | null) {
  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.defineProperty(event, 'dataTransfer', {
    configurable: true,
    value: files ? { files } : null,
  });

  return event;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GnomeFileDropZoneElement', () => {
  it('registers the custom element', () => {
    renderZone();
    expect(customElements.get('gnome-file-drop-zone')).toBe(GnomeFileDropZoneElement);
  });

  describe('rendering', () => {
    it('renders the default label', () => {
      const el = renderZone();
      expect(el.querySelector('[data-slot="file-drop-zone-label"]')?.textContent).toBe(
        'Drag files here or click to browse',
      );
    });

    it('renders a custom label', () => {
      const el = renderZone((node) => {
        node.label = 'Upload a photo';
      });
      expect(el.querySelector('[data-slot="file-drop-zone-label"]')?.textContent).toBe(
        'Upload a photo',
      );
    });

    it('renders helper text when provided', () => {
      const el = renderZone((node) => {
        node.helperText = 'PNG or JPG, up to 5 MB';
      });
      expect(el.querySelector('[data-slot="file-drop-zone-helper-text"]')?.textContent).toBe(
        'PNG or JPG, up to 5 MB',
      );
    });

    it('omits helper text when not provided', () => {
      const el = renderZone();
      expect(el.querySelector('[data-slot="file-drop-zone-helper-text"]')).toBeNull();
    });

    it('exposes role=button', () => {
      const el = renderZone();
      expect(el.getAttribute('role')).toBe('button');
    });
  });

  describe('click to browse', () => {
    it('opens the native file dialog when clicked', () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      const el = renderZone();
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('does not open the file dialog when disabled', () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      const el = renderZone((node) => {
        node.disabled = true;
      });
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('opens the file dialog on Enter and Space', () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      const el = renderZone();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

      expect(clickSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('file selection via input', () => {
    it('calls gnome-files-selected with the picked file', () => {
      const onFilesSelected = vi.fn();
      const el = renderZone((node) => {
        node.addEventListener('gnome-files-selected', onFilesSelected);
      });
      const file = makeFile('photo.png', 100, 'image/png');
      const control = input(el) as HTMLInputElement;

      Object.defineProperty(control, 'files', { configurable: true, value: [file] });
      control.dispatchEvent(new Event('change', { bubbles: true }));

      expect(onFilesSelected).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { files: [file] } }),
      );
    });

    it('keeps only the first file when multiple is false', () => {
      const onFilesSelected = vi.fn();
      const el = renderZone((node) => {
        node.addEventListener('gnome-files-selected', onFilesSelected);
      });
      const a = makeFile('a.txt', 10);
      const b = makeFile('b.txt', 10);
      const control = input(el) as HTMLInputElement;

      Object.defineProperty(control, 'files', { configurable: true, value: [a, b] });
      control.dispatchEvent(new Event('change', { bubbles: true }));

      expect(onFilesSelected).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { files: [a] } }),
      );
    });

    it('keeps all files when multiple is true', () => {
      const onFilesSelected = vi.fn();
      const el = renderZone((node) => {
        node.multiple = true;
        node.addEventListener('gnome-files-selected', onFilesSelected);
      });
      const a = makeFile('a.txt', 10);
      const b = makeFile('b.txt', 10);
      const control = input(el) as HTMLInputElement;

      Object.defineProperty(control, 'files', { configurable: true, value: [a, b] });
      control.dispatchEvent(new Event('change', { bubbles: true }));

      expect(onFilesSelected).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { files: [a, b] } }),
      );
    });
  });

  describe('drag and drop', () => {
    it('sets data-dragging on dragenter', () => {
      const el = renderZone();

      el.dispatchEvent(dragEvent('dragenter', []));

      expect(el.hasAttribute('data-dragging')).toBe(true);
    });

    it('removes data-dragging on dragleave', () => {
      const el = renderZone();

      el.dispatchEvent(dragEvent('dragenter', []));
      el.dispatchEvent(dragEvent('dragleave', []));

      expect(el.hasAttribute('data-dragging')).toBe(false);
    });

    it('stays dragging while the counter is above zero (nested dragenter/dragleave)', () => {
      const el = renderZone();

      el.dispatchEvent(dragEvent('dragenter', []));
      el.dispatchEvent(dragEvent('dragenter', []));
      el.dispatchEvent(dragEvent('dragleave', []));

      expect(el.hasAttribute('data-dragging')).toBe(true);

      el.dispatchEvent(dragEvent('dragleave', []));
      expect(el.hasAttribute('data-dragging')).toBe(false);
    });

    it('processes dropped files and clears data-dragging', () => {
      const onFilesSelected = vi.fn();
      const file = makeFile('report.pdf', 10, 'application/pdf');
      const el = renderZone((node) => {
        node.addEventListener('gnome-files-selected', onFilesSelected);
      });

      el.dispatchEvent(dragEvent('dragenter', [file]));
      el.dispatchEvent(dragEvent('drop', [file]));

      expect(onFilesSelected).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { files: [file] } }),
      );
      expect(el.hasAttribute('data-dragging')).toBe(false);
    });
  });

  describe('validation', () => {
    it('rejects a dropped file that does not match accept', () => {
      const onFilesSelected = vi.fn();
      const onError = vi.fn();
      const file = makeFile('video.mov', 10, 'video/quicktime');

      const el = renderZone((node) => {
        node.accept = 'image/*';
        node.addEventListener('gnome-files-selected', onFilesSelected);
        node.addEventListener('gnome-error', onError);
      });

      el.dispatchEvent(dragEvent('drop', [file]));

      expect(onFilesSelected).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          detail: { message: '"video.mov" is not an accepted file type.' },
        }),
      );
    });

    it('accepts a dropped file matching an extension pattern', () => {
      const onFilesSelected = vi.fn();
      const file = makeFile('report.pdf', 10, 'application/pdf');

      const el = renderZone((node) => {
        node.accept = '.pdf,.docx';
        node.addEventListener('gnome-files-selected', onFilesSelected);
      });

      el.dispatchEvent(dragEvent('drop', [file]));

      expect(onFilesSelected).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { files: [file] } }),
      );
    });

    it('rejects a file exceeding maxSize', () => {
      const onFilesSelected = vi.fn();
      const onError = vi.fn();
      const file = makeFile('large.png', 2000, 'image/png');

      const el = renderZone((node) => {
        node.maxSize = 1000;
        node.addEventListener('gnome-files-selected', onFilesSelected);
        node.addEventListener('gnome-error', onError);
      });

      el.dispatchEvent(dragEvent('drop', [file]));

      expect(onFilesSelected).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          detail: { message: '"large.png" exceeds the maximum file size.' },
        }),
      );
    });

    it('accepts files within maxSize and rejects the rest in the same drop', () => {
      const onFilesSelected = vi.fn();
      const onError = vi.fn();
      const small = makeFile('small.png', 10, 'image/png');
      const large = makeFile('large.png', 2000, 'image/png');

      const el = renderZone((node) => {
        node.maxSize = 1000;
        node.multiple = true;
        node.addEventListener('gnome-files-selected', onFilesSelected);
        node.addEventListener('gnome-error', onError);
      });

      el.dispatchEvent(dragEvent('drop', [small, large]));

      expect(onFilesSelected).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { files: [small] } }),
      );
      expect(onError).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          detail: { message: '"large.png" exceeds the maximum file size.' },
        }),
      );
    });
  });

  describe('disabled', () => {
    it('sets aria-disabled and removes the zone from the tab order', () => {
      const el = renderZone((node) => {
        node.disabled = true;
      });

      expect(el.getAttribute('aria-disabled')).toBe('true');
      expect(el.tabIndex).toBe(-1);
    });

    it('ignores drops when disabled', () => {
      const onFilesSelected = vi.fn();
      const file = makeFile('a.txt', 10);

      const el = renderZone((node) => {
        node.disabled = true;
        node.addEventListener('gnome-files-selected', onFilesSelected);
      });

      el.dispatchEvent(dragEvent('drop', [file]));

      expect(onFilesSelected).not.toHaveBeenCalled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('preserves class on the zone', () => {
      const el = renderZone((node) => {
        node.className = 'custom';
      });
      expect(el.className).toBe('custom');
    });

    it('preserves data attributes', () => {
      const el = renderZone((node) => {
        node.setAttribute('data-testid', 'upload-zone');
      });
      expect(el.getAttribute('data-testid')).toBe('upload-zone');
    });
  });
});
