import { expect, test } from '@playwright/test';

test('skeleton rect is aria-hidden and sized from width/height', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-skeleton--rectangular');

  const skeleton = page.locator('gnome-skeleton');
  await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  await expect(skeleton).toHaveCSS('width', '200px');
  await expect(skeleton).toHaveCSS('height', '20px');
});

test('skeleton circle is sized from the size attribute', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-skeleton--circle');

  const skeleton = page.locator('gnome-skeleton');
  await expect(skeleton).toHaveCSS('width', '48px');
  await expect(skeleton).toHaveCSS('height', '48px');
  await expect(skeleton).toHaveCSS('border-radius', '50%');
});

test('skeleton text variant renders one row per line', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-skeleton--text');

  const lines = page.locator('gnome-skeleton [data-slot="skeleton-line"]');
  await expect(lines).toHaveCount(4);
});
