import { expect, test } from '@playwright/test';

test('spinner exposes role=status with an accessible label', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-spinner--interactive');

  const spinner = page.getByRole('status', { name: 'Loading…' });
  await expect(spinner).toBeVisible();
});

test('silenced spinner is hidden from assistive tech', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-spinner--silenced');

  const spinner = page.locator('gnome-spinner');
  await expect(spinner).toHaveAttribute('aria-hidden', 'true');
  await expect(spinner).not.toHaveAttribute('aria-label');
});

test('animation duration lengthens under prefers-reduced-motion', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-spinner--interactive');

  const spinner = page.locator('gnome-spinner');
  const normalDuration = await spinner.evaluate((el) => getComputedStyle(el).animationDuration);
  expect(normalDuration).toBe('0.75s');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedDuration = await spinner.evaluate((el) => getComputedStyle(el).animationDuration);
  expect(reducedDuration).toBe('2s');
});
