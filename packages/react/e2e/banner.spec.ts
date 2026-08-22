import { expect, test } from '@playwright/test';

// Banner is a polite live region that sits above page content and can carry an
// action plus a dismiss button. What matters in a browser and not in jsdom is
// that the two buttons are real, separate tab stops, that the variant is
// actually painted, and that dismissing removes the banner from the layout so
// the content below reflows.

test('the action and dismiss buttons are separate tab stops in reading order', async ({ page }) => {
  await page.goto('/iframe.html?id=components-banner--with-action-and-dismiss');

  const banner = page.getByRole('status');
  await expect(banner).toBeVisible();
  await expect(banner).toHaveAttribute('aria-live', 'polite');

  const buttons = banner.getByRole('button');
  await expect(buttons).toHaveCount(2);

  await page.keyboard.press('Tab');
  await expect(buttons.first()).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(buttons.nth(1)).toBeFocused();
  await expect(buttons.nth(1)).toHaveAttribute('aria-label', 'Dismiss');
});

test('dismissing removes the banner from the layout entirely', async ({ page }) => {
  await page.goto('/iframe.html?id=components-banner--dismissible');

  const banner = page.getByRole('status');
  await expect(banner).toBeVisible();
  expect((await banner.boundingBox())!.height).toBeGreaterThan(0);

  await banner.getByRole('button', { name: 'Dismiss' }).click();

  await expect(banner).toBeHidden();
  await expect(page.getByText('Banner dismissed.')).toBeVisible();
});

test('each variant paints a different background', async ({ page }) => {
  await page.goto('/iframe.html?id=components-banner--variants');

  const banners = page.getByRole('status');
  await expect(banners.first()).toBeVisible();

  const backgrounds = await banners.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).backgroundColor),
  );

  // The variant prop only ever becomes visible through CSS.
  expect(new Set(backgrounds).size).toBe(backgrounds.length);
});
