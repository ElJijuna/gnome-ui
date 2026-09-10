import { expect, test } from '@playwright/test';

test('renders as a block-level box with no chrome of its own', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-bin--interactive');

  const bin = page.locator('gnome-bin');
  await expect(bin).toHaveCSS('display', 'block');
  await expect(bin).toHaveText('Just a child, no chrome of its own');
});

test('applies consumer styling with no additional chrome', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-bin--applies-consumer-styling');

  const bin = page.locator('gnome-bin');
  await expect(bin).toHaveCSS('max-width', '220px');
  await expect(bin).toHaveCSS('padding', '12px');
  await expect(bin).toHaveCSS('border-width', '1px');
});

test('renders empty with no children or attributes', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-bin--empty');

  const bin = page.locator('gnome-bin');
  await expect(bin).toBeAttached();
  await expect(bin).toHaveCSS('display', 'block');
  await expect(bin.locator('> *')).toHaveCount(0);
});
