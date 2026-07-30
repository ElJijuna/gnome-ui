import { expect, test } from '@playwright/test';

test('increment and decrement buttons step the native control', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-spin-button--interactive');

  const control = page.getByRole('spinbutton', { name: 'Volume' });
  const increment = page.locator('[data-slot="spin-button-increment"]');
  const decrement = page.locator('[data-slot="spin-button-decrement"]');

  await expect(control).toHaveValue('5');

  await increment.click();
  await expect(control).toHaveValue('6');
  await expect(page.getByText('Volume: 6.')).toBeVisible();

  await decrement.click();
  await expect(control).toHaveValue('5');
});

test('native ArrowUp keeps working and increment disables at max', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-spin-button--at-max');

  const control = page.getByRole('spinbutton', { name: 'Volume' });
  const increment = page.locator('[data-slot="spin-button-increment"]');

  await expect(control).toHaveValue('10');
  await expect(increment).toBeDisabled();

  await control.focus();
  await page.keyboard.press('ArrowDown');
  await expect(control).toHaveValue('9');
  await expect(increment).toBeEnabled();
});

test('disabled spin button disables the control and both step buttons', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-spin-button--disabled');

  const control = page.getByRole('spinbutton', { name: 'Volume' });
  const increment = page.locator('[data-slot="spin-button-increment"]');
  const decrement = page.locator('[data-slot="spin-button-decrement"]');

  await expect(control).toBeDisabled();
  await expect(increment).toBeDisabled();
  await expect(decrement).toBeDisabled();
});
