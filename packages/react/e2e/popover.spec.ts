import { expect, test } from '@playwright/test';

// `computePosition` in Popover.tsx uses real `getBoundingClientRect()` /
// viewport-fit math that jsdom can't exercise faithfully (it has no layout
// engine, so bounding rects are always zero) — these run against a real
// Chromium layout instead. The `EdgeDetection` story places triggers at the
// left edge, center, and right edge specifically to exercise this.

test('clamps the left-edge popover panel within the viewport', async ({ page }) => {
  await page.goto('/iframe.html?id=components-popover--edge-detection');

  await page.getByRole('button', { name: 'Quick settings (left)' }).click();

  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();

  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x).toBeGreaterThanOrEqual(0);
});

test('clamps the right-edge popover panel within the viewport', async ({ page }) => {
  await page.goto('/iframe.html?id=components-popover--edge-detection');
  const viewport = page.viewportSize();

  await page.getByRole('button', { name: 'Quick settings (right)' }).click();

  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();

  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
});

test('repositions the panel after the viewport is resized', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto('/iframe.html?id=components-popover--edge-detection');

  await page.getByRole('button', { name: 'Quick settings (right)' }).click();
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();

  const initialBox = await panel.boundingBox();
  expect(initialBox).not.toBeNull();

  await page.setViewportSize({ width: 500, height: 700 });

  await expect
    .poll(async () => {
      const box = await panel.boundingBox();
      return box ? box.x + box.width <= 500 && box.x !== initialBox!.x : false;
    })
    .toBe(true);
});
