import { expect, test } from '@playwright/test';

test('labeled divider exposes an accessible name and a centered label', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-divider--interactive');

  const divider = page.getByRole('separator', { name: 'OR' });
  await expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(divider).toHaveText('OR');
});

test('bare divider has no accessible name', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-divider--bare');

  const divider = page.locator('gnome-divider');
  await expect(divider).toHaveAttribute('role', 'separator');
  await expect(divider).not.toHaveAttribute('aria-label');
});
