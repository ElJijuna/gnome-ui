import { expect, test } from '@playwright/test';

// CalendarRange paints its band from a live pointer/focus preview and keeps a
// roving tabindex shared across several month panels. Neither the hover chain
// nor the real focus moves survive jsdom, so the behaviours worth asserting in
// a browser are exactly those: preview, cross-panel selection, and keyboard
// commit.

const BASIC = '/iframe.html?id=components-calendarrange--basic';
const TWO_MONTHS = '/iframe.html?id=components-calendarrange--two-months';
const LIMITS = '/iframe.html?id=components-calendarrange--length-limits';

const cell = (name: string) => `[role="gridcell"]:has(button[aria-label^="${name}"])`;

test('hovering after the first click previews the band', async ({ page }) => {
  await page.goto(BASIC);

  await page.getByRole('button', { name: /^Monday, August 10, 2026/ }).click();
  await page.getByRole('button', { name: /^Friday, August 14, 2026/ }).hover();

  await expect(page.locator(cell('Wednesday, August 12, 2026'))).toHaveAttribute('data-in-range');
  await expect(page.locator(cell('Wednesday, August 12, 2026'))).toHaveAttribute('data-preview');
  await expect(page.locator(cell('Monday, August 10, 2026'))).toHaveAttribute('data-range-start');

  // Moving to an earlier day flips which end the anchor is.
  await page.getByRole('button', { name: /^Wednesday, August 5, 2026/ }).hover();
  await expect(page.locator(cell('Monday, August 10, 2026'))).toHaveAttribute('data-range-end');
  await expect(page.locator(cell('Thursday, August 6, 2026'))).toHaveAttribute('data-in-range');
});

test('the second click commits the range and stops the preview', async ({ page }) => {
  await page.goto(BASIC);

  await page.getByRole('button', { name: /^Monday, August 10, 2026/ }).click();
  await page.getByRole('button', { name: /^Friday, August 14, 2026/ }).click();

  const middle = page.locator(cell('Wednesday, August 12, 2026'));
  await expect(middle).toHaveAttribute('data-in-range');
  await expect(middle).not.toHaveAttribute('data-preview');
  await expect(page.getByRole('status')).toHaveText(/Range August 10, 2026 to August 14, 2026/);

  // Hovering elsewhere no longer redraws anything: the range is settled.
  await page.getByRole('button', { name: /^Monday, August 24, 2026/ }).hover();
  await expect(page.locator(cell('Thursday, August 20, 2026'))).not.toHaveAttribute(
    'data-in-range',
  );
});

test('Escape cancels a half-made range', async ({ page }) => {
  await page.goto(BASIC);

  await page.getByRole('button', { name: /^Monday, August 10, 2026/ }).click();
  await page.getByRole('button', { name: /^Friday, August 14, 2026/ }).hover();
  await page.keyboard.press('Escape');

  await expect(page.locator(cell('Monday, August 10, 2026'))).not.toHaveAttribute(
    'data-range-start',
  );
  await expect(page.locator(cell('Wednesday, August 12, 2026'))).not.toHaveAttribute(
    'data-in-range',
  );
});

test('the keyboard previews and commits without a pointer', async ({ page }) => {
  await page.goto(BASIC);

  const aug12 = page.getByRole('button', { name: /^Wednesday, August 12, 2026/ });
  await aug12.focus();
  await page.keyboard.press('Enter'); // anchor
  await page.keyboard.press('ArrowDown'); // 19 Aug
  await page.keyboard.press('ArrowRight'); // 20 Aug

  await expect(page.getByRole('button', { name: /^Thursday, August 20, 2026/ })).toBeFocused();
  await expect(page.locator(cell('Sunday, August 16, 2026'))).toHaveAttribute('data-in-range');

  await page.keyboard.press('Enter'); // commit
  await expect(page.getByRole('status')).toHaveText(/Range August 12, 2026 to August 20, 2026/);
  await expect(page.locator(cell('Sunday, August 16, 2026'))).not.toHaveAttribute('data-preview');
});

test('two panels share one roving day and select across the seam', async ({ page }) => {
  await page.goto(TWO_MONTHS);

  await expect(page.getByRole('grid', { name: /august 2026/i })).toBeVisible();
  await expect(page.getByRole('grid', { name: /september 2026/i })).toBeVisible();
  await expect(page.locator('button[tabindex="0"][data-date]')).toHaveCount(1);

  await page.getByRole('button', { name: /^Thursday, August 27, 2026/ }).click();
  // The September panel owns the second copy of 3 September.
  await page
    .getByRole('button', { name: /^Thursday, September 3, 2026/ })
    .nth(1)
    .click();

  await expect(page.getByRole('status')).toHaveText(/Range August 27, 2026 to September 3, 2026/);
  await expect(page.locator(cell('Tuesday, September 1, 2026')).first()).toHaveAttribute(
    'data-in-range',
  );
});

test('walking off the last panel pages both months', async ({ page }) => {
  await page.goto(TWO_MONTHS);

  await page.getByRole('button', { name: /^Wednesday, September 30, 2026/ }).focus();
  await page.keyboard.press('ArrowRight');

  await expect(page.getByRole('grid', { name: /september 2026/i })).toBeVisible();
  const october = page.getByRole('grid', { name: /october 2026/i });
  await expect(october).toBeVisible();
  // 1 October also shows as a trailing day of September, so scope the check to
  // the panel that owns it — the one the roving tabindex moved to.
  await expect(october.getByRole('button', { name: /^Thursday, October 1, 2026/ })).toBeFocused();
});

test('maxRange greys out days that would overshoot while drawing', async ({ page }) => {
  await page.goto(LIMITS);

  await page.getByRole('button', { name: /^Monday, August 10, 2026/ }).click();

  const overshoot = page.getByRole('button', { name: /^Tuesday, August 25, 2026/ });
  await expect(overshoot).toHaveAttribute('aria-disabled', 'true');
  // pointer-events: none makes the click land on the cell, not the day.
  await overshoot.click({ force: true });
  await expect(page.getByRole('status')).toHaveText(/Choose an end date/);

  await page.getByRole('button', { name: /^Sunday, August 23, 2026/ }).click();
  await expect(page.getByRole('status')).toHaveText(/Range August 10, 2026 to August 23, 2026/);
});
