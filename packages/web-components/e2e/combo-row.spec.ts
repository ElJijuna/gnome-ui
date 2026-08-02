import { expect, test } from '@playwright/test';

test('combo row nested dropdown opens, selects, and reports the new value', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-combo-row--interactive');

  const trigger = page.getByRole('combobox');
  await trigger.click();
  await page.getByRole('option', { name: 'Light' }).click();

  await expect(trigger).toHaveText('Light');
  await expect(page.getByText('Value: light')).toBeVisible();
});

test('disabling the row disables the nested dropdown trigger', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-combo-row--disabled');

  const trigger = page.getByRole('combobox');
  await expect(trigger).toBeDisabled();
});
