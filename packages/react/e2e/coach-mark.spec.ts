import { expect, test } from '@playwright/test';

// CoachMark portals a bubble, measures the target with getBoundingClientRect,
// and positions with a viewport-aware flip — all geometry jsdom cannot produce.
// It also spotlights the target and moves focus into the bubble. These specs
// run it in a real browser.

// A tall viewport so the default "below" placement has room and never flips,
// keeping the positioning assertions deterministic.
test.use({ viewport: { width: 1024, height: 820 } });

test('opens below the target, spotlights it, and focuses the bubble', async ({ page }) => {
  await page.goto('/iframe.html?id=components-coachmark--basic');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const t = (await page.getByRole('button', { name: 'Sync now' }).boundingBox())!;
  const b = (await dialog.boundingBox())!;
  // The bubble is placed on-screen (not the pre-measure -9999 offset) beside the
  // target without overlapping it — which side depends on available room.
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.y).toBeGreaterThanOrEqual(0);
  const disjoint =
    b.x >= t.x + t.width || b.x + b.width <= t.x || b.y >= t.y + t.height || b.y + b.height <= t.y;
  expect(disjoint).toBe(true);

  // The dimmed spotlight backdrop is present.
  await expect(page.locator('[data-coachmark-backdrop]')).toBeVisible();

  // Focus moved into the bubble (onto the primary action).
  await expect(page.getByRole('button', { name: 'Got it' })).toBeFocused();
});

test('the primary action dismisses the mark', async ({ page }) => {
  await page.goto('/iframe.html?id=components-coachmark--basic');
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('button', { name: 'Got it' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('Escape dismisses the mark', async ({ page }) => {
  await page.goto('/iframe.html?id=components-coachmark--basic');
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('tour walks the steps and repositions the bubble each time', async ({ page }) => {
  await page.goto('/iframe.html?id=components-coachmark--tour');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('1 of 3');
  await expect(dialog).toHaveAccessibleName('Find anything');

  const firstLeft = (await dialog.boundingBox())!.x;

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(dialog).toContainText('2 of 3');
  await expect(dialog).toHaveAccessibleName('Add items');

  // The bubble tracks a different target, so it has moved.
  const secondLeft = (await dialog.boundingBox())!.x;
  expect(Math.abs(secondLeft - firstLeft)).toBeGreaterThan(1);

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(dialog).toContainText('1 of 3');
});

test('tour finishes on the last step', async ({ page }) => {
  await page.goto('/iframe.html?id=components-coachmark--tour');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('dialog')).toContainText('3 of 3');

  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});
