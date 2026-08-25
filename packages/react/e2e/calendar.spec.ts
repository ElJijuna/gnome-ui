import { expect, test } from '@playwright/test';

// Calendar drives a roving-tabindex grid: only one day is tabbable, arrow keys
// move real DOM focus, and crossing a month edge re-renders the grid and then
// restores focus onto the equivalent cell via an effect. jsdom has no real
// focus model and cannot re-run that focus-after-render step, so Calendar.test
// can only assert the tabindex bookkeeping — never that focus actually lands
// on the right cell after the month flips. These specs exercise the browser.

const PRESELECTED = '/iframe.html?id=components-calendar--preselected';

test('arrow keys move real focus day-by-day and week-by-week', async ({ page }) => {
  await page.goto(PRESELECTED);

  const aug15 = page.getByRole('button', { name: 'Saturday, August 15, 2026' });
  await aug15.focus();
  await expect(aug15).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Sunday, August 16, 2026' })).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Sunday, August 23, 2026' })).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowLeft');
  await expect(aug15).toBeFocused();
});

test('arrowing past the month edge navigates and keeps focus on the new cell', async ({ page }) => {
  await page.goto(PRESELECTED);

  // Start from the roving cell (15 Aug) and walk to the last day of the month.
  await page.getByRole('button', { name: 'Saturday, August 15, 2026' }).focus();
  await page.keyboard.press('ArrowDown'); // 22
  await page.keyboard.press('ArrowDown'); // 29
  await page.keyboard.press('ArrowRight'); // 30
  await page.keyboard.press('ArrowRight'); // 31
  await page.keyboard.press('ArrowRight'); // 1 Sep

  // Grid flips to September and focus follows onto 1 September.
  await expect(page.getByRole('grid', { name: /september 2026/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tuesday, September 1, 2026' })).toBeFocused();
});

test('PageDown pages a month keeping the day-of-month and focus', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.getByRole('button', { name: 'Saturday, August 15, 2026' }).focus();
  await page.keyboard.press('PageDown');

  await expect(page.getByRole('grid', { name: /september 2026/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tuesday, September 15, 2026' })).toBeFocused();
});

test('Enter selects the focused day', async ({ page }) => {
  await page.goto(PRESELECTED);

  const aug20 = page.getByRole('button', { name: 'Thursday, August 20, 2026' });
  // Walk from the roving cell (15 Aug) to 20 Aug, then commit with Enter.
  await page.getByRole('button', { name: 'Saturday, August 15, 2026' }).focus();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowRight');
  }
  await expect(aug20).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(aug20.locator('xpath=ancestor::*[@role="gridcell"]')).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test('the grid exposes exactly one tabbable day (roving tabindex)', async ({ page }) => {
  await page.goto(PRESELECTED);

  const tabbable = page.locator('[role="grid"] button[tabindex="0"]');
  await expect(tabbable).toHaveCount(1);
  // The preselected story seeds focus on the selected day.
  await expect(tabbable).toHaveText('15');
});
