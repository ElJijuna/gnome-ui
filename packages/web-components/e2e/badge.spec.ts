import { expect, test } from '@playwright/test';

test('badge renders its light-DOM content with the accent variant by default', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-badge--interactive');

  const badge = page.locator('gnome-badge');
  await expect(badge).toHaveText('3');
  await expect(badge).toHaveCSS('background-color', 'oklch(0.575 0.185 259)');
});

test('anchored badge is positioned absolutely over the wrapper', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-badge--anchored');

  const badge = page.locator('gnome-badge');
  await expect(badge).toHaveCSS('position', 'absolute');
});

test('dot badge collapses its text content visually', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-badge--dot');

  const badge = page.locator('gnome-badge');
  await expect(badge).toHaveCSS('font-size', '0px');
});
