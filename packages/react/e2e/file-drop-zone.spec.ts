import { expect, test } from '@playwright/test';

// FileDropZone.test.tsx fires synthetic `drop`/`dragEnter` events with a
// plain `{ files: [file] }` object cast as `dataTransfer` — never a real
// `DataTransfer`, and never a genuine drag protocol. These construct a real
// `DataTransfer` with real `File`s in-page and dispatch real drag events,
// which is the only way to exercise the actual browser drag-and-drop path.

test('accepts a real dropped file via native DataTransfer', async ({ page }) => {
  await page.goto('/iframe.html?id=components-filedropzone--default');

  const zone = page.getByRole('button', { name: 'Drag files here or click to browse' });

  const dataTransfer = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(['hello world'], 'notes.txt', { type: 'text/plain' }));
    return dt;
  });

  await zone.dispatchEvent('dragenter', { dataTransfer });
  await zone.dispatchEvent('drop', { dataTransfer });

  await expect(page.getByText('notes.txt')).toBeVisible();
});

test('accepts a real file matching the accept filter', async ({ page }) => {
  await page.goto('/iframe.html?id=components-filedropzone--image-upload-with-limits');

  const zone = page.getByRole('button', { name: 'Drag an image here or click to browse' });

  const dataTransfer = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(['fake-png-bytes'], 'photo.png', { type: 'image/png' }));
    return dt;
  });

  await zone.dispatchEvent('drop', { dataTransfer });

  await expect(page.getByText('Selected: photo.png')).toBeVisible();
});

test('rejects a real file that fails the accept filter', async ({ page }) => {
  await page.goto('/iframe.html?id=components-filedropzone--image-upload-with-limits');

  const zone = page.getByRole('button', { name: 'Drag an image here or click to browse' });

  const dataTransfer = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(['not an image'], 'notes.txt', { type: 'text/plain' }));
    return dt;
  });

  await zone.dispatchEvent('drop', { dataTransfer });

  await expect(page.getByText('"notes.txt" is not an accepted file type.')).toBeVisible();
});
