import { expect, test } from '@playwright/test';

test('switch row toggles on click anywhere in the row and reports the new state', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-switch-row--interactive');

  const row = page.getByRole('switch', { name: 'Notifications' });
  await expect(row).toHaveAttribute('aria-checked', 'false');

  await row.click();
  await expect(row).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('Checked: true')).toBeVisible();

  await row.click();
  await expect(row).toHaveAttribute('aria-checked', 'false');
});

test('switch row activates with the keyboard (native button semantics)', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-switch-row--interactive');

  const row = page.getByRole('switch', { name: 'Notifications' });
  await row.focus();
  await page.keyboard.press('Space');

  await expect(row).toHaveAttribute('aria-checked', 'true');
});

test('disabled switch row cannot be toggled', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-switch-row--disabled');

  const row = page.getByRole('switch', { name: 'Notifications' });
  await expect(row).toBeDisabled();
});
