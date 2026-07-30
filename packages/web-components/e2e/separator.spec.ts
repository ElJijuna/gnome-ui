import { expect, test } from '@playwright/test';

test('horizontal separator (default) exposes role=separator without aria-orientation', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-separator--horizontal');

  const separator = page.locator('gnome-separator');
  await expect(separator).toHaveAttribute('role', 'separator');
  await expect(separator).not.toHaveAttribute('aria-orientation', /.+/);
  await expect(separator).toHaveCSS('height', '1px');
});

test('vertical separator sets aria-orientation and stretches to row height', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-separator--vertical');

  const separators = page.locator('gnome-separator');
  await expect(separators.first()).toHaveAttribute('aria-orientation', 'vertical');
  await expect(separators.first()).toHaveCSS('width', '1px');
});
