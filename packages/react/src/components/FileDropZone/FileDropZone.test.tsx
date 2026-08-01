import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FileDropZone } from './FileDropZone';

afterEach(() => {
  vi.restoreAllMocks();
});

function makeFile(name: string, size: number, type = 'text/plain') {
  const file = new File(['x'.repeat(size)], name, { type });

  return file;
}

describe('FileDropZone', () => {
  describe('rendering', () => {
    it('renders the default label', () => {
      render(<FileDropZone onFilesSelected={vi.fn()} />);
      expect(screen.getByText('Drag files here or click to browse')).toBeInTheDocument();
    });

    it('renders a custom label', () => {
      render(<FileDropZone onFilesSelected={vi.fn()} label="Upload a photo" />);
      expect(screen.getByText('Upload a photo')).toBeInTheDocument();
    });

    it('renders helper text when provided', () => {
      render(<FileDropZone onFilesSelected={vi.fn()} helperText="PNG or JPG, up to 5 MB" />);
      expect(screen.getByText('PNG or JPG, up to 5 MB')).toBeInTheDocument();
    });

    it('exposes role=button', () => {
      render(<FileDropZone onFilesSelected={vi.fn()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('click to browse', () => {
    it('opens the native file dialog when clicked', () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(<FileDropZone onFilesSelected={vi.fn()} />);
      fireEvent.click(screen.getByRole('button'));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('does not open the file dialog when disabled', () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(<FileDropZone onFilesSelected={vi.fn()} disabled />);
      fireEvent.click(screen.getByRole('button'));

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('opens the file dialog on Enter and Space', () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(<FileDropZone onFilesSelected={vi.fn()} />);
      const zone = screen.getByRole('button');

      fireEvent.keyDown(zone, { key: 'Enter' });
      fireEvent.keyDown(zone, { key: ' ' });

      expect(clickSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('file selection via input', () => {
    it('calls onFilesSelected with the picked file', () => {
      const onFilesSelected = vi.fn();
      const { container } = render(<FileDropZone onFilesSelected={onFilesSelected} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = makeFile('photo.png', 100, 'image/png');

      fireEvent.change(input, { target: { files: [file] } });

      expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it('keeps only the first file when multiple is false', () => {
      const onFilesSelected = vi.fn();
      const { container } = render(<FileDropZone onFilesSelected={onFilesSelected} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const a = makeFile('a.txt', 10);
      const b = makeFile('b.txt', 10);

      fireEvent.change(input, { target: { files: [a, b] } });

      expect(onFilesSelected).toHaveBeenCalledWith([a]);
    });

    it('keeps all files when multiple is true', () => {
      const onFilesSelected = vi.fn();
      const { container } = render(<FileDropZone onFilesSelected={onFilesSelected} multiple />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const a = makeFile('a.txt', 10);
      const b = makeFile('b.txt', 10);

      fireEvent.change(input, { target: { files: [a, b] } });

      expect(onFilesSelected).toHaveBeenCalledWith([a, b]);
    });
  });

  describe('drag and drop', () => {
    it('applies the dragging class on dragEnter', () => {
      const zone = renderZone();

      fireEvent.dragEnter(zone(), { dataTransfer: { files: [] } });

      expect(zone().className).toMatch(/dragging/);
    });

    it('removes the dragging class on dragLeave', () => {
      const zone = renderZone();

      fireEvent.dragEnter(zone(), { dataTransfer: { files: [] } });
      fireEvent.dragLeave(zone(), { dataTransfer: { files: [] } });

      expect(zone().className).not.toMatch(/dragging/);
    });

    it('processes dropped files and clears the dragging class', () => {
      const onFilesSelected = vi.fn();
      const file = makeFile('report.pdf', 10, 'application/pdf');

      render(<FileDropZone onFilesSelected={onFilesSelected} />);
      const zone = screen.getByRole('button');

      fireEvent.dragEnter(zone, { dataTransfer: { files: [file] } });
      fireEvent.drop(zone, { dataTransfer: { files: [file] } });

      expect(onFilesSelected).toHaveBeenCalledWith([file]);
      expect(zone.className).not.toMatch(/dragging/);
    });

    function renderZone() {
      render(<FileDropZone onFilesSelected={vi.fn()} />);

      return () => screen.getByRole('button');
    }
  });

  describe('validation', () => {
    it('rejects a dropped file that does not match accept', () => {
      const onFilesSelected = vi.fn();
      const onError = vi.fn();
      const file = makeFile('video.mov', 10, 'video/quicktime');

      render(<FileDropZone onFilesSelected={onFilesSelected} onError={onError} accept="image/*" />);
      const zone = screen.getByRole('button');

      fireEvent.drop(zone, { dataTransfer: { files: [file] } });

      expect(onFilesSelected).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('"video.mov" is not an accepted file type.');
    });

    it('accepts a dropped file matching an extension pattern', () => {
      const onFilesSelected = vi.fn();
      const file = makeFile('report.pdf', 10, 'application/pdf');

      render(<FileDropZone onFilesSelected={onFilesSelected} accept=".pdf,.docx" />);
      fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [file] } });

      expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it('rejects a file exceeding maxSize', () => {
      const onFilesSelected = vi.fn();
      const onError = vi.fn();
      const file = makeFile('large.png', 2000, 'image/png');

      render(<FileDropZone onFilesSelected={onFilesSelected} onError={onError} maxSize={1000} />);
      fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [file] } });

      expect(onFilesSelected).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('"large.png" exceeds the maximum file size.');
    });

    it('accepts files within maxSize and rejects the rest in the same drop', () => {
      const onFilesSelected = vi.fn();
      const onError = vi.fn();
      const small = makeFile('small.png', 10, 'image/png');
      const large = makeFile('large.png', 2000, 'image/png');

      render(
        <FileDropZone
          onFilesSelected={onFilesSelected}
          onError={onError}
          maxSize={1000}
          multiple
        />,
      );
      fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [small, large] } });

      expect(onFilesSelected).toHaveBeenCalledWith([small]);
      expect(onError).toHaveBeenCalledWith('"large.png" exceeds the maximum file size.');
    });
  });

  describe('disabled', () => {
    it('sets aria-disabled and removes the zone from the tab order', () => {
      render(<FileDropZone onFilesSelected={vi.fn()} disabled />);
      const zone = screen.getByRole('button');

      expect(zone).toHaveAttribute('aria-disabled', 'true');
      expect(zone).toHaveAttribute('tabIndex', '-1');
    });

    it('ignores drops when disabled', () => {
      const onFilesSelected = vi.fn();
      const file = makeFile('a.txt', 10);

      render(<FileDropZone onFilesSelected={onFilesSelected} disabled />);
      fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [file] } });

      expect(onFilesSelected).not.toHaveBeenCalled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the zone', () => {
      render(<FileDropZone onFilesSelected={vi.fn()} className="custom" />);
      expect(screen.getByRole('button')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<FileDropZone onFilesSelected={vi.fn()} data-testid="upload-zone" />);
      expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    });
  });
});
