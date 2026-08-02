import { expect, test } from '@playwright/test';

test('icon button exposes an accessible name and activates on click', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-icon-button--interactive');

  const control = page.getByRole('button', { name: 'Add item' });
  await control.click();

  await expect(page.getByText('Activated "Add item".')).toBeVisible();
});

test('icon button loading state disables activation', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-icon-button--interactive');

  const host = page.locator('gnome-icon-button');
  const control = page.getByRole('button', { name: 'Add item' });

  await host.evaluate((iconButton) => {
    iconButton.setAttribute('loading', '');
  });

  await expect(host).toHaveAttribute('data-state', 'loading');
  await expect(control).toBeDisabled();
  await expect(control).toHaveAttribute('aria-busy', 'true');

  await host.evaluate((iconButton) => {
    iconButton.removeAttribute('loading');
  });

  await expect(host).toHaveAttribute('data-state', 'ready');
  await expect(control).toBeEnabled();
  await expect(control).not.toHaveAttribute('aria-busy');
});
