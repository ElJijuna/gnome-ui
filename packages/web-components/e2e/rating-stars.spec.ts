import { expect, test } from '@playwright/test';

test('read-only renders a static role=img display with no interactive stars', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-rating-stars--read-only');

  const ratingStars = page.locator('gnome-rating-stars');
  await expect(ratingStars).toHaveAttribute('role', 'img');
  await expect(ratingStars).toHaveAttribute('aria-label', '4 out of 5 stars');
  await expect(ratingStars.locator('[role="radio"]')).toHaveCount(0);
});

test('clicking a star selects it and updates the event output', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-rating-stars--interactive');

  const stars = page.locator('gnome-rating-stars [role="radio"]');
  await stars.nth(3).click();

  await expect(stars.nth(3)).toHaveAttribute('aria-checked', 'true');
  await expect(stars.nth(3)).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.wc-story__event')).toHaveText('Current rating: 4');
});

test('ArrowRight moves focus and selects the next star, clamped at the last one', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-rating-stars--interactive');

  const stars = page.locator('gnome-rating-stars [role="radio"]');
  await stars.nth(2).focus();
  await page.keyboard.press('ArrowRight');

  await expect(stars.nth(3)).toBeFocused();
  await expect(stars.nth(3)).toHaveAttribute('aria-checked', 'true');

  await stars.nth(4).focus();
  await page.keyboard.press('ArrowRight');
  await expect(stars.nth(4)).toBeFocused();
  await expect(stars.nth(4)).toHaveAttribute('aria-checked', 'false');
});

test('hovering a star previews its fill without selecting it', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-rating-stars--interactive');

  const stars = page.locator('gnome-rating-stars [role="radio"]');
  await stars.nth(4).hover();

  await expect(
    page.locator('gnome-rating-stars [data-slot="rating-star"][data-filled="true"]'),
  ).toHaveCount(5);
  await expect(stars.nth(4)).toHaveAttribute('aria-checked', 'false');

  await page.mouse.move(0, 0);
  await expect(
    page.locator('gnome-rating-stars [data-slot="rating-star"][data-filled="true"]'),
  ).toHaveCount(3);
});

test('disabled renders as read-only', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-rating-stars--disabled');

  const ratingStars = page.locator('gnome-rating-stars');
  await expect(ratingStars).toHaveAttribute('role', 'img');
  await expect(ratingStars.locator('[role="radio"]')).toHaveCount(0);
});
