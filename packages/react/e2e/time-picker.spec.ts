import { expect, test } from '@playwright/test';

// TimePicker composes Popover + SpinButtons. The browser-only concerns: on open
// focus must reach the first spinner (Popover leaves the panel hidden until it
// is positioned, and hidden elements cannot take focus), Tab must move between
// spinner columns, and values must update the trigger live as the spinners move.

const PRESELECTED = '/iframe.html?id=components-timepicker--preselected'; // 14:30, 24h
const TWELVE = '/iframe.html?id=components-timepicker--twelve-hour'; // 09:05, 12h
const trigger = 'button[aria-haspopup="dialog"]';

test('opening lands focus on the hours spinner', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Hours' })).toBeFocused();
});

test('arrowing a spinner updates the trigger live', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await page.getByRole('spinbutton', { name: 'Minutes' }).focus();
  await page.keyboard.press('ArrowUp');

  await expect(page.getByRole('spinbutton', { name: 'Minutes' })).toHaveAttribute(
    'aria-valuetext',
    '31',
  );
  await expect(page.locator(trigger)).toContainText('14:31');
});

test('Tab moves between the hour and minute columns', async ({ page }) => {
  await page.goto(PRESELECTED);

  await page.locator(trigger).click();
  await expect(page.getByRole('spinbutton', { name: 'Hours' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('spinbutton', { name: 'Minutes' })).toBeFocused();
});

test('12-hour: stepping the AM/PM column flips the period in the trigger', async ({ page }) => {
  await page.goto(TWELVE);

  await page.locator(trigger).click();
  await expect(page.locator(trigger)).toContainText('AM');

  await page.getByRole('spinbutton', { name: 'AM/PM' }).focus();
  await page.keyboard.press('ArrowUp');

  await expect(page.getByRole('spinbutton', { name: 'AM/PM' })).toHaveAttribute(
    'aria-valuetext',
    'PM',
  );
  await expect(page.locator(trigger)).toContainText('PM');
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
