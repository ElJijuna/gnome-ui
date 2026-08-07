import { expect, test } from '@playwright/test';

// EmojiPicker's category tab strip jumps the grid with a real
// `scrollIntoView`. EmojiPicker.test.tsx stubs
// `Element.prototype.scrollIntoView = vi.fn()` and only checks that it was
// *called* — never that the grid's real scroll position (or the target
// section's real visibility) actually changed.

test('clicking a category tab really scrolls the grid to that section', async ({ page }) => {
  await page.goto('/iframe.html?id=components-emojipicker--default');

  await page.getByRole('button', { name: 'Insert emoji' }).click();
  await page.getByRole('button', { name: 'Flags', exact: true }).click();

  const heading = page.getByRole('heading', { name: 'Flags' });
  await expect(heading).toBeVisible();

  const grid = heading.locator('xpath=ancestor::*[contains(@class,"grid")]').first();
  await expect.poll(() => grid.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});
