import { expect, test } from '@playwright/test';

// Two real-browser-only gaps in one component:
// 1. Real `prefers-reduced-motion`, same pattern as Modal/Overlay.
// 2. Real `setPointerCapture()` drag-to-dismiss — BottomSheet.test.tsx fires
//    synthetic `pointerDown`/`pointerMove`/`pointerUp` directly at the
//    handle, never exercising actual pointer capture during a drag.

test('closes without waiting for the exit animation when prefers-reduced-motion is on', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=components-bottomsheet--default');

  await page.getByRole('button', { name: 'Open Bottom Sheet' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  // Normal exit takes 200ms — reduced motion must skip that wait entirely.
  await expect(dialog).toBeHidden({ timeout: 100 });
});

test('dragging the handle past the 150px threshold dismisses the sheet', async ({ page }) => {
  // The sheet slides up from the very bottom of the viewport — the default
  // 1280x720 puts its handle right at (or past) the bottom edge, outside
  // where `page.mouse` coordinates land. A taller viewport keeps it clear.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/iframe.html?id=components-bottomsheet--drag-to-close');

  await page.getByRole('button', { name: 'Open Bottom Sheet' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  // Wait out the slide-up entrance animation — grabbing the handle's
  // bounding box mid-slide would capture its still off-screen position.
  await expect(dialog).not.toHaveClass(/entering/);

  const handle = dialog.locator('[class*="handle"]').first();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();

  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 200, { steps: 10 });
  await page.mouse.up();

  await expect(dialog).toBeHidden();
});
