import { expect, test } from '@playwright/test';

test('avatar shows name-derived initials with role=img and aria-label', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-avatar--initials');

  const avatar = page.getByRole('img', { name: 'Ada Lovelace' });
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveText('AL');
});

test('avatar shows the composed image and hides initials when it loads', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-avatar--image');

  const image = page.locator('[data-slot="avatar-image"]');
  const initials = page.locator('[data-slot="avatar-initials"]');

  await expect(image).toBeVisible();
  await expect(initials).toBeHidden();
});

test('broken image falls back to initials', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-avatar--broken-image');

  const image = page.locator('[data-slot="avatar-image"]');
  const initials = page.locator('[data-slot="avatar-initials"]');

  await expect(image).toBeHidden();
  await expect(initials).toBeVisible();
  await expect(initials).toHaveText('GH');
});
