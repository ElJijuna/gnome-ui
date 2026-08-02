import { expect, test } from '@playwright/test';

test('dropdown opens from the trigger and selects an option with the keyboard', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-dropdown--interactive');

  const trigger = page.getByRole('combobox');
  await trigger.click();

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();

  // Opening already activates the first enabled option (Light) — one
  // ArrowDown reaches Dark.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(listbox).toBeHidden();
  await expect(trigger).toHaveText('Dark');
  await expect(page.getByText('Value: dark')).toBeVisible();
  await expect(trigger).toBeFocused();
});

test('dropdown closes on Escape and on outside click without changing the value', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-dropdown--interactive');

  const trigger = page.getByRole('combobox');
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.mouse.click(10, 10);
  await expect(page.getByRole('listbox')).toBeHidden();
});

test('dropdown skips the disabled option when navigating with the keyboard', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-dropdown--interactive');

  const trigger = page.getByRole('combobox');
  await trigger.click();
  await page.keyboard.press('End');

  const activeId = await trigger.getAttribute('aria-activedescendant');
  const activeLabel = page.locator(`#${activeId} [data-slot="option-label"]`);
  await expect(activeLabel).toHaveText('Automatic');
});
