import { expect, test } from '@playwright/test';

// RadioButton is a bare <input type="radio">, so everything that makes a radio
// group behave like one — mutual exclusion by shared `name`, arrow keys cycling
// the group, and the group counting as a single tab stop — is implemented by
// the browser, not by this component. jsdom implements none of it, which is
// exactly why RadioButton.test.tsx cannot cover any of it.

test('arrow keys cycle the group and move the selection', async ({ page }) => {
  await page.goto('/iframe.html?id=components-radiobutton--group');

  const never = page.getByRole('radio', { name: 'Never' });
  const weekly = page.getByRole('radio', { name: 'Weekly' });
  const daily = page.getByRole('radio', { name: 'Daily (recommended)' });

  await expect(daily).toBeChecked();

  await daily.focus();
  await page.keyboard.press('ArrowDown');

  // Native radio navigation wraps from the last option back to the first.
  await expect(never).toBeFocused();
  await expect(never).toBeChecked();
  await expect(daily).not.toBeChecked();

  await page.keyboard.press('ArrowDown');
  await expect(weekly).toBeChecked();
  await expect(never).not.toBeChecked();
});

test('the whole group is a single tab stop anchored on the checked option', async ({ page }) => {
  await page.goto('/iframe.html?id=components-radiobutton--group');

  const daily = page.getByRole('radio', { name: 'Daily (recommended)' });
  await expect(daily).toBeChecked();

  await page.keyboard.press('Tab');
  await expect(daily).toBeFocused();

  // Tabbing again must leave the group entirely rather than visiting the
  // other two radios.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Never' })).not.toBeFocused();
  await expect(page.getByRole('radio', { name: 'Weekly' })).not.toBeFocused();
});

test('clicking a label selects its radio and deselects the sibling', async ({ page }) => {
  await page.goto('/iframe.html?id=components-radiobutton--group');

  const weekly = page.getByRole('radio', { name: 'Weekly' });
  const daily = page.getByRole('radio', { name: 'Daily (recommended)' });

  await page.getByText('Weekly', { exact: true }).click();

  await expect(weekly).toBeChecked();
  await expect(daily).not.toBeChecked();
});
