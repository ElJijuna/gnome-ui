import { expect, test } from '@playwright/test';

test('switch toggles via keyboard and reports state through the native control', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-switch--interactive');

  const control = page.getByRole('switch', { name: 'Wi-Fi' });
  await control.focus();
  await expect(control).not.toBeChecked();

  await page.keyboard.press('Space');
  await expect(control).toBeChecked();
  await expect(page.getByText('Wi-Fi: on.')).toBeVisible();

  await page.keyboard.press('Space');
  await expect(control).not.toBeChecked();
  await expect(page.getByText('Wi-Fi: off.')).toBeVisible();
});

test('disabled switch cannot be toggled', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-switch--disabled');

  const host = page.locator('gnome-switch');
  const control = page.getByRole('switch', { name: 'Bluetooth' });

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
