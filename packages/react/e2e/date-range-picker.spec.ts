import { expect, test } from '@playwright/test';

// DateRangePicker composes Popover + CalendarRange. What needs a real browser is
// the focus and layering choreography: the calendar must win the focus race
// against Popover on open, the popover must survive the first of the two clicks,
// and Escape has three things to unwind in order (drill-down, pending range,
// popover) — none of which jsdom can reproduce faithfully.

const PRESELECTED = '/iframe.html?id=components-daterangepicker--preselected';
const WITH_PRESETS = '/iframe.html?id=components-daterangepicker--with-presets';
const trigger = 'button[aria-haspopup="dialog"]';

test('opening lands focus on the range start, not the month-nav button', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Two panels, and autoFocus beats Popover's first-focusable grab.
  await expect(page.getByRole('grid')).toHaveCount(2);
  await expect(
    page.getByRole('button', { name: /^Monday, August 10, 2026, start of range/ }),
  ).toBeFocused();
});

test('the popover survives the first click and closes on the second', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('button', { name: /^Tuesday, August 4, 2026/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(/Choose an end date/);

  // The band previews under the pointer while the popover stays open.
  await page.getByRole('button', { name: /^Friday, August 7, 2026/ }).hover();
  await expect(
    page.locator('[role="gridcell"]:has(button[aria-label^="Thursday, August 6, 2026"])').first(),
  ).toHaveAttribute('data-preview');

  await page.getByRole('button', { name: /^Friday, August 7, 2026/ }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator(trigger)).toContainText('Aug 4, 2026 – Aug 7, 2026');
  await expect(page.locator(trigger)).toBeFocused();
});

test('keyboard: ArrowDown opens, arrows move, two Enters commit', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Enter'); // anchor on 10 Aug
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Enter'); // commit 10 → 12 Aug
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator(trigger)).toContainText('Aug 10, 2026 – Aug 12, 2026');
  await expect(page.locator(trigger)).toBeFocused();
});

test('Escape unwinds one layer at a time', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // 1. the drill-down.
  await page.getByRole('button', { name: /choose a month/i }).click();
  await expect(page.getByRole('grid', { name: /select a month/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('grid', { name: /august 2026/i })).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();

  // 2. the half-made range.
  await page.getByRole('button', { name: /^Tuesday, August 4, 2026/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('status')).not.toHaveText(/Choose an end date/);
  await expect(page.getByRole('dialog')).toBeVisible();

  // 3. the popover itself.
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator(trigger)).toBeFocused();
});

test('a preset commits the range and closes', async ({ page }) => {
  await page.goto(WITH_PRESETS);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('group', { name: 'Range shortcuts' }).getByText('Last 7 days').click();

  await expect(page.getByRole('dialog')).toBeHidden();
  // Seven days ending today, whatever today is.
  const expected = await page.evaluate(() => {
    const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  });
  await expect(page.locator(trigger)).toContainText(expected);
});

test('clicking outside closes without committing', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /^Tuesday, August 4, 2026/ }).click();

  await page.mouse.click(5, 5);

  await expect(page.getByRole('dialog')).toBeHidden();
  // The half-made range never reached the trigger.
  await expect(page.locator(trigger)).toContainText('Aug 10, 2026 – Aug 19, 2026');
});
