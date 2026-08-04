import { expect, test } from '@playwright/test';

test('selecting a file via the hidden input fires gnome-files-selected', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-file-drop-zone--default');

  const input = page.locator('gnome-file-drop-zone [data-slot="file-drop-zone-input"]');
  await input.setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake image bytes'),
  });

  await expect(page.getByText('photo.png')).toBeVisible();
});

test('dragging a file over the zone sets data-dragging, and leaving clears it', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-file-drop-zone--default');

  const zone = page.locator('gnome-file-drop-zone');

  await page.evaluate(() => {
    const el = document.querySelector('gnome-file-drop-zone');
    const dataTransfer = new DataTransfer();
    el?.dispatchEvent(
      new DragEvent('dragenter', { dataTransfer, bubbles: true, cancelable: true }),
    );
  });
  await expect(zone).toHaveAttribute('data-dragging', '');

  await page.evaluate(() => {
    const el = document.querySelector('gnome-file-drop-zone');
    const dataTransfer = new DataTransfer();
    el?.dispatchEvent(
      new DragEvent('dragleave', { dataTransfer, bubbles: true, cancelable: true }),
    );
  });
  await expect(zone).not.toHaveAttribute('data-dragging', '');
});

test('dropping a file processes it and clears the dragging state', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-file-drop-zone--default');

  const zone = page.locator('gnome-file-drop-zone');

  await page.evaluate(() => {
    const el = document.querySelector('gnome-file-drop-zone');
    const file = new File(['report bytes'], 'report.pdf', { type: 'application/pdf' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    el?.dispatchEvent(
      new DragEvent('dragenter', { dataTransfer, bubbles: true, cancelable: true }),
    );
    el?.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }));
  });

  await expect(zone).not.toHaveAttribute('data-dragging', '');
  await expect(page.getByText('report.pdf')).toBeVisible();
});

test('rejects a dropped file that does not match accept, with an error message', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-file-drop-zone--image-upload-with-limits');

  await page.evaluate(() => {
    const el = document.querySelector('gnome-file-drop-zone');
    const file = new File(['not an image'], 'video.mov', { type: 'video/quicktime' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    el?.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }));
  });

  await expect(page.locator('.wc-story__event')).toHaveText(
    '"video.mov" is not an accepted file type.',
  );
});

test('disabled zone has aria-disabled and ignores drops', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-file-drop-zone--disabled');

  const zone = page.locator('gnome-file-drop-zone');
  await expect(zone).toHaveAttribute('aria-disabled', 'true');
  await expect(zone).toHaveAttribute('tabindex', '-1');
});
