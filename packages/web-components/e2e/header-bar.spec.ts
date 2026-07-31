import { expect, test } from '@playwright/test';

test('default header bar centers the title with aria-live=polite', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-header-bar--default');

  const title = page.locator('gnome-header-bar [data-slot="header-title"]');
  await expect(title).toHaveText('Inbox');
  await expect(title).toHaveAttribute('aria-live', 'polite');
});

test('title stays centered even without a start slot', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-header-bar--default');

  const bar = page.locator('gnome-header-bar');
  const barBox = await bar.boundingBox();
  const titleBox = await bar.locator('[data-slot="header-title"]').boundingBox();

  expect(barBox).not.toBeNull();
  expect(titleBox).not.toBeNull();

  const barCenter = barBox!.x + barBox!.width / 2;
  const titleCenter = titleBox!.x + titleBox!.width / 2;

  expect(Math.abs(barCenter - titleCenter)).toBeLessThan(2);
});

test('flat variant removes the bottom border', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-header-bar--flat');

  const bar = page.locator('gnome-header-bar');
  await expect(bar).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');
});

test('start and end action buttons are both reachable', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-header-bar--with-actions');

  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add contact' })).toBeVisible();
});
