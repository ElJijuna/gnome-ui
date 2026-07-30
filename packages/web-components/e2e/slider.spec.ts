import { expect, test } from '@playwright/test';

test('keyboard arrows and Home/End move the native control', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-slider--interactive');

  const control = page.getByRole('slider', { name: 'Brightness' });
  await expect(control).toHaveValue('50');

  await control.focus();
  await page.keyboard.press('ArrowRight');
  await expect(control).toHaveValue('51');
  await expect(page.getByText('Brightness: 51.')).toBeVisible();

  await page.keyboard.press('Home');
  await expect(control).toHaveValue('0');

  await page.keyboard.press('End');
  await expect(control).toHaveValue('100');
});

test('disabled slider disables the native control', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-slider--disabled');

  const host = page.locator('gnome-slider');
  const control = page.getByRole('slider', { name: 'Brightness' });

  await expect(host).toHaveAttribute('data-disabled', '');
  await expect(control).toBeDisabled();
});
