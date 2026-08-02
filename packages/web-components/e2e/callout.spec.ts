import { expect, test } from '@playwright/test';

test('callout exposes role note and reports dismissal without hiding itself', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-callout--interactive');

  const callout = page.locator('gnome-callout');
  await expect(callout).toHaveAttribute('role', 'note');

  await page.getByRole('button', { name: 'Dismiss' }).click();

  await expect(page.getByText('Dismissed (consumer decides what happens next).')).toBeVisible();
  await expect(callout).toBeVisible();
});

test('callout without a dismiss button renders fine', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-callout--not-dismissible');

  const callout = page.locator('gnome-callout');
  await expect(callout).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dismiss' })).toHaveCount(0);
});
