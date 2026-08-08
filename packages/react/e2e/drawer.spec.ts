import { expect, test } from '@playwright/test';

// Drawer anchors its fixed backdrop to the real `window.visualViewport` via
// `useVisualViewport` (shared with Dialog/Modal/AboutDialog) so it tracks the
// true visible area rather than the layout viewport — e.g. when a mobile
// on-screen keyboard shrinks it. `window.visualViewport` does not exist in
// jsdom, so Drawer.test.tsx never exercises this at all: no test asserts on
// the inline style it produces, and none can, since there's no real resize
// event to listen for.

test('backdrop tracks the real visualViewport size and re-measures on resize', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto('/iframe.html?id=components-drawer--default');

  await page.getByRole('button', { name: 'Open Drawer' }).click();
  const backdrop = page.locator('[class*="backdrop"]').first();
  await expect(backdrop).toBeVisible();

  const initialWidth = await backdrop.evaluate((el) => Number.parseFloat(el.style.width));
  const initialHeight = await backdrop.evaluate((el) => Number.parseFloat(el.style.height));
  expect(initialWidth).toBeCloseTo(1000, 0);
  expect(initialHeight).toBeCloseTo(700, 0);

  await page.setViewportSize({ width: 640, height: 480 });

  await expect
    .poll(() => backdrop.evaluate((el) => Number.parseFloat(el.style.width)))
    .toBeCloseTo(640, 0);
  await expect
    .poll(() => backdrop.evaluate((el) => Number.parseFloat(el.style.height)))
    .toBeCloseTo(480, 0);
});
