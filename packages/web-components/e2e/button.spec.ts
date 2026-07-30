import { expect, test } from '@playwright/test';

test('button preserves keyboard form submission and host focus', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-button--interactive');

  const control = page.getByRole('button', { name: 'Save changes' });
  await control.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByText('Submitted Save changes.')).toBeVisible();

  await page.locator('gnome-button').evaluate((button) => {
    button.focus();
  });
  await expect(control).toBeFocused();
});

test('button loading state disables activation and restores native state', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-button--interactive');

  const host = page.locator('gnome-button');
  const control = page.getByRole('button', { name: 'Save changes' });

  await host.evaluate((button) => {
    button.setAttribute('loading', '');
  });

  await expect(host).toHaveAttribute('data-state', 'loading');
  await expect(control).toBeDisabled();
  await expect(control).toHaveAttribute('aria-busy', 'true');

  await host.evaluate((button) => {
    button.removeAttribute('loading');
  });

  await expect(host).toHaveAttribute('data-state', 'ready');
  await expect(control).toBeEnabled();
  await expect(control).not.toHaveAttribute('aria-busy');
});
