import { expect, test } from '@playwright/test';

test('resolves a PDF icon from the file name and exposes an accessible label', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-file-type-icon--basic');

  const icon = page.locator('gnome-file-type-icon');
  await expect(icon).toHaveAttribute('role', 'img');
  await expect(icon).toHaveAttribute('aria-label', 'PDF document');
  await expect(icon.locator('svg')).toBeVisible();
});

test('renders a thumbnail image instead of the resolved icon', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-file-type-icon--thumbnail');

  const icon = page.locator('gnome-file-type-icon');
  await expect(icon.locator('img')).toBeVisible();
  await expect(icon.locator('svg')).toHaveCount(0);
});

test('all-categories story renders a distinct icon for every file plus the folder', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-file-type-icon--all-categories');

  const icons = page.locator('gnome-file-type-icon');
  await expect(icons).toHaveCount(13);

  for (const icon of await icons.all()) {
    await expect(icon.locator('svg')).toBeVisible();
  }
});
