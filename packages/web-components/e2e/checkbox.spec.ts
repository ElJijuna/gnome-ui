import { expect, test } from '@playwright/test';

test('checkbox toggles via keyboard and reports state through the native control', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-checkbox--interactive');

  const control = page.getByRole('checkbox', { name: 'Select item' });
  await control.focus();
  await expect(control).not.toBeChecked();

  await page.keyboard.press('Space');
  await expect(control).toBeChecked();
  await expect(page.getByText('Select item: checked.')).toBeVisible();

  await page.keyboard.press('Space');
  await expect(control).not.toBeChecked();
  await expect(page.getByText('Select item: unchecked.')).toBeVisible();
});

test('indeterminate state is applied to the native control and clears on user interaction', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-checkbox--indeterminate');

  const control = page.getByRole('checkbox', { name: 'Select all' });
  await expect(control).toHaveJSProperty('indeterminate', true);

  await control.click();
  await expect(control).toHaveJSProperty('indeterminate', false);
  await expect(control).toBeChecked();
});

test('disabled checkbox cannot be toggled', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-checkbox--disabled');

  const host = page.locator('gnome-checkbox');
  const control = page.getByRole('checkbox', { name: 'Read-only option' });

  await expect(host).toHaveAttribute('data-state', 'disabled');
  await expect(control).toBeDisabled();

  await host.evaluate((element) => {
    element.removeAttribute('disabled');
  });

  await expect(control).toBeEnabled();
  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).toBeChecked();
});
