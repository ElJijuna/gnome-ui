import { expect, test } from '@playwright/test';

test('tab bar moves focus with arrow keys, skipping the disabled tab', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tab-bar--interactive');

  const general = page.getByRole('tab', { name: 'General' });
  const notifications = page.getByRole('tab', { name: 'Notifications' });
  const advanced = page.getByRole('tab', { name: 'Advanced' });

  await general.focus();
  await page.keyboard.press('ArrowRight');
  await expect(notifications).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(advanced).toBeFocused();

  await page.keyboard.press('End');
  await expect(advanced).toBeFocused();

  await page.keyboard.press('Home');
  await expect(general).toBeFocused();
});

test('clicking a tab updates aria-selected and the roving tabindex', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tab-bar--interactive');

  const general = page.getByRole('tab', { name: 'General' });
  const notifications = page.getByRole('tab', { name: 'Notifications' });

  await expect(general).toHaveAttribute('aria-selected', 'true');
  await expect(general).toHaveAttribute('tabindex', '0');

  await notifications.click();

  await expect(notifications).toHaveAttribute('aria-selected', 'true');
  await expect(general).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByText('Selected: Notifications')).toBeVisible();
});
