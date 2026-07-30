import { expect, test } from '@playwright/test';

test('label and hint are wired to the control and native typing works', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-text-field--interactive');

  const control = page.getByRole('textbox', { name: 'Username' });
  await expect(control).toHaveAttribute('aria-describedby', /.+/);
  await expect(control).toHaveAccessibleDescription('Choose a unique handle.');

  await control.click();
  await control.fill('octocat');
  await expect(control).toHaveValue('octocat');
});

test('invalid state sets aria-invalid on the control', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-text-field--invalid');

  const control = page.getByRole('textbox', { name: 'Username' });
  await expect(control).toHaveAttribute('aria-invalid', 'true');
});

test('disabled field disables the native control', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-text-field--disabled');

  const host = page.locator('gnome-text-field');
  const control = page.getByRole('textbox', { name: 'Username' });

  await expect(host).toHaveAttribute('data-disabled', '');
  await expect(control).toBeDisabled();
});
