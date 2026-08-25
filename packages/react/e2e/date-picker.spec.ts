import { expect, test } from '@playwright/test';

// DatePicker composes Popover + Calendar. The behaviours worth a real browser
// are all focus/portal timing that jsdom cannot reproduce: on open the calendar
// must win the focus race against Popover (which otherwise parks focus on the
// month-nav button), and on close/select focus must return to the trigger.

const PRESELECTED = '/iframe.html?id=components-datepicker--preselected';
const trigger = 'button[aria-haspopup="dialog"]';

test('opening lands focus on the selected day, not the month-nav button', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // autoFocus + double-rAF must beat Popover's first-focusable grab.
  await expect(page.getByRole('button', { name: 'Saturday, August 15, 2026' })).toBeFocused();
});

test('selecting a day closes the popover, updates the trigger, and restores focus', async ({
  page,
}) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('button', { name: 'Thursday, August 20, 2026' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator(trigger)).toContainText('Aug 20, 2026');
  await expect(page.locator(trigger)).toBeFocused();
});

test('keyboard: ArrowDown opens, arrows move, Enter selects', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).focus();
  await page.keyboard.press('ArrowDown'); // open
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Saturday, August 15, 2026' })).toBeFocused();

  await page.keyboard.press('ArrowRight'); // 16
  await page.keyboard.press('ArrowDown'); // 23
  await expect(page.getByRole('button', { name: 'Sunday, August 23, 2026' })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator(trigger)).toContainText('Aug 23, 2026');
});

test('Escape closes the popover and returns focus to the trigger', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator(trigger)).toBeFocused();
});

test('clicking outside closes the popover', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.mouse.click(5, 5);
  await expect(page.getByRole('dialog')).toBeHidden();
});
